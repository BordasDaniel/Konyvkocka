//using KonyvkockaAPI.DTO.Response;
//using KonyvkockaAPI.Models;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;

//namespace KonyvkockaAPI.Controllers
//{
//    [Route("[controller]")]
//    [ApiController]
//    [Authorize]
//    public class NotificationController : ControllerBase
//    {
//        private readonly KonyvkockaContext _context;

//        public NotificationController(KonyvkockaContext context)
//        {
//            _context = context;
//        }

//        /// <summary>
//        /// Értesítések lekérése
//        /// GET /api/notifications
//        /// </summary>
//        [HttpGet]
//        public async Task<IActionResult> GetNotifications(
//            [FromQuery] string? type = null,
//            [FromQuery] bool? isRead = null,
//            [FromQuery] int limit = 20,
//            [FromQuery] int offset = 0)
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

//                var query = _context.Mails.Where(m => m.ReceiverId == userId);

//                if (!string.IsNullOrEmpty(type) && type != "all")
//                    query = query.Where(m => m.Type.ToLower() == type.ToLower());

//                if (isRead.HasValue)
//                    query = query.Where(m => m.IsRead == isRead.Value);

//                var notifications = await query
//                    .OrderByDescending(m => m.CreatedAt)
//                    .Skip(offset)
//                    .Take(limit)
//                    .Select(m => new NotificationDTO
//                    {
//                        Id = m.Id,
//                        Type = m.Type.ToLower(),
//                        Title = m.Subject,
//                        Message = m.Message,
//                        Timestamp = m.CreatedAt.GetValueOrDefault(DateTime.MinValue),
//                        IsRead = m.IsRead.GetValueOrDefault(),
//                        Icon = MapTypeToIcon(m.Type)
//                    })
//                    .ToListAsync();

//                var total = await query.CountAsync();
//                var unreadCount = await _context.Mails
//                    .Where(m => m.ReceiverId == userId && m.IsRead != true)
//                    .CountAsync();

//                return Ok(new { notifications, unreadCount, total });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        /// <summary>
//        /// Értesítés olvasottnak jelölése
//        /// PUT /api/notifications/{notificationId}/read
//        /// </summary>
//        [HttpPut("{notificationId}/read")]
//        public async Task<IActionResult> MarkAsRead(int notificationId)
//        {
//            try
//            {
//                var notification = await _context.Mails.FindAsync(notificationId);
//                if (notification == null)
//                    return NotFound();

//                notification.IsRead = true;
//                await _context.SaveChangesAsync();

//                return Ok(new
//                {
//                    message = "Értesítés olvasottnak jelölve",
//                    notification = new { id = notificationId, isRead = true }
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        /// <summary>
//        /// Összes értesítés olvasottnak jelölése
//        /// PUT /api/notifications/read-all
//        /// </summary>
//        [HttpPut("read-all")]
//        public async Task<IActionResult> MarkAllAsRead()
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
//                var unreadMails = await _context.Mails
//                    .Where(m => m.ReceiverId == userId && m.IsRead != true)
//                    .ToListAsync();

//                foreach (var mail in unreadMails)
//                    mail.IsRead = true;

//                await _context.SaveChangesAsync();

//                return Ok(new
//                {
//                    message = "Minden értesítés olvasottnak jelölve",
//                    updatedCount = unreadMails.Count
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        /// <summary>
//        /// Értesítés törlése
//        /// DELETE /api/notifications/{notificationId}
//        /// </summary>
//        [HttpDelete("{notificationId}")]
//        public async Task<IActionResult> DeleteNotification(int notificationId)
//        {
//            try
//            {
//                var notification = await _context.Mails.FindAsync(notificationId);
//                if (notification == null)
//                    return NotFound();

//                _context.Mails.Remove(notification);
//                await _context.SaveChangesAsync();

//                return Ok(new { message = "Értesítés törölve" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        private static string MapTypeToIcon(string type)
//        {
//            return type.ToUpper() switch
//            {
//                "CHALLENGE" => "trophy",
//                "FRIEND" => "user",
//                "PURCHASE" => "credit-card",
//                "SYSTEM" => "bell",
//                _ => "mail"
//            };
//        }
//    }
//}