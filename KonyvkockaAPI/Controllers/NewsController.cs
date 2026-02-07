using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Mvc;

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
        /// GET /api/news/articles
        /// </summary>
        [HttpGet("articles")]
        public async Task<IActionResult> GetArticles(
            [FromQuery] string? type = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0)
        {
            try
            {
                // Mock data - TODO: Create News table if needed
                var articles = new List<NewsArticleDTO>
                {
                    new NewsArticleDTO
                    {
                        Id = 1,
                        Type = "event",
                        Title = "KönyvKocka 1.0 Launch Esemény",
                        Date = "2025.11.05.",
                        Tags = "Esemény",
                        Excerpt = "Ünnepeld velünk a KönyvKocka 1.0 megjelenését...",
                        Link = "/events",
                        LinkText = "További információ"
                    },
                    new NewsArticleDTO
                    {
                        Id = 2,
                        Type = "feature",
                        Title = "Új Megtekintés oldal",
                        Date = "2025.10.30.",
                        Tags = "Új funkció",
                        Excerpt = "Elkészült a watch oldal...",
                        Link = "/nezes",
                        LinkText = "Megnyitás"
                    }
                };

                if (!string.IsNullOrEmpty(type))
                {
                    articles = articles.Where(a => a.Type == type).ToList();
                }

                var total = articles.Count;
                var hasMore = offset + limit < total;
                var filtered = articles.Skip(offset).Take(limit).ToList();

                return Ok(new { articles = filtered, total, hasMore });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}