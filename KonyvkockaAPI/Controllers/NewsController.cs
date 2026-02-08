using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public NewsController(KonyvkockaContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Hírek lekérése
        /// GET /api/news?filter={type}
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNews([FromQuery] string? filter = "all")
        {
            try
            {
                // Érvényes szűrők: all, update, function, announcement, event
                var validFilters = new[] { "all", "update", "function", "announcement", "event" };
                if (!validFilters.Contains(filter?.ToLower()))
                {
                    return BadRequest(new { error = "Bad Request", message = "Érvénytelen szűrő típus" });
                }

                var query = _context.Articles.AsQueryable();

                // Szűrés EventTag alapján
                if (filter?.ToLower() != "all")
                {
                    var eventTagFilter = filter?.ToUpper();
                    query = query.Where(a => a.EventTag == eventTagFilter);
                }

                var articles = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new NewsArticleDTO
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Date = a.CreatedAt.ToString("yyyy.MM.dd"),
                        Category = a.EventTag,
                        Description = a.Content
                    })
                    .ToListAsync();

                return Ok(articles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}