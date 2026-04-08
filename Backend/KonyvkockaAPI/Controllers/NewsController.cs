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
        /// Hírek lekérése paginációval
        /// GET /api/news?filter={type}&amp;page={page}&amp;pageSize={pageSize}
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNews(
            [FromQuery] string? filter   = "all",
            [FromQuery] int     page     = 1,
            [FromQuery] int     pageSize = 20)
        {
            try
            {
                var validFilters = new[] { "all", "update", "function", "announcement", "event" };
                if (!validFilters.Contains(filter?.ToLower()))
                {
                    return BadRequest(new { error = "Bad Request", message = "Érvénytelen szűrő típus" });
                }

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var query = _context.Articles.AsQueryable();

                if (filter?.ToLower() != "all")
                {
                    var eventTagFilter = filter?.ToUpper();
                    query = query.Where(a => a.EventTag == eventTagFilter);
                }

                var total = await query.CountAsync();

                var articles = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new NewsArticleDTO
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Date = a.CreatedAt.ToString("yyyy.MM.dd"),
                        Category = a.EventTag,
                        Description = a.Content
                    })
                    .ToListAsync();

                return Ok(new
                {
                    total,
                    page,
                    pageSize,
                    articles
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}