using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HistoryController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public HistoryController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/history
        // Megtekintési/olvasási előzmények
        //
        // Query paraméterek:
        //   type     – "all" | "books" | "movies" | "series" (alapért.: "all")
        //   page     – oldalszám (alapért.: 1)
        //   pageSize – oldal mérete (alapért.: 20, max: 100)
        //
        // type=all esetén a három lista összefűzve, LastSeen szerint rendezve kerül vissza
        // ================================================================
        [HttpGet]
        public async Task<IActionResult> GetHistory(
            [FromQuery] string type     = "all",
            [FromQuery] int    page     = 1,
            [FromQuery] int    pageSize = 20)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var validTypes = new[] { "all", "books", "movies", "series" };
                if (!validTypes.Contains(type.ToLower()))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "InvalidParameter",
                        Message = "Érvénytelen type. Lehetséges: all, books, movies, series"
                    });

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var normalized = type.ToLower();
                var items      = new List<HistoryItemDTO>();
                int total      = 0;

                if (normalized == "books" || normalized == "all")
                {
                    var bookQuery = _context.UserBooks
                        .Where(ub => ub.UserId == userId)
                        .Include(ub => ub.Book);

                    if (normalized == "books")
                    {
                        total = await bookQuery.CountAsync();
                        var bookPage = await bookQuery
                            .OrderByDescending(ub => ub.LastSeen ?? ub.AddedAt)
                            .Skip((page - 1) * pageSize)
                            .Take(pageSize)
                            .ToListAsync();

                        return Ok(new
                        {
                            type,
                            total,
                            page,
                            pageSize,
                            history = bookPage.Select(ub => MapBook(ub))
                        });
                    }

                    // all: gyűjtsük össze lapozás nélkül (mergeljük lentebb)
                    var allBooks = await bookQuery
                        .OrderByDescending(ub => ub.LastSeen ?? ub.AddedAt)
                        .ToListAsync();

                    items.AddRange(allBooks.Select(ub => MapBook(ub)));
                }

                if (normalized == "movies" || normalized == "all")
                {
                    var movieQuery = _context.UserMovies
                        .Where(um => um.UserId == userId)
                        .Include(um => um.Movie);

                    if (normalized == "movies")
                    {
                        total = await movieQuery.CountAsync();
                        var moviePage = await movieQuery
                            .OrderByDescending(um => um.LastSeen ?? um.AddedAt)
                            .Skip((page - 1) * pageSize)
                            .Take(pageSize)
                            .ToListAsync();

                        return Ok(new
                        {
                            type,
                            total,
                            page,
                            pageSize,
                            history = moviePage.Select(um => MapMovie(um))
                        });
                    }

                    var allMovies = await movieQuery
                        .OrderByDescending(um => um.LastSeen ?? um.AddedAt)
                        .ToListAsync();

                    items.AddRange(allMovies.Select(um => MapMovie(um)));
                }

                if (normalized == "series" || normalized == "all")
                {
                    var seriesQuery = _context.UserSeries
                        .Where(us => us.UserId == userId)
                        .Include(us => us.Series);

                    if (normalized == "series")
                    {
                        total = await seriesQuery.CountAsync();
                        var seriesPage = await seriesQuery
                            .OrderByDescending(us => us.LastSeen ?? us.AddedAt)
                            .Skip((page - 1) * pageSize)
                            .Take(pageSize)
                            .ToListAsync();

                        return Ok(new
                        {
                            type,
                            total,
                            page,
                            pageSize,
                            history = seriesPage.Select(us => MapSeries(us))
                        });
                    }

                    var allSeries = await seriesQuery
                        .OrderByDescending(us => us.LastSeen ?? us.AddedAt)
                        .ToListAsync();

                    items.AddRange(allSeries.Select(us => MapSeries(us)));
                }

                // type=all: egyesített lista, LastSeen szerint rendezve, lapozva
                var sorted = items
                    .OrderByDescending(i => i.LastSeen ?? i.AddedAt ?? DateTime.MinValue)
                    .ToList();

                total = sorted.Count;
                var paged = sorted
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return Ok(new
                {
                    type,
                    total,
                    page,
                    pageSize,
                    history = paged
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // POST /api/history
        // Előzmény frissítése: progress, status, rating
        // Body: UpdateHistoryDTO
        //
        // Megjegyzés: a COMPLETED státusz beállítása DB trigger-t vált ki
        // (XP/pont jóváírás), ezért csak akkor állítsuk, ha tényleg kész
        // ================================================================
        [HttpPost]
        public async Task<IActionResult> UpdateHistory([FromBody] UpdateHistoryDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var validStatuses = new[] { "WATCHING", "COMPLETED", "PAUSED", "DROPPED", "PLANNED", "ARCHIVED" };

                if (!string.IsNullOrEmpty(dto.Status) && !validStatuses.Contains(dto.Status.ToUpper()))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "InvalidStatus",
                        Message = $"Érvénytelen státusz. Lehetséges: {string.Join(", ", validStatuses)}"
                    });

                switch (dto.ContentType.ToLower())
                {
                    case "book":
                    {
                        var userBook = await _context.UserBooks
                            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == dto.ContentId);

                        if (userBook == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        if (dto.Progress.HasValue) userBook.CurrentPage = dto.Progress.Value;
                        if (!string.IsNullOrEmpty(dto.Status)) userBook.Status = dto.Status.ToUpper();
                        if (dto.Rating.HasValue)
                        {
                            if (dto.Rating < 0 || dto.Rating > 10)
                                return BadRequest(new ErrorResponseDTO { Error = "InvalidRating", Message = "Az értékelés 0 és 10 között kell legyen" });
                            userBook.Rating = dto.Rating.Value;
                        }
                        userBook.LastSeen = DateTime.Now;
                        break;
                    }

                    case "series":
                    {
                        var userSeries = await _context.UserSeries
                            .FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == dto.ContentId);

                        if (userSeries == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        if (dto.Progress.HasValue) userSeries.CurrentEpisode = dto.Progress.Value;
                        if (!string.IsNullOrEmpty(dto.Status)) userSeries.Status = dto.Status.ToUpper();
                        if (dto.Rating.HasValue)
                        {
                            if (dto.Rating < 0 || dto.Rating > 10)
                                return BadRequest(new ErrorResponseDTO { Error = "InvalidRating", Message = "Az értékelés 0 és 10 között kell legyen" });
                            userSeries.Rating = dto.Rating.Value;
                        }
                        userSeries.LastSeen = DateTime.Now;
                        break;
                    }

                    case "movie":
                    {
                        var userMovie = await _context.UserMovies
                            .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == dto.ContentId);

                        if (userMovie == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        if (dto.Progress.HasValue) userMovie.CurrentPosition = dto.Progress.Value;
                        if (!string.IsNullOrEmpty(dto.Status)) userMovie.Status = dto.Status.ToUpper();
                        if (dto.Rating.HasValue)
                        {
                            if (dto.Rating < 0 || dto.Rating > 10)
                                return BadRequest(new ErrorResponseDTO { Error = "InvalidRating", Message = "Az értékelés 0 és 10 között kell legyen" });
                            userMovie.Rating = dto.Rating.Value;
                        }
                        userMovie.LastSeen = DateTime.Now;
                        break;
                    }

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error   = "InvalidType",
                            Message = "Érvénytelen tartalom típus. Lehetséges: book, series, movie"
                        });
                }

                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO { Message = "Az előzmény sikeresen frissítve" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // DELETE /api/history/{contentType}/{contentId}
        // Egy adott előzmény törlése a user könyvtárából
        //
        // ⚠️ Ez ténylegesen törli a user_book/user_movie/user_series rekordot!
        // ================================================================
        [HttpDelete("{contentType}/{contentId}")]
        public async Task<IActionResult> DeleteHistory(string contentType, int contentId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                switch (contentType.ToLower())
                {
                    case "book":
                    {
                        var userBook = await _context.UserBooks
                            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == contentId);
                        if (userBook == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });
                        _context.UserBooks.Remove(userBook);
                        break;
                    }
                    case "series":
                    {
                        var userSeries = await _context.UserSeries
                            .FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == contentId);
                        if (userSeries == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });
                        _context.UserSeries.Remove(userSeries);
                        break;
                    }
                    case "movie":
                    {
                        var userMovie = await _context.UserMovies
                            .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == contentId);
                        if (userMovie == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });
                        _context.UserMovies.Remove(userMovie);
                        break;
                    }
                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error   = "InvalidType",
                            Message = "Érvénytelen tartalom típus. Lehetséges: book, series, movie"
                        });
                }

                await _context.SaveChangesAsync();
                return Ok(new MessageResponseDTO { Message = "Az előzmény sikeresen törölve" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // DELETE /api/history/clear-all
        // Az összes előzmény törlése
        //
        // ⚠️ Ez törli az összes user_book/user_movie/user_series rekordot!
        // A megszerzett XP/pontok NEM törlődnek.
        // ================================================================
        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAllHistory()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var userBooks  = await _context.UserBooks.Where(ub => ub.UserId == userId).ToListAsync();
                var userMovies = await _context.UserMovies.Where(um => um.UserId == userId).ToListAsync();
                var userSeries = await _context.UserSeries.Where(us => us.UserId == userId).ToListAsync();

                _context.UserBooks.RemoveRange(userBooks);
                _context.UserMovies.RemoveRange(userMovies);
                _context.UserSeries.RemoveRange(userSeries);

                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO { Message = "Az összes előzmény sikeresen törölve" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // Mapping helpers
        // ================================================================
        private static HistoryItemDTO MapBook(UserBook ub) => new()
        {
            ContentType = "book",
            ContentId   = ub.BookId,
            Title       = ub.Book.Title,
            Author      = null,
            Cover       = ub.Book.CoverApiName,
            Status      = ub.Status,
            Progress    = ub.CurrentPage,
            Rating      = ub.Rating,
            LastSeen    = ub.LastSeen,
            AddedAt     = ub.AddedAt
        };

        private static HistoryItemDTO MapMovie(UserMovie um) => new()
        {
            ContentType = "movie",
            ContentId   = um.MovieId,
            Title       = um.Movie.Title,
            Poster      = um.Movie.PosterApiName,
            Status      = um.Status,
            Progress    = um.CurrentPosition,
            Rating      = um.Rating,
            LastSeen    = um.LastSeen,
            AddedAt     = um.AddedAt
        };

        private static HistoryItemDTO MapSeries(UserSeries us) => new()
        {
            ContentType = "series",
            ContentId   = us.SeriesId,
            Title       = us.Series.Title,
            Poster      = us.Series.PosterApiName,
            Status      = us.Status,
            Progress    = us.CurrentEpisode,
            Rating      = us.Rating,
            LastSeen    = us.LastSeen,
            AddedAt     = us.AddedAt
        };
    }
}
