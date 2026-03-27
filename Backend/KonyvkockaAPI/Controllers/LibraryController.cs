using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Extensions;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LibraryController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public LibraryController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/library
        // Könyvtár tartalmainak lekérése szűrőkkel
        //
        // Query paraméterek:
        //   q            – keresési kifejezés (cím alapján)
        //   status       – vesszővel elválasztva: WATCHING,COMPLETED,PAUSED,DROPPED,PLANNED,ARCHIVED
        //   ageRating    – korhatár ID-k vesszővel: 1,2,3,4,5
        //   tags         – tag ID-k vesszővel: 1,2,3
        //   contentType  – book,audiobook,ebook,movie,series  (vesszővel)
        //   sortBy       – lastAdded|completedDate|rating|duration
        //   favorite     – true|false
        // ================================================================
        [HttpGet]
        public async Task<IActionResult> GetLibrary(
            [FromQuery] string? q = null,
            [FromQuery] string? status = null,
            [FromQuery] string? ageRating = null,
            [FromQuery] string? tags = null,
            [FromQuery] string? contentType = null,
            [FromQuery] string sortBy = "lastAdded",
            [FromQuery] bool? favorite = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                // paraméterek tömbbé alakítása
                var statusList = SplitUpper(status);
                var ageRatingIds = SplitInt(ageRating);
                var tagIds = SplitInt(tags);
                var contentTypes = SplitLower(contentType);

                var items = new List<LibraryItemDTO>();

                // ── KÖNYVEK (book, audiobook, ebook) ──────────────────────
                bool includeBooks = contentTypes.Count == 0
                    || contentTypes.Any(ct => ct is "book" or "audiobook" or "ebook");

                if (includeBooks)
                {
                    var bookQuery = _context.UserBooks
                        .Where(ub => ub.UserId == userId)
                        .Include(ub => ub.Book)
                            .ThenInclude(b => b.AgeRating)
                        .Include(ub => ub.Book)
                            .ThenInclude(b => b.Tags)
                        .AsQueryable()
                        .ApplyFilters(q, statusList.Count > 0 ? statusList.ToArray() : null, favorite);

                    // korhatár szűrés
                    if (ageRatingIds.Count > 0)
                        bookQuery = bookQuery.Where(ub => ub.Book.AgeRatingId.HasValue
                            && ageRatingIds.Contains(ub.Book.AgeRatingId.Value));

                    // tag szűrés
                    if (tagIds.Count > 0)
                        bookQuery = bookQuery.Where(ub =>
                            ub.Book.Tags.Any(t => tagIds.Contains(t.Id)));

                    // contentType alapú book.Type szűrés
                    if (contentTypes.Count > 0)
                    {
                        var bookTypes = new List<string>();
                        if (contentTypes.Contains("book")) bookTypes.Add("BOOK");
                        if (contentTypes.Contains("audiobook")) bookTypes.Add("AUDIOBOOK");
                        if (contentTypes.Contains("ebook")) bookTypes.Add("EBOOK");
                        if (bookTypes.Count > 0)
                            bookQuery = bookQuery.Where(ub => bookTypes.Contains(ub.Book.Type));
                    }

                    var books = await bookQuery.Select(ub => new LibraryItemDTO
                    {
                        Id = ub.Book.Id,
                        ContentType = ub.Book.Type,
                        Title = ub.Book.Title,
                        Cover = ub.Book.CoverApiName,
                        Year = ub.Book.Released,
                        Rating = ub.Book.Rating,
                        AgeRating = ub.Book.AgeRating == null ? null : new AgeRatingDTO
                        {
                            Id = ub.Book.AgeRating.Id,
                            Name = ub.Book.AgeRating.Name,
                            MinAge = ub.Book.AgeRating.MinAge
                        },
                        Tags = ub.Book.Tags.Select(t => t.Name).ToList(),
                        Status = ub.Status,
                        Favorite = ub.Favorite,
                        UserRating = ub.Rating,
                        AddedAt = ub.AddedAt,
                        CompletedAt = ub.CompletedAt,
                        LastSeen = ub.LastSeen,
                        CurrentPage = ub.CurrentPage,
                        CurrentAudioPosition = ub.CurrentAudioPosition
                    }).ToListAsync();

                    items.AddRange(books);
                }

                // ── FILMEK ────────────────────────────────────────────────
                bool includeMovies = contentTypes.Count == 0 || contentTypes.Contains("movie");

                if (includeMovies)
                {
                    var movieQuery = _context.UserMovies
                        .Where(um => um.UserId == userId)
                        .Include(um => um.Movie)
                            .ThenInclude(m => m.AgeRating)
                        .Include(um => um.Movie)
                            .ThenInclude(m => m.Tags)
                        .AsQueryable()
                        .ApplyFilters(q, statusList.Count > 0 ? statusList.ToArray() : null, favorite);

                    if (ageRatingIds.Count > 0)
                        movieQuery = movieQuery.Where(um => um.Movie.AgeRatingId.HasValue
                            && ageRatingIds.Contains(um.Movie.AgeRatingId.Value));

                    if (tagIds.Count > 0)
                        movieQuery = movieQuery.Where(um =>
                            um.Movie.Tags.Any(t => tagIds.Contains(t.Id)));

                    var movies = await movieQuery.Select(um => new LibraryItemDTO
                    {
                        Id = um.Movie.Id,
                        ContentType = "MOVIE",
                        Title = um.Movie.Title,
                        Cover = um.Movie.PosterApiName,
                        Year = um.Movie.Released,
                        Rating = um.Movie.Rating,
                        AgeRating = um.Movie.AgeRating == null ? null : new AgeRatingDTO
                        {
                            Id = um.Movie.AgeRating.Id,
                            Name = um.Movie.AgeRating.Name,
                            MinAge = um.Movie.AgeRating.MinAge
                        },
                        Tags = um.Movie.Tags.Select(t => t.Name).ToList(),
                        Status = um.Status,
                        Favorite = um.Favorite,
                        UserRating = um.Rating,
                        AddedAt = um.AddedAt,
                        CompletedAt = um.CompletedAt,
                        LastSeen = um.LastSeen,
                        CurrentPosition = um.CurrentPosition
                    }).ToListAsync();

                    items.AddRange(movies);
                }

                // ── SOROZATOK ─────────────────────────────────────────────
                bool includeSeries = contentTypes.Count == 0 || contentTypes.Contains("series");

                if (includeSeries)
                {
                    var seriesQuery = _context.UserSeries
                        .Where(us => us.UserId == userId)
                        .Include(us => us.Series)
                            .ThenInclude(s => s.AgeRating)
                        .Include(us => us.Series)
                            .ThenInclude(s => s.Tags)
                        .AsQueryable()
                        .ApplyFilters(q, statusList.Count > 0 ? statusList.ToArray() : null, favorite);

                    if (ageRatingIds.Count > 0)
                        seriesQuery = seriesQuery.Where(us => us.Series.AgeRatingId.HasValue
                            && ageRatingIds.Contains(us.Series.AgeRatingId.Value));

                    if (tagIds.Count > 0)
                        seriesQuery = seriesQuery.Where(us =>
                            us.Series.Tags.Any(t => tagIds.Contains(t.Id)));

                    var series = await seriesQuery.Select(us => new LibraryItemDTO
                    {
                        Id = us.Series.Id,
                        ContentType = "SERIES",
                        Title = us.Series.Title,
                        Cover = us.Series.PosterApiName,
                        Year = us.Series.Released,
                        Rating = us.Series.Rating,
                        AgeRating = us.Series.AgeRating == null ? null : new AgeRatingDTO
                        {
                            Id = us.Series.AgeRating.Id,
                            Name = us.Series.AgeRating.Name,
                            MinAge = us.Series.AgeRating.MinAge
                        },
                        Tags = us.Series.Tags.Select(t => t.Name).ToList(),
                        Status = us.Status,
                        Favorite = us.Favorite,
                        UserRating = us.Rating,
                        AddedAt = us.AddedAt,
                        CompletedAt = us.CompletedAt,
                        LastSeen = us.LastSeen,
                        CurrentSeason = us.CurrentSeason,
                        CurrentEpisode = us.CurrentEpisode,
                        CurrentPosition = us.CurrentPosition
                    }).ToListAsync();

                    items.AddRange(series);
                }

                // ── RENDEZÉS ──────────────────────────────────────────────
                items = sortBy switch
                {
                    "completedDate" => items.OrderByDescending(i => i.CompletedAt).ToList(),
                    "rating" => items.OrderByDescending(i => i.UserRating ?? i.Rating).ToList(),
                    _ => items.OrderByDescending(i => i.LastSeen ?? i.AddedAt).ToList() // lastAdded
                };

                return Ok(new
                {
                    query = q,
                    totalResults = items.Count,
                    filters = new
                    {
                        status = statusList,
                        ageRating = ageRatingIds,
                        tags = tagIds,
                        contentType = contentTypes,
                        sortBy,
                        favorite
                    },
                    results = items
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // POST /api/library
        // Tartalom hozzáadása a könyvtárhoz
        // Body: AddToLibraryDTO
        // ================================================================
        [HttpPost]
        public async Task<IActionResult> AddToLibrary([FromBody] AddToLibraryDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var validTypes = new[] { "book", "movie", "series" };
                if (!validTypes.Contains(dto.Type.ToLower()))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidParameter",
                        Message = "A type értéke csak 'book', 'movie' vagy 'series' lehet."
                    });

                var validStatuses = new[] { "WATCHING", "PLANNED" };
                var normalizedStatus = dto.Status?.ToUpper() ?? "PLANNED";
                if (!validStatuses.Contains(normalizedStatus))
                    normalizedStatus = "PLANNED";

                switch (dto.Type.ToLower())
                {
                    case "book":
                        if (await _context.UserBooks.AnyAsync(ub => ub.UserId == userId && ub.BookId == dto.ContentId))
                            return Conflict(new ErrorResponseDTO { Error = "AlreadyInLibrary", Message = "Ez a tartalom már szerepel a könyvtáradban." });
                        if (!await _context.Books.AnyAsync(b => b.Id == dto.ContentId))
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem található." });

                        _context.UserBooks.Add(new UserBook
                        {
                            UserId = userId,
                            BookId = dto.ContentId,
                            Status = normalizedStatus,
                            AddedAt = DateTime.Now
                        });
                        break;

                    case "movie":
                        if (await _context.UserMovies.AnyAsync(um => um.UserId == userId && um.MovieId == dto.ContentId))
                            return Conflict(new ErrorResponseDTO { Error = "AlreadyInLibrary", Message = "Ez a tartalom már szerepel a könyvtáradban." });
                        if (!await _context.Movies.AnyAsync(m => m.Id == dto.ContentId))
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem található." });

                        _context.UserMovies.Add(new UserMovie
                        {
                            UserId = userId,
                            MovieId = dto.ContentId,
                            Status = normalizedStatus,
                            AddedAt = DateTime.Now
                        });
                        break;

                    case "series":
                        if (await _context.UserSeries.AnyAsync(us => us.UserId == userId && us.SeriesId == dto.ContentId))
                            return Conflict(new ErrorResponseDTO { Error = "AlreadyInLibrary", Message = "Ez a tartalom már szerepel a könyvtáradban." });
                        if (!await _context.Series.AnyAsync(s => s.Id == dto.ContentId))
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem található." });

                        _context.UserSeries.Add(new UserSeries
                        {
                            UserId = userId,
                            SeriesId = dto.ContentId,
                            Status = normalizedStatus,
                            AddedAt = DateTime.Now
                        });
                        break;
                }

                await _context.SaveChangesAsync();
                return Ok(new MessageResponseDTO { Message = "Tartalom sikeresen hozzáadva a könyvtárhoz." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PATCH /api/library/{type}/{contentId}/progress
        // Haladás és/vagy státusz frissítése
        // Body: UpdateProgressDTO
        // ================================================================
        [HttpPatch("{type}/{contentId}/progress")]
        public async Task<IActionResult> UpdateProgress(
            string type,
            int contentId,
            [FromBody] UpdateProgressDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var validStatuses = new[] { "WATCHING", "COMPLETED", "PAUSED", "DROPPED", "PLANNED", "ARCHIVED" };
                var newStatus = dto.Status?.ToUpper();
                if (newStatus != null && !validStatuses.Contains(newStatus))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidParameter",
                        Message = $"Érvénytelen státusz: '{dto.Status}'. Lehetséges értékek: {string.Join(", ", validStatuses)}"
                    });

                switch (type.ToLower())
                {
                    case "book":
                        var ub = await _context.UserBooks
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == contentId);
                        if (ub == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem szerepel a könyvtáradban." });

                        if (dto.CurrentPage.HasValue) ub.CurrentPage = dto.CurrentPage;
                        if (dto.CurrentAudioPosition.HasValue) ub.CurrentAudioPosition = dto.CurrentAudioPosition;
                        if (newStatus != null) ub.Status = newStatus;
                        break;

                    case "movie":
                        var um = await _context.UserMovies
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.MovieId == contentId);
                        if (um == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem szerepel a könyvtáradban." });

                        if (dto.CurrentPosition.HasValue) um.CurrentPosition = dto.CurrentPosition;
                        if (newStatus != null) um.Status = newStatus;
                        break;

                    case "series":
                        var us = await _context.UserSeries
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.SeriesId == contentId);
                        if (us == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem szerepel a könyvtáradban." });

                        if (dto.CurrentSeason.HasValue) us.CurrentSeason = dto.CurrentSeason;
                        if (dto.CurrentEpisode.HasValue) us.CurrentEpisode = dto.CurrentEpisode;
                        if (dto.CurrentEpisodePosition.HasValue) us.CurrentPosition = dto.CurrentEpisodePosition;
                        if (newStatus != null) us.Status = newStatus;
                        break;

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidParameter",
                            Message = "A type értéke csak 'book', 'movie' vagy 'series' lehet."
                        });
                }

                await _context.SaveChangesAsync();
                return Ok(new MessageResponseDTO { Message = "Haladás sikeresen frissítve." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PATCH /api/library/{type}/{contentId}/rate
        // Tartalom értékelése (user saját értékelése)
        // Body: RateContentDTO
        // ================================================================
        [HttpPatch("{type}/{contentId}/rate")]
        public async Task<IActionResult> RateContent(
            string type,
            int contentId,
            [FromBody] RateContentDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                if (dto.Rating < 0 || dto.Rating > 10)
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidParameter",
                        Message = "Az értékelés 0 és 10 közé kell essen."
                    });

                switch (type.ToLower())
                {
                    case "book":
                        var ub = await _context.UserBooks
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == contentId);
                        if (ub == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem szerepel a könyvtáradban." });
                        ub.Rating = dto.Rating;
                        break;

                    case "movie":
                        var um = await _context.UserMovies
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.MovieId == contentId);
                        if (um == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem szerepel a könyvtáradban." });
                        um.Rating = dto.Rating;
                        break;

                    case "series":
                        var us = await _context.UserSeries
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.SeriesId == contentId);
                        if (us == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem szerepel a könyvtáradban." });
                        us.Rating = dto.Rating;
                        break;

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidParameter",
                            Message = "A type értéke csak 'book', 'movie' vagy 'series' lehet."
                        });
                }

                await _context.SaveChangesAsync();
                return Ok(new MessageResponseDTO { Message = "Értékelés sikeresen mentve." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PATCH /api/library/{type}/{contentId}/favorite
        // Kedvenc státusz váltása
        // ================================================================
        [HttpPatch("{type}/{contentId}/favorite")]
        public async Task<IActionResult> ToggleFavorite(string type, int contentId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                bool newValue;

                switch (type.ToLower())
                {
                    case "book":
                        var ub = await _context.UserBooks
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == contentId);
                        if (ub == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem szerepel a könyvtáradban." });
                        ub.Favorite = !ub.Favorite;
                        newValue = ub.Favorite;
                        break;

                    case "movie":
                        var um = await _context.UserMovies
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.MovieId == contentId);
                        if (um == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem szerepel a könyvtáradban." });
                        um.Favorite = !um.Favorite;
                        newValue = um.Favorite;
                        break;

                    case "series":
                        var us = await _context.UserSeries
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.SeriesId == contentId);
                        if (us == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem szerepel a könyvtáradban." });
                        us.Favorite = !us.Favorite;
                        newValue = us.Favorite;
                        break;

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidParameter",
                            Message = "A type értéke csak 'book', 'movie' vagy 'series' lehet."
                        });
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Kedvenc státusz frissítve.", favorite = newValue });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // DELETE /api/library/{type}/{contentId}
        // Tartalom eltávolítása a könyvtárból
        // ================================================================
        [HttpDelete("{type}/{contentId}")]
        public async Task<IActionResult> RemoveFromLibrary(string type, int contentId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                switch (type.ToLower())
                {
                    case "book":
                        var ub = await _context.UserBooks
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == contentId);
                        if (ub == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem szerepel a könyvtáradban." });
                        _context.UserBooks.Remove(ub);
                        break;

                    case "movie":
                        var um = await _context.UserMovies
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.MovieId == contentId);
                        if (um == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem szerepel a könyvtáradban." });
                        _context.UserMovies.Remove(um);
                        break;

                    case "series":
                        var us = await _context.UserSeries
                            .FirstOrDefaultAsync(x => x.UserId == userId && x.SeriesId == contentId);
                        if (us == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem szerepel a könyvtáradban." });
                        _context.UserSeries.Remove(us);
                        break;

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidParameter",
                            Message = "A type értéke csak 'book', 'movie' vagy 'series' lehet."
                        });
                }

                await _context.SaveChangesAsync();
                return Ok(new MessageResponseDTO { Message = "Tartalom eltávolítva a könyvtárból." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // Segédfüggvények – query string parsing
        // ================================================================
        private static List<string> SplitUpper(string? value) =>
            string.IsNullOrWhiteSpace(value)
                ? new List<string>()
                : value.Split(',', StringSplitOptions.RemoveEmptyEntries)
                       .Select(s => s.Trim().ToUpperInvariant())
                       .ToList();

        private static List<string> SplitLower(string? value) =>
            string.IsNullOrWhiteSpace(value)
                ? new List<string>()
                : value.Split(',', StringSplitOptions.RemoveEmptyEntries)
                       .Select(s => s.Trim().ToLowerInvariant())
                       .ToList();

        private static List<int> SplitInt(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return new List<int>();
            return value.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => int.TryParse(s.Trim(), out var n) ? (int?)n : null)
                        .Where(n => n.HasValue)
                        .Select(n => n!.Value)
                        .ToList();
        }
    }
}
