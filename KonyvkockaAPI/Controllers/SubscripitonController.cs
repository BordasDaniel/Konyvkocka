using KonyvkockaAPI.DTO;
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

        /// <summary>
        /// Előfizetési információk
        /// GET /api/subscription/info
        /// </summary>
        [HttpGet("info")]
        public async Task<IActionResult> GetSubscriptionInfo()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var user = await _context.Users.FindAsync(userId);

                if (!user.Premium)
                {
                    return Ok(new
                    {
                        type = "free",
                        name = "Ingyenes",
                        message = "Nincs aktív előfizetés"
                    });
                }

                return Ok(new
                {
                    type = "premium",
                    name = "Premium előfizetés",
                    startDate = "2025-11-15",
                    endDate = "2026-01-15",
                    autoRenew = true,
                    price = "2.990 Ft/hó"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        /// <summary>
        /// Vásárlási előzmények
        /// GET /api/subscription/purchases
        /// </summary>
        [HttpGet("purchases")]
        public async Task<IActionResult> GetPurchases(
            [FromQuery] string? type = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var purchases = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.PurchaseDate)
                    .Skip(offset)
                    .Take(limit)
                    .Select(p => new
                    {
                        id = p.Id,
                        purchaseDate = p.PurchaseDate,
                        price = p.Price,
                        status = p.PurchaseStatus
                    })
                    .ToListAsync();

                var total = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .CountAsync();

                return Ok(new { purchases, total });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        /// <summary>
        /// Automatikus megújítás módosítása
        /// PUT /api/subscription/auto-renew
        /// </summary>
        [HttpPut("auto-renew")]
        public async Task<IActionResult> UpdateAutoRenew([FromBody] dynamic body)
        {
            try
            {
                bool autoRenew = body.autoRenew ?? false;
                // TODO: Implement actual auto-renew logic
                return Ok(new
                {
                    message = "Automatikus megújítás módosítva",
                    autoRenew
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}