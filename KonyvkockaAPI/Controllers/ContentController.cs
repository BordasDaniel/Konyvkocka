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
        // Query paraméterek:
        //   q          – keresési kifejezés (cím)
        //   type       – "all" | "book" | "audiobook" | "ebook" | "movie" | "series"
        //   genreId    – szűrés műfaj ID alapján
        //   yearMin    – megjelenési év minimum
        //   yearMax    – megjelenési év maximum
        //   ratingMin  – minimum értékelés (0.0–10.0)
        //   ageRatingId – korhatár besorolás ID
        //   limit      – max találat (alapért.: 20, max: 100)
        //   offset     – lapozás eltolása (alapért.: 0)
        // ================================================================
        [HttpGet("search")]
        public async Task<IActionResult> SearchContent(
            [FromQuery] string  q           = "",
            [FromQuery] string  type        = "all",
            [FromQuery] int?    genreId     = null,
            [FromQuery] int?    yearMin     = null,
            [FromQuery] int?    yearMax     = null,
            [FromQuery] decimal? ratingMin  = null,
            [FromQuery] int?    ageRatingId = null,
            [FromQuery] int     limit       = 20,
            [FromQuery] int     offset      = 0)
        {
            try
            {
                if (limit < 1 || limit > 100) limit = 20;
                if (offset < 0) offset = 0;

                var normalized = type.ToLower();
                var books   = new List<ContentSearchItemDTO>();
                var movies  = new List<ContentSearchItemDTO>();
                var series  = new List<ContentSearchItemDTO>();

                // ── KÖNYVEK ──────────────────────────────────────────────
                if (normalized is "all" or "book" or "audiobook" or "ebook")
                {
                    var bookQuery = _context.Books
                        .Include(b => b.AgeRating)
                        .Include(b => b.Genres)
                        .Include(b => b.Authors)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        bookQuery = bookQuery.Where(b => b.Title.Contains(q));

                    if (normalized is "book" or "audiobook" or "ebook")
                        bookQuery = bookQuery.Where(b => b.Type == normalized.ToUpper());

                    if (genreId.HasValue)
                        bookQuery = bookQuery.Where(b => b.Genres.Any(g => g.Id == genreId));

                    if (yearMin.HasValue)
                        bookQuery = bookQuery.Where(b => b.Released >= yearMin);

                    if (yearMax.HasValue)
                        bookQuery = bookQuery.Where(b => b.Released <= yearMax);

                    if (ratingMin.HasValue)
                        bookQuery = bookQuery.Where(b => b.Rating >= ratingMin);

                    if (ageRatingId.HasValue)
                        bookQuery = bookQuery.Where(b => b.AgeRatingId == ageRatingId);

                    var bookResults = await bookQuery
                        .OrderByDescending(b => b.Rating)
                        .Skip(offset)
                        .Take(limit)
                        .ToListAsync();

                    books = bookResults.Select(b => new ContentSearchItemDTO
                    {
                        Id        = b.Id,
                        Type      = b.Type.ToLower(),
                        Title     = b.Title,
                        Img       = b.CoverApiName,
                        Year      = b.Released,
                        Rating    = b.Rating,
                        AgeRating = b.AgeRating != null ? new AgeRatingDTO { Id = b.AgeRating.Id, Name = b.AgeRating.Name, MinAge = b.AgeRating.MinAge } : null,
                        Genres    = b.Genres.Select(g => g.Name).ToList(),
                        Authors   = b.Authors.Select(a => a.Name).ToList(),
                        Length    = b.Type == "AUDIOBOOK" ? b.AudioLength : b.PageNum
                    }).ToList();
                }

                // ── FILMEK ───────────────────────────────────────────────
                if (normalized is "all" or "movie")
                {
                    var movieQuery = _context.Movies
                        .Include(m => m.AgeRating)
                        .Include(m => m.Genres)
                        .Include(m => m.Authors)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        movieQuery = movieQuery.Where(m => m.Title.Contains(q));

                    if (genreId.HasValue)
                        movieQuery = movieQuery.Where(m => m.Genres.Any(g => g.Id == genreId));

                    if (yearMin.HasValue)
                        movieQuery = movieQuery.Where(m => m.Released >= yearMin);

                    if (yearMax.HasValue)
                        movieQuery = movieQuery.Where(m => m.Released <= yearMax);

                    if (ratingMin.HasValue)
                        movieQuery = movieQuery.Where(m => m.Rating >= ratingMin);

                    if (ageRatingId.HasValue)
                        movieQuery = movieQuery.Where(m => m.AgeRatingId == ageRatingId);

                    var movieResults = await movieQuery
                        .OrderByDescending(m => m.Rating)
                        .Skip(offset)
                        .Take(limit)
                        .ToListAsync();

                    movies = movieResults.Select(m => new ContentSearchItemDTO
                    {
                        Id        = m.Id,
                        Type      = "movie",
                        Title     = m.Title,
                        Img       = m.PosterApiName,
                        Year      = m.Released,
                        Rating    = m.Rating,
                        AgeRating = m.AgeRating != null ? new AgeRatingDTO { Id = m.AgeRating.Id, Name = m.AgeRating.Name, MinAge = m.AgeRating.MinAge } : null,
                        Genres    = m.Genres.Select(g => g.Name).ToList(),
                        Authors   = m.Authors.Select(a => a.Name).ToList(),
                        Length    = m.Length
                    }).ToList();
                }

                // ── SOROZATOK ────────────────────────────────────────────
                if (normalized is "all" or "series")
                {
                    var seriesQuery = _context.Series
                        .Include(s => s.AgeRating)
                        .Include(s => s.Genres)
                        .Include(s => s.Authors)
                        .Include(s => s.Episodes)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        seriesQuery = seriesQuery.Where(s => s.Title.Contains(q));

                    if (genreId.HasValue)
                        seriesQuery = seriesQuery.Where(s => s.Genres.Any(g => g.Id == genreId));

                    if (yearMin.HasValue)
                        seriesQuery = seriesQuery.Where(s => s.Released >= yearMin);

                    if (yearMax.HasValue)
                        seriesQuery = seriesQuery.Where(s => s.Released <= yearMax);

                    if (ratingMin.HasValue)
                        seriesQuery = seriesQuery.Where(s => s.Rating >= ratingMin);

                    if (ageRatingId.HasValue)
                        seriesQuery = seriesQuery.Where(s => s.AgeRatingId == ageRatingId);

                    var seriesResults = await seriesQuery
                        .OrderByDescending(s => s.Rating)
                        .Skip(offset)
                        .Take(limit)
                        .ToListAsync();

                    series = seriesResults.Select(s => new ContentSearchItemDTO
                    {
                        Id        = s.Id,
                        Type      = "series",
                        Title     = s.Title,
                        Img       = s.PosterApiName,
                        Year      = s.Released,
                        Rating    = s.Rating,
                        AgeRating = s.AgeRating != null ? new AgeRatingDTO { Id = s.AgeRating.Id, Name = s.AgeRating.Name, MinAge = s.AgeRating.MinAge } : null,
                        Genres    = s.Genres.Select(g => g.Name).ToList(),
                        Authors   = s.Authors.Select(a => a.Name).ToList(),
                        Length    = s.Episodes.Count
                    }).ToList();
                }

                var total = books.Count + movies.Count + series.Count;

                return Ok(new ContentSearchResponseDTO
                {
                    Total  = total,
                    Limit  = limit,
                    Offset = offset,
                    Books  = books,
                    Movies = movies,
                    Series = series
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "SearchError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/content/{type}/{id}
        // Tartalom részletei
        //
        // type: "book" | "movie" | "series"
        // Ha a user be van jelentkezve, a UserLibrary mező is kitöltött
        // ================================================================
        [HttpGet("{type}/{id}")]
        [Authorize]
        public async Task<IActionResult> GetContentDetails(string type, int id)
        {
            try
            {
                var normalizedType = type.ToLower();

                if (normalizedType is not ("book" or "movie" or "series"))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "InvalidType",
                        Message = "Érvénytelen tartalom típus. Lehetséges: book, movie, series"
                    });

                var userId = int.TryParse(User.FindFirst("userId")?.Value, out var uid) ? uid : 0;

                if (normalizedType == "book")
                {
                    var book = await _context.Books
                        .Include(b => b.AgeRating)
                        .Include(b => b.Authors)
                        .Include(b => b.Genres)
                        .Include(b => b.Tags)
                        .FirstOrDefaultAsync(b => b.Id == id);

                    if (book == null)
                        return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem található" });

                    UserLibrarySnapshotDTO? librarySnapshot = null;
                    if (userId > 0)
                    {
                        var ub = await _context.UserBooks.FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == id);
                        if (ub != null)
                            librarySnapshot = new UserLibrarySnapshotDTO
                            {
                                Status               = ub.Status ?? "",
                                Favorite             = ub.Favorite,
                                Rating               = ub.Rating,
                                AddedAt              = ub.AddedAt,
                                CompletedAt          = ub.CompletedAt,
                                CurrentPage          = ub.CurrentPage,
                                CurrentAudioPosition = ub.CurrentAudioPosition
                            };
                    }

                    // ReadUrl: típustól függ
                    var readUrl = book.Type switch
                    {
                        "AUDIOBOOK" => book.AudioUrl,
                        "EBOOK"     => book.EpubUrl ?? book.PdfUrl,
                        _           => book.PdfUrl
                    };

                    return Ok(new BookDetailDTO
                    {
                        Id               = book.Id,
                        Type             = book.Type.ToLower(),
                        Title            = book.Title,
                        Year             = book.Released,
                        Rating           = book.Rating,
                        Description      = book.Description,
                        Img              = book.CoverApiName,
                        PageNum          = book.PageNum,
                        AudioLength      = book.AudioLength,
                        NarratorName     = book.NarratorName,
                        OriginalLanguage = book.OriginalLanguage,
                        IsOfflineAvailable = book.IsOfflineAvailable,
                        ReadUrl          = readUrl,
                        AgeRating        = book.AgeRating != null ? new AgeRatingDTO { Id = book.AgeRating.Id, Name = book.AgeRating.Name, MinAge = book.AgeRating.MinAge } : null,
                        Tags             = book.Tags.Select(t => t.Name).ToList(),
                        Authors          = book.Authors.Select(a => new AuthorDTO { Id = a.Id, Name = a.Name }).ToList(),
                        Genres           = book.Genres.Select(g => new GenreDTO { Id = g.Id, Name = g.Name }).ToList(),
                        UserLibrary      = librarySnapshot
                    });
                }

                if (normalizedType == "movie")
                {
                    var movie = await _context.Movies
                        .Include(m => m.AgeRating)
                        .Include(m => m.Authors)
                        .Include(m => m.Genres)
                        .Include(m => m.Tags)
                        .FirstOrDefaultAsync(m => m.Id == id);

                    if (movie == null)
                        return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem található" });

                    UserLibrarySnapshotDTO? librarySnapshot = null;
                    if (userId > 0)
                    {
                        var um = await _context.UserMovies.FirstOrDefaultAsync(x => x.UserId == userId && x.MovieId == id);
                        if (um != null)
                            librarySnapshot = new UserLibrarySnapshotDTO
                            {
                                Status          = um.Status ?? "",
                                Favorite        = um.Favorite,
                                Rating          = um.Rating,
                                AddedAt         = um.AddedAt,
                                CompletedAt     = um.CompletedAt,
                                CurrentPosition = um.CurrentPosition
                            };
                    }

                    return Ok(new MovieDetailDTO
                    {
                        Id                 = movie.Id,
                        Type               = "movie",
                        Title              = movie.Title,
                        Year               = movie.Released,
                        Rating             = movie.Rating,
                        Description        = movie.Description,
                        Img                = movie.PosterApiName,
                        StreamUrl          = movie.StreamUrl,
                        TrailerUrl         = movie.TrailerUrl,
                        Length             = movie.Length,
                        HasSubtitles       = movie.HasSubtitles,
                        IsOriginalLanguage = movie.IsOriginalLanguage,
                        IsOfflineAvailable = movie.IsOfflineAvailable,
                        AgeRating          = movie.AgeRating != null ? new AgeRatingDTO { Id = movie.AgeRating.Id, Name = movie.AgeRating.Name, MinAge = movie.AgeRating.MinAge } : null,
                        Tags               = movie.Tags.Select(t => t.Name).ToList(),
                        Authors            = movie.Authors.Select(a => new AuthorDTO { Id = a.Id, Name = a.Name }).ToList(),
                        Genres             = movie.Genres.Select(g => new GenreDTO { Id = g.Id, Name = g.Name }).ToList(),
                        UserLibrary        = librarySnapshot
                    });
                }

                // series
                {
                    var s = await _context.Series
                        .Include(x => x.AgeRating)
                        .Include(x => x.Authors)
                        .Include(x => x.Genres)
                        .Include(x => x.Tags)
                        .Include(x => x.Episodes)
                        .FirstOrDefaultAsync(x => x.Id == id);

                    if (s == null)
                        return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem található" });

                    UserLibrarySnapshotDTO? librarySnapshot = null;
                    if (userId > 0)
                    {
                        var us = await _context.UserSeries.FirstOrDefaultAsync(x => x.UserId == userId && x.SeriesId == id);
                        if (us != null)
                            librarySnapshot = new UserLibrarySnapshotDTO
                            {
                                Status          = us.Status ?? "",
                                Favorite        = us.Favorite,
                                Rating          = us.Rating,
                                AddedAt         = us.AddedAt,
                                CompletedAt     = us.CompletedAt,
                                CurrentPosition = us.CurrentPosition,
                                CurrentSeason   = us.CurrentSeason,
                                CurrentEpisode  = us.CurrentEpisode
                            };
                    }

                    var totalSeasons  = s.Episodes.Select(e => e.SeasonNum).Distinct().Count();
                    var totalEpisodes = s.Episodes.Count;

                    return Ok(new SeriesDetailDTO
                    {
                        Id                 = s.Id,
                        Type               = "series",
                        Title              = s.Title,
                        Year               = s.Released,
                        Rating             = s.Rating,
                        Description        = s.Description,
                        Img                = s.PosterApiName,
                        TrailerUrl         = s.TrailerUrl,
                        HasSubtitles       = s.HasSubtitles,
                        IsOriginalLanguage = s.IsOriginalLanguage,
                        IsOfflineAvailable = s.IsOfflineAvailable,
                        TotalSeasons       = totalSeasons,
                        TotalEpisodes      = totalEpisodes,
                        AgeRating          = s.AgeRating != null ? new AgeRatingDTO { Id = s.AgeRating.Id, Name = s.AgeRating.Name, MinAge = s.AgeRating.MinAge } : null,
                        Tags               = s.Tags.Select(t => t.Name).ToList(),
                        Authors            = s.Authors.Select(a => new AuthorDTO { Id = a.Id, Name = a.Name }).ToList(),
                        Genres             = s.Genres.Select(g => new GenreDTO { Id = g.Id, Name = g.Name }).ToList(),
                        Episodes           = s.Episodes
                            .OrderBy(e => e.SeasonNum).ThenBy(e => e.EpisodeNum)
                            .Select(e => new EpisodeDTO
                            {
                                Id         = e.Id,
                                SeasonNum  = e.SeasonNum,
                                EpisodeNum = e.EpisodeNum,
                                Title      = e.Title,
                                StreamUrl  = e.StreamUrl,
                                Length     = e.Length
                            }).ToList(),
                        UserLibrary = librarySnapshot
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "DetailError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/content/category/{category}
        // Kategória szerinti tartalmak
        //
        // category: "latest" | "popular" | "top_rated" |
        //           "new_books" | "new_movies" | "new_series"
        // type:     "all" | "book" | "movie" | "series"
        // limit:    max találat (alapért.: 20)
        // ================================================================
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetContentByCategory(
            string category,
            [FromQuery] string type  = "all",
            [FromQuery] int    limit = 20)
        {
            try
            {
                if (limit < 1 || limit > 100) limit = 20;

                var validCategories = new[] { "latest", "popular", "top_rated", "new_books", "new_movies", "new_series" };
                if (!validCategories.Contains(category.ToLower()))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "InvalidCategory",
                        Message = $"Érvénytelen kategória. Lehetséges: {string.Join(", ", validCategories)}"
                    });

                var normalized = category.ToLower();
                var typeFilter = type.ToLower();
                var items      = new List<ContentSearchItemDTO>();

                // Könyvek
                if (normalized is "latest" or "popular" or "top_rated" or "new_books"
                    && typeFilter is "all" or "book" or "audiobook" or "ebook")
                {
                    IQueryable<Book> q = _context.Books
                        .Include(b => b.AgeRating)
                        .Include(b => b.Genres)
                        .Include(b => b.Authors);

                    q = normalized switch
                    {
                        "top_rated" => q.OrderByDescending(b => b.Rating),
                        "new_books" => q.OrderByDescending(b => b.Id),
                        _           => q.OrderByDescending(b => b.Id) // latest / popular
                    };

                    var results = await q.Take(limit).Select(b => new ContentSearchItemDTO
                    {
                        Id     = b.Id, Type = b.Type.ToLower(), Title = b.Title,
                        Img    = b.CoverApiName, Year = b.Released, Rating = b.Rating,
                        Genres = b.Genres.Select(g => g.Name).ToList(),
                        Authors = b.Authors.Select(a => a.Name).ToList(),
                        Length = b.Type == "AUDIOBOOK" ? b.AudioLength : b.PageNum
                    }).ToListAsync();

                    items.AddRange(results);
                }

                // Filmek
                if (normalized is "latest" or "popular" or "top_rated" or "new_movies"
                    && typeFilter is "all" or "movie")
                {
                    IQueryable<Movie> q = _context.Movies
                        .Include(m => m.AgeRating)
                        .Include(m => m.Genres)
                        .Include(m => m.Authors);

                    q = normalized switch
                    {
                        "top_rated"  => q.OrderByDescending(m => m.Rating),
                        "new_movies" => q.OrderByDescending(m => m.Id),
                        _            => q.OrderByDescending(m => m.Id)
                    };

                    var results = await q.Take(limit).Select(m => new ContentSearchItemDTO
                    {
                        Id     = m.Id, Type = "movie", Title = m.Title,
                        Img    = m.PosterApiName, Year = m.Released, Rating = m.Rating,
                        Genres = m.Genres.Select(g => g.Name).ToList(),
                        Authors = m.Authors.Select(a => a.Name).ToList(),
                        Length = m.Length
                    }).ToListAsync();

                    items.AddRange(results);
                }

                // Sorozatok
                if (normalized is "latest" or "popular" or "top_rated" or "new_series"
                    && typeFilter is "all" or "series")
                {
                    IQueryable<Series> q = _context.Series
                        .Include(s => s.AgeRating)
                        .Include(s => s.Genres)
                        .Include(s => s.Authors)
                        .Include(s => s.Episodes);

                    q = normalized switch
                    {
                        "top_rated"  => q.OrderByDescending(s => s.Rating),
                        "new_series" => q.OrderByDescending(s => s.Id),
                        _            => q.OrderByDescending(s => s.Id)
                    };

                    var results = await q.Take(limit).Select(s => new ContentSearchItemDTO
                    {
                        Id     = s.Id, Type = "series", Title = s.Title,
                        Img    = s.PosterApiName, Year = s.Released, Rating = s.Rating,
                        Genres = s.Genres.Select(g => g.Name).ToList(),
                        Authors = s.Authors.Select(a => a.Name).ToList(),
                        Length = s.Episodes.Count
                    }).ToListAsync();

                    items.AddRange(results);
                }

                if (items.Count == 0)
                    return NotFound(new ErrorResponseDTO
                    {
                        Error   = "NotFound",
                        Message = $"Nincs találat a '{category}' kategóriában"
                    });

                return Ok(new ContentCategoryResultDTO
                {
                    Category = category.ToLower(),
                    Items    = items,
                    Total    = items.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "CategoryError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/content/genres
        // Összes elérhető műfaj listája
        // ================================================================
        [HttpGet("genres")]
        public async Task<IActionResult> GetGenres()
        {
            try
            {
                var genres = await _context.Genres
                    .OrderBy(g => g.Name)
                    .Select(g => new GenreDTO { Id = g.Id, Name = g.Name })
                    .ToListAsync();

                return Ok(genres);
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
    }
}
