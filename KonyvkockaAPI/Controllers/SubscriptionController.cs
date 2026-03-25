using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
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

        public SubscriptionController(KonyvkockaContext context)
        {
            _context = context;
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

                if (!user.Premium)
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

    }
}
