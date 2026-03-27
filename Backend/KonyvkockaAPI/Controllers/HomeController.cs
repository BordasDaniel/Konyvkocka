using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/home")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public HomeController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/home
        // Fooldal kartyak lekerdezese:
        //   - Fresh:    3 legujabb tartalom (vegyes tipus, Released DESC)
        //   - Hot:      3 legujabb "Nepszeru" tag-gel rendelkezo tartalom
        //   - Carousel: 6 legujabb "Bestseller" tag-gel rendelkezo tartalom
        // Sorrend minden szekcioban: kiadasi ev (Released) DESC
        // ================================================================
        [HttpGet]
        public async Task<IActionResult> GetHomePage()
        {
            try
            {
                // FRISS tartalmak (3 db, Released DESC)
                var freshBooks = await _context.Books
                    .Include(b => b.Tags)
                    .OrderByDescending(b => b.Released)
                    .Take(3)
                    .Select(b => new HomeCardDTO
                    {
                        Id     = b.Id,
                        Type   = b.Type.ToLower(),
                        Title  = b.Title,
                        Img    = b.CoverApiName,
                        Year   = b.Released,
                        Rating = b.Rating,
                        Tags   = b.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var freshMovies = await _context.Movies
                    .Include(m => m.Tags)
                    .OrderByDescending(m => m.Released)
                    .Take(3)
                    .Select(m => new HomeCardDTO
                    {
                        Id     = m.Id,
                        Type   = "movie",
                        Title  = m.Title,
                        Img    = m.PosterApiName,
                        Year   = m.Released,
                        Rating = m.Rating,
                        Tags   = m.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var freshSeries = await _context.Series
                    .Include(s => s.Tags)
                    .OrderByDescending(s => s.Released)
                    .Take(3)
                    .Select(s => new HomeCardDTO
                    {
                        Id     = s.Id,
                        Type   = "series",
                        Title  = s.Title,
                        Img    = s.PosterApiName,
                        Year   = s.Released,
                        Rating = s.Rating,
                        Tags   = s.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var fresh = freshBooks
                    .Concat(freshMovies)
                    .Concat(freshSeries)
                    .OrderByDescending(c => c.Year)
                    .Take(3)
                    .ToList();

                // FELKAPOTT tartalmak (3 db, "Nepszeru" tag, Released DESC)
                var hotBooks = await _context.Books
                    .Include(b => b.Tags)
                    .Where(b => b.Tags.Any(t => t.Name == "N\u00e9pszer\u0171"))
                    .OrderByDescending(b => b.Released)
                    .Take(3)
                    .Select(b => new HomeCardDTO
                    {
                        Id     = b.Id,
                        Type   = b.Type.ToLower(),
                        Title  = b.Title,
                        Img    = b.CoverApiName,
                        Year   = b.Released,
                        Rating = b.Rating,
                        Tags   = b.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var hotMovies = await _context.Movies
                    .Include(m => m.Tags)
                    .Where(m => m.Tags.Any(t => t.Name == "N\u00e9pszer\u0171"))
                    .OrderByDescending(m => m.Released)
                    .Take(3)
                    .Select(m => new HomeCardDTO
                    {
                        Id     = m.Id,
                        Type   = "movie",
                        Title  = m.Title,
                        Img    = m.PosterApiName,
                        Year   = m.Released,
                        Rating = m.Rating,
                        Tags   = m.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var hotSeries = await _context.Series
                    .Include(s => s.Tags)
                    .Where(s => s.Tags.Any(t => t.Name == "N\u00e9pszer\u0171"))
                    .OrderByDescending(s => s.Released)
                    .Take(3)
                    .Select(s => new HomeCardDTO
                    {
                        Id     = s.Id,
                        Type   = "series",
                        Title  = s.Title,
                        Img    = s.PosterApiName,
                        Year   = s.Released,
                        Rating = s.Rating,
                        Tags   = s.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var hot = hotBooks
                    .Concat(hotMovies)
                    .Concat(hotSeries)
                    .OrderByDescending(c => c.Year)
                    .Take(3)
                    .ToList();

                // CAROUSEL tartalmak (6 db, "Bestseller" tag, Released DESC)
                var carouselBooks = await _context.Books
                    .Include(b => b.Tags)
                    .Where(b => b.Tags.Any(t => t.Name == "Bestseller"))
                    .OrderByDescending(b => b.Released)
                    .Take(6)
                    .Select(b => new HomeCarouselDTO
                    {
                        Id          = b.Id,
                        Type        = b.Type.ToLower(),
                        Title       = b.Title,
                        Img         = b.CoverApiName,
                        Year        = b.Released,
                        Description = b.Description,
                        Tags        = b.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var carouselMovies = await _context.Movies
                    .Include(m => m.Tags)
                    .Where(m => m.Tags.Any(t => t.Name == "Bestseller"))
                    .OrderByDescending(m => m.Released)
                    .Take(6)
                    .Select(m => new HomeCarouselDTO
                    {
                        Id          = m.Id,
                        Type        = "movie",
                        Title       = m.Title,
                        Img         = m.PosterApiName,
                        Year        = m.Released,
                        Description = m.Description,
                        Tags        = m.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var carouselSeries = await _context.Series
                    .Include(s => s.Tags)
                    .Where(s => s.Tags.Any(t => t.Name == "Bestseller"))
                    .OrderByDescending(s => s.Released)
                    .Take(6)
                    .Select(s => new HomeCarouselDTO
                    {
                        Id          = s.Id,
                        Type        = "series",
                        Title       = s.Title,
                        Img         = s.PosterApiName,
                        Year        = s.Released,
                        Description = s.Description,
                        Tags        = s.Tags.Select(t => t.Name).Take(2).ToList()
                    }).ToListAsync();

                var carousel = carouselBooks
                    .Concat(carouselMovies)
                    .Concat(carouselSeries)
                    .OrderByDescending(c => c.Year)
                    .Take(6)
                    .ToList();

                return Ok(new HomePageResponseDTO
                {
                    Fresh    = fresh,
                    Hot      = hot,
                    Carousel = carousel
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "HomePageError", Message = ex.Message });
            }
        }

    }
}