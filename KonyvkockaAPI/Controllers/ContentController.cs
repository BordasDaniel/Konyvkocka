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
        //   genres      – műfaj nevek: "Akció,Kaland,Krimi,..."
        //   tags        – tag nevek: "Magyar,Külföldi,Feliratos,..."
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
            [FromQuery] string genres     = "",
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
                var genreList     = string.IsNullOrWhiteSpace(genres)     ? Array.Empty<string>() : genres.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var tagList       = string.IsNullOrWhiteSpace(tags)       ? Array.Empty<string>() : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                // A műfajok (Akció, Horror, stb.) a DB-ben tagként vannak tárolva – összevonjuk
                var combinedTagList = genreList.Concat(tagList).Distinct().ToArray();

                var includeAll    = typeList.Contains("all");
                var includeBooks  = includeAll || typeList.Contains("book");
                var includeMovies = includeAll || typeList.Contains("movie");
                var includeSeries = includeAll || typeList.Contains("series");

                var results = new List<HomeCardDTO>();

                // ── KÖNYVEK ──────────────────────────────────────────────
                if (includeBooks)
                {
                    var bookQuery = _context.Books
                        .Include(b => b.Tags)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        bookQuery = bookQuery.Where(b => b.Title.Contains(q));

                    if (ageRatingList.Length > 0)
                        bookQuery = bookQuery.Where(b => b.AgeRating != null && ageRatingList.Contains(b.AgeRating.Name));

                    if (combinedTagList.Length > 0)
                        bookQuery = bookQuery.Where(b => b.Tags.Any(t => combinedTagList.Contains(t.Name)));

                    var bookCards = await bookQuery
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

                    results.AddRange(bookCards);
                }

                // ── FILMEK ───────────────────────────────────────────────
                if (includeMovies)
                {
                    var movieQuery = _context.Movies
                        .Include(m => m.Tags)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        movieQuery = movieQuery.Where(m => m.Title.Contains(q));

                    if (ageRatingList.Length > 0)
                        movieQuery = movieQuery.Where(m => m.AgeRating != null && ageRatingList.Contains(m.AgeRating.Name));

                    if (combinedTagList.Length > 0)
                        movieQuery = movieQuery.Where(m => m.Tags.Any(t => combinedTagList.Contains(t.Name)));

                    var movieCards = await movieQuery
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

                    results.AddRange(movieCards);
                }

                // ── SOROZATOK ────────────────────────────────────────────
                if (includeSeries)
                {
                    var seriesQuery = _context.Series
                        .Include(s => s.Tags)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(q))
                        seriesQuery = seriesQuery.Where(s => s.Title.Contains(q));

                    if (ageRatingList.Length > 0)
                        seriesQuery = seriesQuery.Where(s => s.AgeRating != null && ageRatingList.Contains(s.AgeRating.Name));

                    if (combinedTagList.Length > 0)
                        seriesQuery = seriesQuery.Where(s => s.Tags.Any(t => combinedTagList.Contains(t.Name)));

                    var seriesCards = await seriesQuery
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
                        UserLibrary      = librarySnapshot
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
                        UserLibrary        = librarySnapshot
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
        // GET /api/content/genres
        // Összes elérhető műfaj (= tag) listája
        // ================================================================
        [HttpGet("genres")]
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
    }
}
