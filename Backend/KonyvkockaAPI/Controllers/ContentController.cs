using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/content")]
    [ApiController]
    public class ContentController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public ContentController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/content/search
        // Tartalmak keresése könyvek, filmek, sorozatok között
        //
        // Filterek (mind opcionális, többszörös érték vesszővel):
        //   q           – keresési kifejezés (cím)
        //   type        – "all" | "book" | "movie" | "series" (vesszővel több)
        //   ageRatings  – korhatár nevek: "Minden,Gyerek,12+,16+,18+"
        //   tags        – tag nevek: "Akció,Kaland,Krimi,..."
        //   sort        – "relevancia" | "ertekeles" | "felkapott" | "megjelenes"
        //   limit       – max találat (alapért.: 20, max: 100)
        //   offset      – lapozás eltolása (alapért.: 0)
        //
        // Visszatérés: HomeCardDTO lista (ugyanolyan mint a főoldalon)
        // ================================================================
        [HttpGet("search")]
        public async Task<IActionResult> SearchContent(
            [FromQuery] string q          = "",
            [FromQuery] string type       = "all",
            [FromQuery] string ageRatings = "",
            [FromQuery] string tags       = "",
            [FromQuery] string sort       = "relevancia",
            [FromQuery] int    limit      = 20,
            [FromQuery] int    offset     = 0)
        {
            try
            {
                if (limit < 1 || limit > 100) limit = 20;
                if (offset < 0) offset = 0;

                var typeList      = string.IsNullOrWhiteSpace(type)       ? new[] { "all" }       : type.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Select(t => t.ToLower()).ToArray();
                var ageRatingList = string.IsNullOrWhiteSpace(ageRatings) ? Array.Empty<string>() : ageRatings.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var tagList       = string.IsNullOrWhiteSpace(tags)       ? Array.Empty<string>() : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                var includeAll    = typeList.Contains("all");
                var includeBooks  = includeAll || typeList.Contains("book") || typeList.Contains("books");
                var includeMovies = includeAll || typeList.Contains("movie") || typeList.Contains("movies");
                var includeSeries = includeAll || typeList.Contains("series");

                var results = new List<HomeCardDTO>();

                // ── KÖNYVEK ──────────────────────────────────────────────
                if (includeBooks)
                {
                    var bookQuery = _context.Books
                        .Include(b => b.AgeRating)
                        .Include(b => b.Tags)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        bookQuery = bookQuery.Where(b => b.Title.Contains(q));

                    if (ageRatingList.Length > 0)
                        bookQuery = bookQuery.Where(b => b.AgeRating != null && ageRatingList.Contains(b.AgeRating.Name));

                    if (tagList.Length > 0)
                    {
                        foreach (var tag in tagList)
                            bookQuery = bookQuery.Where(b => b.Tags.Any(t => t.Name == tag));
                    }

                    var bookCards = await bookQuery
                        .Select(b => new HomeCardDTO
                        {
                            Id        = b.Id,
                            Type      = b.Type.ToLower(),
                            Title     = b.Title,
                            Img       = b.CoverApiName,
                            Year      = b.Released,
                            Rating    = b.Rating,
                            AgeRating = b.AgeRating != null ? new AgeRatingDTO { Id = b.AgeRating.Id, Name = b.AgeRating.Name, MinAge = b.AgeRating.MinAge } : null,
                            Tags      = b.Tags.Select(t => t.Name).Take(2).ToList()
                        }).ToListAsync();

                    results.AddRange(bookCards);
                }

                // ── FILMEK ───────────────────────────────────────────────
                if (includeMovies)
                {
                    var movieQuery = _context.Movies
                        .Include(m => m.AgeRating)
                        .Include(m => m.Tags)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        movieQuery = movieQuery.Where(m => m.Title.Contains(q));

                    if (ageRatingList.Length > 0)
                        movieQuery = movieQuery.Where(m => m.AgeRating != null && ageRatingList.Contains(m.AgeRating.Name));

                    if (tagList.Length > 0)
                    {
                        foreach (var tag in tagList)
                            movieQuery = movieQuery.Where(m => m.Tags.Any(t => t.Name == tag));
                    }

                    var movieCards = await movieQuery
                        .Select(m => new HomeCardDTO
                        {
                            Id        = m.Id,
                            Type      = "movie",
                            Title     = m.Title,
                            Img       = m.PosterApiName,
                            Year      = m.Released,
                            Rating    = m.Rating,
                            AgeRating = m.AgeRating != null ? new AgeRatingDTO { Id = m.AgeRating.Id, Name = m.AgeRating.Name, MinAge = m.AgeRating.MinAge } : null,
                            Tags      = m.Tags.Select(t => t.Name).Take(2).ToList()
                        }).ToListAsync();

                    results.AddRange(movieCards);
                }

                // ── SOROZATOK ────────────────────────────────────────────
                if (includeSeries)
                {
                    var seriesQuery = _context.Series
                        .Include(s => s.AgeRating)
                        .Include(s => s.Tags)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        seriesQuery = seriesQuery.Where(s => s.Title.Contains(q));

                    if (ageRatingList.Length > 0)
                        seriesQuery = seriesQuery.Where(s => s.AgeRating != null && ageRatingList.Contains(s.AgeRating.Name));

                    if (tagList.Length > 0)
                    {
                        foreach (var tag in tagList)
                            seriesQuery = seriesQuery.Where(s => s.Tags.Any(t => t.Name == tag));
                    }

                    var seriesCards = await seriesQuery
                        .Select(s => new HomeCardDTO
                        {
                            Id        = s.Id,
                            Type      = "series",
                            Title     = s.Title,
                            Img       = s.PosterApiName,
                            Year      = s.Released,
                            Rating    = s.Rating,
                            AgeRating = s.AgeRating != null ? new AgeRatingDTO { Id = s.AgeRating.Id, Name = s.AgeRating.Name, MinAge = s.AgeRating.MinAge } : null,
                            Tags      = s.Tags.Select(t => t.Name).Take(2).ToList()
                        }).ToListAsync();

                    results.AddRange(seriesCards);
                }

                // ── RENDEZÉS ─────────────────────────────────────────────
                var sortNorm = sort.ToLower();
                results = sortNorm switch
                {
                    "ertekeles"  => results.OrderByDescending(r => r.Rating).ToList(),
                    "megjelenes" => results.OrderByDescending(r => r.Year).ToList(),
                    "felkapott"  => results.OrderByDescending(r => r.Rating).ThenByDescending(r => r.Year).ToList(),
                    _            => !string.IsNullOrWhiteSpace(q)
                                        ? results // relevancia – az SQL CONTAINS sorrend marad
                                        : results.OrderByDescending(r => r.Year).ToList()
                };

                var total = results.Count;
                var paged = results.Skip(offset).Take(limit).ToList();

                return Ok(new SearchResponseDTO
                {
                    Total  = total,
                    Limit  = limit,
                    Offset = offset,
                    Items  = paged
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "SearchError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/content/{type}/{id}
        // Tartalom egyszerű nézet (modal) – nem igényel bejelentkezést
        //
        // type: "book" | "movie" | "series"
        // ================================================================
        [HttpGet("{type}/{id}")]
        public async Task<IActionResult> GetContentDetails(string type, int id)
        {
            try
            {
                var normalizedType = type.ToLower();

                if (normalizedType is not ("book" or "movie" or "series"))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "InvalidType",
                        Message = "Érvénytelen típus. Lehetséges: book, movie, series"
                    });

                if (normalizedType == "book")
                {
                    var book = await _context.Books
                        .Include(b => b.AgeRating)
                        .Include(b => b.Tags)
                        .FirstOrDefaultAsync(b => b.Id == id);

                    if (book == null)
                        return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem található" });

                    var watchUrl = book.Type switch
                    {
                        "AUDIOBOOK" => book.AudioUrl,
                        "EBOOK"     => book.PdfUrl,
                        _           => book.PdfUrl
                    };

                    return Ok(new HomeModalDTO
                    {
                        Id          = book.Id,
                        Type        = book.Type.ToLower(),
                        Title       = book.Title,
                        Img         = book.CoverApiName,
                        Description = book.Description,
                        Rating      = book.Rating,
                        TrailerUrl  = null,
                        AgeRating   = book.AgeRating != null
                            ? new AgeRatingDTO { Id = book.AgeRating.Id, Name = book.AgeRating.Name, MinAge = book.AgeRating.MinAge }
                            : null,
                        Tags     = book.Tags.Select(t => t.Name).ToList(),
                        WatchUrl = watchUrl
                    });
                }

                if (normalizedType == "movie")
                {
                    var movie = await _context.Movies
                        .Include(m => m.AgeRating)
                        .Include(m => m.Tags)
                        .FirstOrDefaultAsync(m => m.Id == id);

                    if (movie == null)
                        return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem található" });

                    return Ok(new HomeModalDTO
                    {
                        Id          = movie.Id,
                        Type        = "movie",
                        Title       = movie.Title,
                        Img         = movie.PosterApiName,
                        Description = movie.Description,
                        Rating      = movie.Rating,
                        TrailerUrl  = movie.TrailerUrl,
                        AgeRating   = movie.AgeRating != null
                            ? new AgeRatingDTO { Id = movie.AgeRating.Id, Name = movie.AgeRating.Name, MinAge = movie.AgeRating.MinAge }
                            : null,
                        Tags     = movie.Tags.Select(t => t.Name).ToList(),
                        WatchUrl = movie.StreamUrl
                    });
                }

                // series
                {
                    var s = await _context.Series
                        .Include(x => x.AgeRating)
                        .Include(x => x.Tags)
                        .Include(x => x.Episodes)
                        .FirstOrDefaultAsync(x => x.Id == id);

                    if (s == null)
                        return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem található" });

                    return Ok(new HomeModalDTO
                    {
                        Id          = s.Id,
                        Type        = "series",
                        Title       = s.Title,
                        Img         = s.PosterApiName,
                        Description = s.Description,
                        Rating      = s.Rating,
                        TrailerUrl  = s.TrailerUrl,
                        AgeRating   = s.AgeRating != null
                            ? new AgeRatingDTO { Id = s.AgeRating.Id, Name = s.AgeRating.Name, MinAge = s.AgeRating.MinAge }
                            : null,
                        Tags     = s.Tags.Select(t => t.Name).ToList(),
                        WatchUrl = null,
                        Episodes = s.Episodes
                            .OrderBy(e => e.SeasonNum).ThenBy(e => e.EpisodeNum)
                            .Select(e => new EpisodeDTO
                            {
                                Id         = e.Id,
                                SeasonNum  = e.SeasonNum,
                                EpisodeNum = e.EpisodeNum,
                                Title      = e.Title,
                                StreamUrl  = e.StreamUrl,
                                Length     = e.Length
                            }).ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "DetailError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/content/genres
        // Összes elérhető műfaj (= tag) listája
        // ================================================================
        [HttpGet("tags")]
        public async Task<IActionResult> GetGenres()
        {
            try
            {
                var tags = await _context.Tags
                    .OrderBy(t => t.Name)
                    .Select(t => new TagItemDTO { Id = t.Id, Name = t.Name })
                    .ToListAsync();

                return Ok(tags);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "GenreError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/content/age-ratings
        // Összes korhatár besorolás listája
        // ================================================================
        [HttpGet("age-ratings")]
        public async Task<IActionResult> GetAgeRatings()
        {
            try
            {
                var ageRatings = await _context.AgeRatings
                    .OrderBy(a => a.MinAge)
                    .Select(a => new AgeRatingDTO { Id = a.Id, Name = a.Name, MinAge = a.MinAge })
                    .ToListAsync();

                return Ok(ageRatings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "AgeRatingError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/content/home
        // Főoldal kártyák lekérdezése:
        //   - Fresh:    3 legújabb tartalom (vegyes típus, Released DESC)
        //   - Hot:      3 legújabb "Népszerű" tag-gel rendelkező tartalom
        //   - Carousel: 6 legújabb "Bestseller" tag-gel rendelkező tartalom
        // ================================================================
        [HttpGet("home")]
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

                // FELKAPOTT tartalmak (3 db, "Népszerű" tag, Released DESC)
                var hotBooks = await _context.Books
                    .Include(b => b.Tags)
                    .Where(b => b.Tags.Any(t => t.Name == "Népszerű"))
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
                    .Where(m => m.Tags.Any(t => t.Name == "Népszerű"))
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
                    .Where(s => s.Tags.Any(t => t.Name == "Népszerű"))
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
