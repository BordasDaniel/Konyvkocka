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
    public class NotificationController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public NotificationController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/notification
        // Bejelentkezett user értesítései (mail tábla, ReceiverId alapján)
        //
        // Query paraméterek:
        //   type     – szűrés típusra: ALL | SYSTEM | FRIEND | CHALLENGE | PURCHASE
        //   unread   – ha true, csak az olvasatlan üzenetek
        //   page     – oldalszám (alapértelmezett: 1)
        //   pageSize – oldal mérete (alapértelmezett: 20, max: 100)
        // ================================================================
        [HttpGet]
        public async Task<IActionResult> GetNotifications(
            [FromQuery] string? type     = null,
            [FromQuery] bool?   unread   = null,
            [FromQuery] int     page     = 1,
            [FromQuery] int     pageSize = 20)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var validTypes = new[] { "ALL", "SYSTEM", "FRIEND", "CHALLENGE", "PURCHASE" };
                var normalizedType = type?.ToUpper();

                if (normalizedType != null && !validTypes.Contains(normalizedType))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "InvalidParameter",
                        Message = $"Érvénytelen type érték. Lehetséges: {string.Join(", ", validTypes)}"
                    });

                var query = _context.Mails
                    .Where(m => m.ReceiverId == userId)
                    .Include(m => m.Sender)
                    .AsQueryable();

                // Típus szűrő – az "ALL" típusú üzenetek minden usernek szólnak,
                // ezért type=ALL paraméter esetén az összes üzenetet adjuk vissza
                if (normalizedType != null && normalizedType != "ALL")
                    query = query.Where(m => m.Type == normalizedType);

                // Olvasatlan szűrő
                if (unread == true)
                    query = query.Where(m => m.IsRead == false || m.IsRead == null);

                var total      = await query.CountAsync();
                var unreadCount = await _context.Mails
                    .CountAsync(m => m.ReceiverId == userId && (m.IsRead == false || m.IsRead == null));

                var notifications = await query
                    .OrderByDescending(m => m.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(m => new NotificationDTO
                    {
                        Id             = m.Id,
                        Type           = m.Type,
                        Subject        = m.Subject,
                        Message        = m.Message,
                        IsRead         = m.IsRead ?? false,
                        CreatedAt      = m.CreatedAt,
                        SenderUsername = m.Sender != null ? m.Sender.Username : null
                    })
                    .ToListAsync();

                return Ok(new
                {
                    total,
                    unreadCount,
                    page,
                    pageSize,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PATCH /api/notification/{id}/read
        // Egy értesítés olvasottnak jelölése
        // ================================================================
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var mail = await _context.Mails
                    .FirstOrDefaultAsync(m => m.Id == id && m.ReceiverId == userId);

                if (mail == null)
                    return NotFound(new ErrorResponseDTO
                    {
                        Error   = "NotFound",
                        Message = "Az értesítés nem található."
                    });

                if (mail.IsRead == true)
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "AlreadyRead",
                        Message = "Az értesítés már olvasottnak van jelölve."
                    });

                mail.IsRead = true;
                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO { Message = "Értesítés olvasottnak jelölve." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PATCH /api/notification/read-all
        // Az összes értesítés olvasottnak jelölése
        // ================================================================
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var unreadMails = await _context.Mails
                    .Where(m => m.ReceiverId == userId && (m.IsRead == false || m.IsRead == null))
                    .ToListAsync();

                foreach (var mail in unreadMails)
                    mail.IsRead = true;

                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO { Message = $"{unreadMails.Count} értesítés olvasottnak jelölve." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // DELETE /api/notification/{id}
        // Egy értesítés törlése
        // ================================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var mail = await _context.Mails
                    .FirstOrDefaultAsync(m => m.Id == id && m.ReceiverId == userId);

                if (mail == null)
                    return NotFound(new ErrorResponseDTO
                    {
                        Error   = "NotFound",
                        Message = "Az értesítés nem található."
                    });

                _context.Mails.Remove(mail);
                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO { Message = "Értesítés törölve." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}
