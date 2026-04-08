using System.ComponentModel.DataAnnotations;
using System.Globalization;
using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using KonyvkockaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubscriptionController : ControllerBase
    {
        private readonly KonyvkockaContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(
            KonyvkockaContext context,
            IEmailService emailService,
            ILogger<SubscriptionController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        // ================================================================
        // GET /api/subscription/info
        // Aktív előfizetés adatai – a user.Premium és PremiumExpiresAt alapján
        // ================================================================
        [HttpGet("info")]
        public async Task<IActionResult> GetSubscriptionInfo()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var user   = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var utcNow = DateTime.UtcNow;
                NormalizeExpiredPremium(user, utcNow);

                if (!IsPremiumActive(user, utcNow))
                {
                    return Ok(new SubscriptionInfoDTO
                    {
                        Type    = "free",
                        Name    = "Ingyenes"
                    });
                }

                return Ok(new SubscriptionInfoDTO
                {
                    Type      = "premium",
                    Name      = "Prémium",
                    ExpiresAt = user.PremiumExpiresAt
                });
            }
            catch (DbUpdateException ex)
            {
                var dbMessage = GetInnermostMessage(ex);
                return StatusCode(500, new ErrorResponseDTO { Error = "DatabaseError", Message = dbMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/subscription/purchases
        // A bejelentkezett user vásárlási előzményei
        //
        // Query paraméterek:
        //   page     – oldalszám (alapértelmezett: 1)
        //   pageSize – oldal mérete (alapértelmezett: 20, max: 100)
        // ================================================================
        [HttpGet("purchases")]
        public async Task<IActionResult> GetPurchases(
            [FromQuery] int page     = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var total = await _context.Purchases.CountAsync(p => p.UserId == userId);

                var purchases = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.PurchaseDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new PurchaseItemDTO
                    {
                        Id             = p.Id,
                        PurchaseDate   = p.PurchaseDate,
                        Price          = p.Price,
                        Tier           = p.Tier,
                        PurchaseStatus = p.PurchaseStatus
                    })
                    .ToListAsync();

                return Ok(new
                {
                    total,
                    page,
                    pageSize,
                    purchases
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // POST /api/subscription/purchase
        // Új előfizetés vásárlása
        //
        // Body: { "tier": "ONE_M" | "QUARTER_Y" | "FULL_Y" }
        //
        // Ha a felhasználó már aktív prémium előfizetéssel rendelkezik
        // (Premium == true ÉS PremiumExpiresAt > now), 409 Conflict-ot ad.
        // ================================================================
        [HttpPost("purchase")]
        public async Task<IActionResult> CreatePurchase([FromBody] CreatePurchaseDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var user   = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var utcNow = DateTime.UtcNow;
                if (NormalizeExpiredPremium(user, utcNow))
                {
                    await _context.SaveChangesAsync();
                }

                // Dupla előfizetés megakadályozása
                if (IsPremiumActive(user, utcNow))
                {
                    var until = user.PremiumExpiresAt.HasValue
                        ? $"{user.PremiumExpiresAt.Value:yyyy-MM-dd} napjáig"
                        : "lejárat nélkül";

                    return Conflict(new ErrorResponseDTO
                    {
                        Error   = "AlreadySubscribed",
                        Message = $"Már rendelkezel aktív prémium előfizetéssel ({until})."
                    });
                }

                // Tier validáció és ár/időtartam beállítás
                int price;
                int months;
                string tierLabel;
                switch (dto.Tier?.ToUpper())
                {
                    case "ONE_M":
                        price  = 2990;
                        months = 1;
                        tierLabel = "1 hónapos prémium";
                        break;
                    case "QUARTER_Y":
                        price  = 7490;
                        months = 3;
                        tierLabel = "3 hónapos prémium";
                        break;
                    case "FULL_Y":
                        price  = 24990;
                        months = 12;
                        tierLabel = "12 hónapos prémium";
                        break;
                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error   = "InvalidTier",
                            Message = "Érvénytelen előfizetési szint. Lehetséges: ONE_M, QUARTER_Y, FULL_Y"
                        });
                }

                var billingLastName = dto.LastName.Trim();
                var billingFirstName = dto.FirstName.Trim();
                var billingEmail = dto.BillingEmail.Trim();
                var billingPhone = dto.Phone?.Trim();
                var billingCountry = dto.Country.Trim();
                var billingZip = dto.Zip.Trim();
                var billingCity = dto.City.Trim();
                var billingAddress = dto.Address.Trim();

                if (string.IsNullOrWhiteSpace(billingLastName) ||
                    string.IsNullOrWhiteSpace(billingFirstName) ||
                    string.IsNullOrWhiteSpace(billingEmail) ||
                    string.IsNullOrWhiteSpace(billingCountry) ||
                    string.IsNullOrWhiteSpace(billingZip) ||
                    string.IsNullOrWhiteSpace(billingCity) ||
                    string.IsNullOrWhiteSpace(billingAddress))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "ValidationError",
                        Message = "A számlázási adatok hiányosak. Kérlek tölts ki minden kötelező mezőt."
                    });
                }

                var now = utcNow;

                var purchase = new Purchase
                {
                    UserId         = userId,
                    Price          = price,
                    Tier           = dto.Tier!.ToUpper(),
                    PurchaseStatus = "SUCCESS",
                    PurchaseDate   = now,
                    UpdatedAt      = now
                };

                _context.Purchases.Add(purchase);

                user.Premium          = true;
                user.PremiumExpiresAt = now.AddMonths(months);

                await _context.SaveChangesAsync();

                var emailSent = await _emailService.SendEmailAsync(
                    user.Email,
                    "Sikeres előfizetés - Konyvkocka",
                    BuildPurchaseConfirmationBody(
                        purchase.Id,
                        user.Username,
                        billingLastName,
                        billingFirstName,
                        billingEmail,
                        billingPhone,
                        billingCountry,
                        billingZip,
                        billingCity,
                        billingAddress,
                        tierLabel,
                        purchase.Tier,
                        purchase.Price,
                        purchase.PurchaseStatus,
                        now,
                        user.PremiumExpiresAt));

                if (!emailSent)
                {
                    _logger.LogWarning("Purchase email sending failed for user {UserId}", user.Id);
                }

                return Ok(new
                {
                    message    = "Sikeres előfizetés!",
                    purchaseId = purchase.Id,
                    tier       = purchase.Tier,
                    price      = purchase.Price,
                    expiresAt  = user.PremiumExpiresAt
                });
            }
            catch (DbUpdateException ex)
            {
                var dbMessage = GetInnermostMessage(ex);
                return StatusCode(500, new ErrorResponseDTO { Error = "DatabaseError", Message = dbMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        private static bool IsPremiumActive(User user, DateTime utcNow)
        {
            if (!user.Premium)
                return false;

            if (!user.PremiumExpiresAt.HasValue)
                return true;

            return user.PremiumExpiresAt.Value > utcNow;
        }

        private static bool NormalizeExpiredPremium(User user, DateTime utcNow)
        {
            if (user.Premium && user.PremiumExpiresAt.HasValue && user.PremiumExpiresAt.Value <= utcNow)
            {
                user.Premium = false;
                user.PremiumExpiresAt = null;
                return true;
            }

            return false;
        }

        private static string GetInnermostMessage(Exception exception)
        {
            var current = exception;
            while (current.InnerException != null)
            {
                current = current.InnerException;
            }

            return current.Message;
        }

        private static string BuildPurchaseConfirmationBody(
            int purchaseId,
            string username,
            string billingLastName,
            string billingFirstName,
            string billingEmail,
            string? billingPhone,
            string billingCountry,
            string billingZip,
            string billingCity,
            string billingAddress,
            string tierLabel,
            string tierCode,
            int? price,
            string? purchaseStatus,
            DateTime purchasedAtUtc,
            DateTime? expiresAtUtc)
        {
            var safeUsername = System.Net.WebUtility.HtmlEncode(username);
            var safePurchaseId = System.Net.WebUtility.HtmlEncode(purchaseId.ToString(CultureInfo.InvariantCulture));
            var safeBillingLastName = System.Net.WebUtility.HtmlEncode(billingLastName);
            var safeBillingFirstName = System.Net.WebUtility.HtmlEncode(billingFirstName);
            var safeBillingEmail = System.Net.WebUtility.HtmlEncode(billingEmail);
            var safeBillingPhone = System.Net.WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(billingPhone) ? "Nincs megadva" : billingPhone);
            var safeBillingCountry = System.Net.WebUtility.HtmlEncode(billingCountry);
            var safeBillingZip = System.Net.WebUtility.HtmlEncode(billingZip);
            var safeBillingCity = System.Net.WebUtility.HtmlEncode(billingCity);
            var safeBillingAddress = System.Net.WebUtility.HtmlEncode(billingAddress);
            var safeTierLabel = System.Net.WebUtility.HtmlEncode(tierLabel);
            var safeTierCode = System.Net.WebUtility.HtmlEncode(tierCode);
            var safeStatus = System.Net.WebUtility.HtmlEncode((purchaseStatus ?? "SUCCESS").ToUpperInvariant());

            var culture = CultureInfo.GetCultureInfo("hu-HU");
            var formattedPrice = (price ?? 0).ToString("N0", culture) + " Ft";
            var formattedPurchasedAt = purchasedAtUtc.ToString("yyyy.MM.dd HH:mm", culture) + " UTC";
            var formattedExpiresAt = expiresAtUtc.HasValue
                ? expiresAtUtc.Value.ToString("yyyy.MM.dd HH:mm", culture) + " UTC"
                : "Nincs lejárat";

            var safePrice = System.Net.WebUtility.HtmlEncode(formattedPrice);
            var safePurchasedAt = System.Net.WebUtility.HtmlEncode(formattedPurchasedAt);
            var safeExpiresAt = System.Net.WebUtility.HtmlEncode(formattedExpiresAt);

            return $@"
                <!doctype html>
                <html lang='hu'>
                <head>
                    <meta charset='utf-8' />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                </head>
                <body style='margin:0; padding:24px 12px; background:#0b0f16; font-family:Segoe UI,Arial,sans-serif;'>
                    <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0'>
                        <tr>
                            <td align='center'>
                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width:620px; background:linear-gradient(180deg,#121823 0%,#0d1118 100%); border:1px solid #263247; border-radius:16px; overflow:hidden;'>
                                    <tr>
                                        <td style='padding:24px 24px 12px;'>
                                            <table role='presentation' cellpadding='0' cellspacing='0' border='0' width='100%'>
                                                <tr>
                                                    <td align='left'>
                                                        <div style='display:inline-block; width:40px; height:40px; line-height:40px; text-align:center; border-radius:50%; background:#c29d59; color:#0f131a; font-weight:700;'>K</div>
                                                    </td>
                                                </tr>
                                            </table>
                                            <h1 style='margin:16px 0 8px; color:#f2f3f7; font-size:28px; line-height:1.25;'>Szia {safeUsername}!</h1>
                                            <p style='margin:0 0 8px; color:#d6dae2; font-size:16px; line-height:1.6;'>
                                                Sikeres előfizetés történt a Konyvkocka fiókodon.
                                            </p>
                                            <p style='margin:0 0 20px; color:#d6dae2; font-size:16px; line-height:1.6;'>
                                                Az alábbiakban találod a vásárlás részleteit.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding:0 24px 12px;'>
                                            <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='border:1px solid #2a3548; border-radius:10px; background:#0f141f;'>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Vásárlás azonosító</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>#{safePurchaseId}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Vezetéknév</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingLastName}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Keresztnév</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingFirstName}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Számlázási email</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingEmail}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Telefonszám</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingPhone}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Ország</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingCountry}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Irányítószám</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingZip}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Város</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingCity}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Cím</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeBillingAddress}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Csomag</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeTierLabel}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Tier kód</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safeTierCode}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Összeg</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safePrice}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Státusz</td>
                                                    <td style='padding:12px 14px; color:#e8cb95; font-size:13px; border-bottom:1px solid #223047; text-align:right; font-weight:700;'>{safeStatus}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px; border-bottom:1px solid #223047;'>Vásárlás ideje</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; border-bottom:1px solid #223047; text-align:right;'>{safePurchasedAt}</td>
                                                </tr>
                                                <tr>
                                                    <td style='padding:12px 14px; color:#9da8ba; font-size:13px;'>Lejárat</td>
                                                    <td style='padding:12px 14px; color:#f2f3f7; font-size:13px; text-align:right;'>{safeExpiresAt}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding:8px 24px 24px;'>
                                            <p style='margin:0; color:#8390a5; font-size:12px;'>Ha nem te indítottad ezt a vásárlást, kérlek azonnal lépj kapcsolatba az ügyfélszolgálattal.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>";
        }

    }
}
