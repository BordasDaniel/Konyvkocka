using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using KonyvkockaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly KonyvkockaContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly IEmailService _emailService;
        private readonly AppUrlSettings _appUrlSettings;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            KonyvkockaContext context,
            JwtSettings jwtSettings,
            IEmailService emailService,
            AppUrlSettings appUrlSettings,
            ILogger<AuthController> logger)
        {
            _context = context;
            _jwtSettings = jwtSettings;
            _emailService = emailService;
            _appUrlSettings = appUrlSettings;
            _logger = logger;
        }

        /// <summary>
        /// Session ellenőrzés – visszaadja a bejelentkezett user adatait
        /// GET /api/auth/me
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Érvénytelen vagy lejárt token"
                    });

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Érvénytelen vagy lejárt token"
                    });

                return Ok(BuildUserMeDTO(user));
            }
            catch (Exception)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = "A munkamenet ellenőrzése sikertelen"
                });
            }
        }

        /// <summary>
        /// Bejelentkezés
        /// POST /api/auth/login
        /// Body: AuthLoginDTO { Email, PasswordHash }
        /// A kliens SHA256(jelszó)-t küld, a szerver SHA256(clientHash + storedSalt)-ot ellenőriz
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthLoginDTO loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "InvalidCredentials",
                        Message = "Hibás email vagy jelszó"
                    });

                if (IsSuspendedPermissionLevel(user.PermissionLevel))
                    return StatusCode(403, new ErrorResponseDTO
                    {
                        Error = "AccountSuspended",
                        Message = "Sikertelen bejelentkezés: a felhasználói fiók fel van függesztve"
                    });

                string doubleHash = CreateSHA256(loginDto.PasswordHash + user.PasswordSalt);

                if (user.PasswordHash != doubleHash)
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "InvalidCredentials",
                        Message = "Hibás email vagy jelszó"
                    });

                if (!user.IsEmailVerified)
                    return StatusCode(403, new ErrorResponseDTO
                    {
                        Error = "EmailNotVerified",
                        Message = "A bejelentkezéshez előbb aktiválnod kell a fiókodat az emailben kapott linkkel"
                    });

                user.LastLoginDate = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new AuthResponseDTO
                {
                    User  = BuildUserMeDTO(user),
                    Token = GenerateJwtToken(user)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for email {Email}", loginDto.Email);
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = ex.InnerException?.Message ?? ex.Message
                });
            }
        }

        /// <summary>
        /// Regisztráció
        /// POST /api/auth/register
        /// Body: AuthRegisterDTO { Username, Email, PasswordHash, PasswordSalt }
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRegisterDTO registerDto)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "ValidationError",
                        Message = "A felhasználónév már használatban van"
                    });

                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "ValidationError",
                        Message = "Az email cím már használatban van"
                    });

                string doubleHash = CreateSHA256(registerDto.PasswordHash + registerDto.PasswordSalt);
                string emailVerificationToken = GenerateEmailVerificationToken();

                var user = new User
                {
                    Username         = registerDto.Username,
                    Email            = registerDto.Email,
                    IsEmailVerified  = false,
                    EmailVerificationTokenHash = CreateSHA256(emailVerificationToken),
                    EmailVerificationTokenExpiresAt = DateTime.Now.AddHours(24),
                    PasswordHash     = doubleHash,
                    PasswordSalt     = registerDto.PasswordSalt,
                    CountryCode      = "ZZ",
                    ProfilePic       = null,
                    Premium          = false,
                    PremiumExpiresAt = null,
                    CreationDate     = DateTime.Now,
                    LastLoginDate    = DateTime.Now,
                    Level            = 1,
                    Xp               = 0,
                    BookPoints       = 0,
                    SeriesPoints     = 0,
                    MoviePoints      = 0,
                    DayStreak        = 0,
                    ReadTimeMin      = 0,
                    WatchTimeMin     = 0,
                    PermissionLevel  = "USER"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var verificationLink = BuildEmailVerificationLink(user.Id, emailVerificationToken);
                var emailSent = await _emailService.SendEmailAsync(
                    user.Email,
                    "Aktiváld a Konyvkocka fiókodat",
                    BuildEmailVerificationBody(user.Username, verificationLink));

                if (!emailSent)
                {
                    _context.Users.Remove(user);
                    await _context.SaveChangesAsync();

                    return StatusCode(500, new ErrorResponseDTO
                    {
                        Error = "EmailSendFailed",
                        Message = "A megerősítő email küldése sikertelen volt. Kérlek próbáld újra később."
                    });
                }

                return StatusCode(201, new RegisterResponseDTO
                {
                    Message = "Sikeres regisztráció. Aktiváld a fiókodat az emailben kapott linkkel.",
                    RequiresEmailVerification = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed for email {Email}", registerDto.Email);
                return BadRequest(new ErrorResponseDTO
                {
                    Error = "ValidationError",
                    Message = "Hiba történt a regisztráció során"
                });
            }
        }

        /// <summary>
        /// Email cím megerősítése
        /// GET /api/auth/verify-email?userId=123&token=...
        /// </summary>
        [HttpGet("verify-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail([FromQuery] int userId, [FromQuery] string token)
        {
            if (userId <= 0 || string.IsNullOrWhiteSpace(token))
            {
                return BuildVerificationHtmlResponse(false, "Érvénytelen aktiváló link.", 400);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return BuildVerificationHtmlResponse(false, "Nem található felhasználó ehhez az aktiváló linkhez.", 404);
            }

            if (user.IsEmailVerified)
            {
                return BuildVerificationHtmlResponse(true, "Ez az email cím már aktiválva van.", 200);
            }

            if (string.IsNullOrWhiteSpace(user.EmailVerificationTokenHash) ||
                !user.EmailVerificationTokenExpiresAt.HasValue)
            {
                return BuildVerificationHtmlResponse(false, "Az aktiváló link már nem érvényes.", 400);
            }

            if (user.EmailVerificationTokenExpiresAt.Value < DateTime.Now)
            {
                return BuildVerificationHtmlResponse(false, "Az aktiváló link lejárt. Regisztrálj újra.", 400);
            }

            var incomingTokenHash = CreateSHA256(token);
            if (!string.Equals(user.EmailVerificationTokenHash, incomingTokenHash, StringComparison.Ordinal))
            {
                return BuildVerificationHtmlResponse(false, "Az aktiváló link hibás vagy lejárt.", 400);
            }

            user.IsEmailVerified = true;
            user.EmailVerifiedAt = DateTime.Now;
            user.EmailVerificationTokenHash = null;
            user.EmailVerificationTokenExpiresAt = null;

            await _context.SaveChangesAsync();
            return BuildVerificationHtmlResponse(true, "A fiókod aktiválása sikeres. Most már be tudsz jelentkezni.", 200);
        }

        /// <summary>
        /// Kijelentkezés – JWT alapú, a token törlése kliens oldalon történik
        /// POST /api/auth/logout
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok(new MessageResponseDTO { Message = "Sikeres kijelentkezés" });
        }

        /// <summary>
        /// DEBUG: Hash ellenőrzés – csak ADMIN érheti el, élesben törölni!
        /// POST /api/auth/debug-hash
        /// </summary>
        [HttpPost("debug-hash")]
        [Authorize]
        public async Task<IActionResult> DebugHash([FromBody] AuthLoginDTO loginDto)
        {
            if (User.FindFirst("permissionLevel")?.Value != "ADMIN")
                return Forbid();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
                return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

            string calculated = CreateSHA256(loginDto.PasswordHash + user.PasswordSalt);

            return Ok(new
            {
                email            = user.Email,
                storedSalt       = user.PasswordSalt,
                storedHash       = user.PasswordHash,
                clientSentHash   = loginDto.PasswordHash,
                serverCalculated = calculated,
                match            = user.PasswordHash == calculated
            });
        }

        #region Helpers

        private static UserMeDTO BuildUserMeDTO(User user) => new()
        {
            Id              = user.Id,
            Username        = user.Username,
            Email           = user.Email,
            Avatar          = user.ProfilePic != null ? Convert.ToBase64String(user.ProfilePic) : null,
            IsSubscriber    = user.Premium,
            PermissionLevel = user.PermissionLevel ?? "USER"
        };

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim("userId",          user.Id.ToString()),
                new Claim("premium",         user.Premium.ToString()),
                new Claim("permissionLevel", user.PermissionLevel ?? "USER"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecurityKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer:             _jwtSettings.Issuer,
                audience:           _jwtSettings.Audience,
                claims:             claims,
                expires:            DateTime.Now.AddMinutes(_jwtSettings.ExpirityMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string CreateSHA256(string input)
        {
            using SHA256 sha256 = SHA256.Create();
            byte[] data = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            var sb = new StringBuilder();
            foreach (byte b in data) sb.Append(b.ToString("x2"));
            return sb.ToString();
        }

        private static string GenerateEmailVerificationToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Base64UrlEncoder.Encode(bytes);
        }

        private string BuildEmailVerificationLink(int userId, string token)
        {
            var baseApiUrl = _appUrlSettings.ApiBaseUrl?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(baseApiUrl))
            {
                baseApiUrl = $"{Request.Scheme}://{Request.Host}";
            }

            return $"{baseApiUrl}/api/auth/verify-email?userId={userId}&token={Uri.EscapeDataString(token)}";
        }

        private static string BuildEmailVerificationBody(string username, string verificationLink)
        {
            var safeUsername = System.Net.WebUtility.HtmlEncode(username);
            var safeLink = System.Net.WebUtility.HtmlEncode(verificationLink);

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
                                                Köszönjük a regisztrációt a Konyvkocka oldalán.
                                            </p>
                                            <p style='margin:0 0 20px; color:#d6dae2; font-size:16px; line-height:1.6;'>
                                                A fiókod aktiválásához kattints az alábbi gombra:
                                            </p>
                                            <a href='{safeLink}' style='display:inline-block; padding:12px 20px; border-radius:10px; background:#c29d59; color:#0f131a; text-decoration:none; font-weight:700;'>
                                                Fiók aktiválása
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding:16px 24px 24px;'>
                                            <div style='padding:12px; border:1px solid #2a3548; border-radius:10px; background:#0f141f;'>
                                                <p style='margin:0 0 8px; color:#9da8ba; font-size:13px;'>Ha a gomb nem működik, másold be ezt a linket:</p>
                                                <a href='{safeLink}' style='color:#7bc4ff; font-size:13px; word-break:break-all; text-decoration:none;'>{safeLink}</a>
                                            </div>
                                            <p style='margin:14px 0 0; color:#8390a5; font-size:12px;'>A link 24 óráig érvényes.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>";
        }

        private IActionResult BuildVerificationHtmlResponse(bool success, string message, int statusCode)
        {
            var color = success ? "#c29d59" : "#f87171";
            var title = success ? "Sikeres aktiválás" : "Aktiválási hiba";
            var loginUrl = (_appUrlSettings.FrontendBaseUrl ?? string.Empty).TrimEnd('/') + "/belepes";

            var safeMessage = System.Net.WebUtility.HtmlEncode(message);
            var safeLoginUrl = System.Net.WebUtility.HtmlEncode(loginUrl);
            var statusPill = success ? "Siker" : "Hiba";

            var html = $@"
                <!doctype html>
                <html lang='hu'>
                <head>
                    <meta charset='utf-8' />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                    <title>{title}</title>
                </head>
                <body style='margin:0; background:radial-gradient(circle at 15% 10%, #1e293b 0%, #0b0f16 55%, #06090f 100%); font-family:Segoe UI,Arial,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px;'>
                    <main style='max-width:620px; width:100%; background:linear-gradient(180deg,#121823 0%,#0d1118 100%); border:1px solid #253044; border-radius:18px; padding:28px; box-shadow:0 24px 60px rgba(0,0,0,.45);'>
                        <span style='display:inline-block; margin-bottom:14px; padding:5px 10px; border-radius:999px; background:rgba(194,157,89,.14); color:#e8cb95; font-size:12px; letter-spacing:.04em; text-transform:uppercase;'>{statusPill}</span>
                        <h1 style='margin:0 0 10px; color:{color};'>{title}</h1>
                        <p style='margin:0 0 22px; color:#d6dae2; line-height:1.65;'>{safeMessage}</p>
                        <a href='{safeLoginUrl}' style='display:inline-block; background:#c29d59; color:#0f131a; text-decoration:none; font-weight:700; border-radius:10px; padding:11px 16px;'>
                            Ugrás a bejelentkezéshez
                        </a>
                    </main>
                </body>
                </html>";

            Response.StatusCode = statusCode;
            return Content(html, "text/html", Encoding.UTF8);
        }

        private static bool IsSuspendedPermissionLevel(string? permissionLevel)
        {
            var normalized = permissionLevel?.Trim().ToUpperInvariant();
            return normalized is "BANNED" or "SUSPENDED" or "RESTRICTED" or "KORLATOZOTT";
        }

        #endregion
    }
}
