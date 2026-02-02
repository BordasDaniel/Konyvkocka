using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KonyvkockaAPI.Controllers
{
    [ApiController]
    [Route("api/content")]
    public class ContentController : ControllerBase
    {
        private readonly IContentService _contentService;
        private readonly ILogger<ContentController> _logger;

        public ContentController(IContentService contentService, ILogger<ContentController> logger)
        {
            _contentService = contentService;
            _logger = logger;
        }

        /// <summary>
        /// 10.1 - Tartalmak keresése (könyvek, filmek, sorozatok)
        /// GET /api/content/search?q=inception&type=movie&limit=20&offset=0
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<ContentSearchResponseDTO>> SearchContent(
            [FromQuery] string q = "",
            [FromQuery] string type = "all",
            [FromQuery] string bookType = "",
            [FromQuery] int? genreId = null,
            [FromQuery] int? yearMin = null,
            [FromQuery] int? yearMax = null,
            [FromQuery] decimal? ratingMin = null,
            [FromQuery] int? ageRatingId = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0)
        {
            try
            {
                var results = await _contentService.SearchContent(
                    q, type, bookType, genreId, yearMin, yearMax, ratingMin, ageRatingId, limit, offset);

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Keresés hiba: {ex.Message}");
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "SearchError",
                    Message = "Keresés sikertelen",
                    StatusCode = 500
                });
            }
        }

        /// <summary>
        /// 10.2 - Tartalom részletei
        /// GET /api/content/book/3
        /// GET /api/content/movie/1
        /// GET /api/content/series/5
        /// </summary>
        [HttpGet("{type}/{id}")]
        [Authorize]  // JWT token szükséges (user library adatokhoz)
        public async Task<ActionResult<object>> GetContentDetails(string type, int id)
        {
            try
            {
                if (string.IsNullOrEmpty(type) || type != "book" && type != "movie" && type != "series")
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidType",
                        Message = "Érvénytelen tartalom típus. Lehetséges értékek: book, movie, series",
                        StatusCode = 400
                    });
                }

                var userId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var uid) ? uid : 0;
                var result = await _contentService.GetContentDetails(type, id, userId);

                if (result == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = $"Tartalom nem található (típus: {type}, ID: {id})",
                        StatusCode = 404
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Tartalom részlet hiba: {ex.Message}");
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "DetailError",
                    Message = "Részletek lekérése sikertelen",
                    StatusCode = 500
                });
            }
        }

        /// <summary>
        /// 10.3 - Kategória szerinti tartalmak (latest, popular, trending, etc.)
        /// GET /api/content/category/popular?type=movie&limit=10
        /// </summary>
        [HttpGet("category/{category}")]
        public async Task<ActionResult<ContentCategoryResultDTO>> GetContentByCategory(
            string category,
            [FromQuery] string type = "all",
            [FromQuery] int limit = 20)
        {
            try
            {
                if (string.IsNullOrEmpty(category))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidCategory",
                        Message = "Kategória szükséges",
                        StatusCode = 400
                    });
                }

                var result = await _contentService.GetContentByCategory(category, type, limit);

                if (result == null || (result.Items == null || result.Items.Count == 0))
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = $"Kategória nem található: {category}",
                        StatusCode = 404
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Kategória hiba: {ex.Message}");
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "CategoryError",
                    Message = "Kategória lekérése sikertelen",
                    StatusCode = 500
                });
            }
        }

        /// <summary>
        /// 10.4 - Tartalom értékelése
        /// POST /api/content/book/3/rate
        /// Body: { "rating": 5.0 }
        /// </summary>
        [HttpPost("{type}/{id}/rate")]
        [Authorize]
        public async Task<ActionResult<object>> RateContent(
            string type,
            int id,
            [FromBody] RateContentDTO dto)
        {
            try
            {
                if (dto == null || dto.Rating < 1 || dto.Rating > 5)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidRating",
                        Message = "Értékelés 1.0 és 5.0 között kell lennie",
                        StatusCode = 400
                    });
                }

                var userId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var uid) ? uid : 0;
                if (userId == 0)
                {
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Bejelentkezés szükséges",
                        StatusCode = 401
                    });
                }

                var result = await _contentService.RateContent(type, id, userId, dto.Rating);

                if (result == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = "Tartalom nem található a könyvtárban",
                        StatusCode = 404
                    });
                }

                return Ok(new { message = "Értékelés mentve", libraryItem = result });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Értékelés hiba: {ex.Message}");
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "RatingError",
                    Message = "Értékelés mentése sikertelen",
                    StatusCode = 500
                });
            }
        }

        /// <summary>
        /// 10.5 - Műfajok listája
        /// GET /api/genres
        /// </summary>
        [HttpGet("genres")]
        public async Task<ActionResult<List<GenreDTO>>> GetGenres()
        {
            try
            {
                var genres = await _contentService.GetGenres();
                return Ok(genres);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Műfajok hiba: {ex.Message}");
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "GenreError",
                    Message = "Műfajok lekérése sikertelen",
                    StatusCode = 500
                });
            }
        }

        /// <summary>
        /// 10.6 - Korhatár besorolások listája
        /// GET /api/age-ratings
        /// </summary>
        [HttpGet("age-ratings")]
        public async Task<ActionResult<List<AgeRatingDTO>>> GetAgeRatings()
        {
            try
            {
                var ageRatings = await _contentService.GetAgeRatings();
                return Ok(ageRatings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Korhatárok hiba: {ex.Message}");
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "AgeRatingError",
                    Message = "Korhatárok lekérése sikertelen",
                    StatusCode = 500
                });
            }
        }
    }
}
