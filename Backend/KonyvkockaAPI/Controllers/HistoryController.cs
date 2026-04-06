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

                var validTypes = new[] { "all", "book", "books", "movie", "movies", "series" };
                if (!validTypes.Contains(type.ToLower()))
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error   = "InvalidParameter",
                        Message = "Érvénytelen type. Lehetséges: all, book, movie, series"
                    });

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                // Normalizálás: többes szám → egyes szám
                var normalized = type.ToLower() switch
                {
                    "books"  => "book",
                    "movies" => "movie",
                    _        => type.ToLower()
                };
                var items      = new List<HistoryItemDTO>();
                int total      = 0;

                if (normalized == "book" || normalized == "all")
                {
                    var bookQuery = _context.UserBooks
                        .Where(ub => ub.UserId == userId)
                        .Include(ub => ub.Book);

                    if (normalized == "book")
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

                if (normalized == "movie" || normalized == "all")
                {
                    var movieQuery = _context.UserMovies
                        .Where(um => um.UserId == userId)
                        .Include(um => um.Movie);

                    if (normalized == "movie")
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
                        .Include(us => us.Series)
                        .ThenInclude(s => s.Episodes);

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
        // GET /api/history/{contentType}/{contentId}
        // Egy konkrét előzmény elem lekérése (folytatáshoz)
        // ================================================================
        [HttpGet("{contentType}/{contentId}")]
        public async Task<IActionResult> GetHistoryItem(string contentType, int contentId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var normalizedType = contentType.Trim().ToLowerInvariant() switch
                {
                    "books" => "book",
                    "movies" => "movie",
                    _ => contentType.Trim().ToLowerInvariant()
                };

                switch (normalizedType)
                {
                    case "book":
                    {
                        var userBook = await _context.UserBooks
                            .Where(ub => ub.UserId == userId && ub.BookId == contentId)
                            .Include(ub => ub.Book)
                            .FirstOrDefaultAsync();

                        if (userBook == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        return Ok(MapBook(userBook));
                    }

                    case "movie":
                    {
                        var userMovie = await _context.UserMovies
                            .Where(um => um.UserId == userId && um.MovieId == contentId)
                            .Include(um => um.Movie)
                            .FirstOrDefaultAsync();

                        if (userMovie == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        return Ok(MapMovie(userMovie));
                    }

                    case "series":
                    {
                        var userSeries = await _context.UserSeries
                            .Where(us => us.UserId == userId && us.SeriesId == contentId)
                            .Include(us => us.Series)
                            .ThenInclude(s => s.Episodes)
                            .FirstOrDefaultAsync();

                        if (userSeries == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        return Ok(MapSeries(userSeries));
                    }

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidType",
                            Message = "Érvénytelen tartalom típus. Lehetséges: book, series, movie"
                        });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // POST /api/history/view
        // Automatikus megtekintés/olvasás rögzítése
        //
        // Ha a tartalom még nincs a user könyvtárában/előzményeiben,
        // létrejön egy rekord WATCHING státusszal.
        // Ha már létezik, LastSeen frissül és bármely nem-WATCHING
        // státusz WATCHING-ra vált.
        // ================================================================
        [HttpPost("view")]
        public async Task<IActionResult> RecordView([FromBody] RecordViewDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var normalizedType = dto.ContentType.Trim().ToLowerInvariant();
                var now = DateTime.Now;
                var created = false;

                switch (normalizedType)
                {
                    case "book":
                    {
                        if (!await _context.Books.AnyAsync(b => b.Id == dto.ContentId))
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A könyv nem található" });

                        var userBook = await _context.UserBooks
                            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == dto.ContentId);

                        if (userBook == null)
                        {
                            _context.UserBooks.Add(new UserBook
                            {
                                UserId = userId,
                                BookId = dto.ContentId,
                                Status = "WATCHING",
                                AddedAt = now,
                                LastSeen = now,
                                CurrentPage = 0,
                                CurrentAudioPosition = 0
                            });
                            created = true;
                        }
                        else
                        {
                            userBook.LastSeen = GetNextLastSeen(userBook.LastSeen);
                            if (!string.Equals(userBook.Status, "WATCHING", StringComparison.OrdinalIgnoreCase))
                            {
                                userBook.Status = "WATCHING";
                            }
                        }

                        break;
                    }

                    case "movie":
                    {
                        if (!await _context.Movies.AnyAsync(m => m.Id == dto.ContentId))
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A film nem található" });

                        var userMovie = await _context.UserMovies
                            .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == dto.ContentId);

                        if (userMovie == null)
                        {
                            _context.UserMovies.Add(new UserMovie
                            {
                                UserId = userId,
                                MovieId = dto.ContentId,
                                Status = "WATCHING",
                                AddedAt = now,
                                LastSeen = now,
                                CurrentPosition = 0
                            });
                            created = true;
                        }
                        else
                        {
                            userMovie.LastSeen = GetNextLastSeen(userMovie.LastSeen);
                            if (!string.Equals(userMovie.Status, "WATCHING", StringComparison.OrdinalIgnoreCase))
                            {
                                userMovie.Status = "WATCHING";
                            }
                        }

                        break;
                    }

                    case "series":
                    {
                        if (!await _context.Series.AnyAsync(s => s.Id == dto.ContentId))
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "A sorozat nem található" });

                        var userSeries = await _context.UserSeries
                            .FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == dto.ContentId);

                        if (userSeries == null)
                        {
                            _context.UserSeries.Add(new UserSeries
                            {
                                UserId = userId,
                                SeriesId = dto.ContentId,
                                Status = "WATCHING",
                                AddedAt = now,
                                LastSeen = now,
                                CurrentSeason = 1,
                                CurrentEpisode = 1,
                                CurrentPosition = 0
                            });
                            created = true;
                        }
                        else
                        {
                            userSeries.LastSeen = GetNextLastSeen(userSeries.LastSeen);
                            if (!string.Equals(userSeries.Status, "WATCHING", StringComparison.OrdinalIgnoreCase))
                            {
                                userSeries.Status = "WATCHING";
                            }
                        }

                        break;
                    }

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidType",
                            Message = "Érvénytelen tartalom típus. Lehetséges: book, series, movie"
                        });
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = created
                        ? "A tartalom bekerült a könyvtárba és az előzményekbe."
                        : "A tartalom előzménye frissítve.",
                    created
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // POST /api/history/touch
        // Csak a LastSeen frissítése meglévő előzmény rekordra
        // ================================================================
        [HttpPost("touch")]
        public async Task<IActionResult> TouchHistoryItem([FromBody] RecordViewDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var normalizedType = dto.ContentType.Trim().ToLowerInvariant();

                switch (normalizedType)
                {
                    case "book":
                    {
                        var userBook = await _context.UserBooks
                            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == dto.ContentId);
                        if (userBook == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        userBook.LastSeen = GetNextLastSeen(userBook.LastSeen);
                        break;
                    }

                    case "movie":
                    {
                        var userMovie = await _context.UserMovies
                            .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == dto.ContentId);
                        if (userMovie == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        userMovie.LastSeen = GetNextLastSeen(userMovie.LastSeen);
                        break;
                    }

                    case "series":
                    {
                        var userSeries = await _context.UserSeries
                            .FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == dto.ContentId);
                        if (userSeries == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        userSeries.LastSeen = GetNextLastSeen(userSeries.LastSeen);
                        break;
                    }

                    default:
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidType",
                            Message = "Érvénytelen tartalom típus. Lehetséges: book, series, movie"
                        });
                }

                await _context.SaveChangesAsync();
                return Ok(new MessageResponseDTO { Message = "A LastSeen sikeresen frissítve" });
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
                var normalizedStatus = dto.Status?.Trim().ToUpperInvariant();

                if (!string.IsNullOrEmpty(normalizedStatus) && !validStatuses.Contains(normalizedStatus))
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
                            .Include(ub => ub.Book)
                            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == dto.ContentId);

                        if (userBook == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        if (dto.Progress.HasValue)
                        {
                            var normalizedProgress = Math.Max(0, dto.Progress.Value);
                            var maxPage = Math.Max(1, userBook.Book.PageNum);
                            userBook.CurrentPage = Math.Min(normalizedProgress, maxPage);
                        }

                        var currentPage = Math.Max(0, userBook.CurrentPage ?? 0);
                        var totalPages = Math.Max(1, userBook.Book.PageNum);
                        var isAlreadyCompleted = string.Equals(userBook.Status, "COMPLETED", StringComparison.OrdinalIgnoreCase);

                        if (!string.IsNullOrEmpty(normalizedStatus))
                        {
                            if (normalizedStatus == "COMPLETED" && currentPage < totalPages)
                            {
                                return BadRequest(new ErrorResponseDTO
                                {
                                    Error = "InvalidProgress",
                                    Message = "A könyv csak teljes előrehaladásnál állítható COMPLETED státuszra."
                                });
                            }

                            if (!(isAlreadyCompleted && normalizedStatus != "COMPLETED"))
                            {
                                userBook.Status = normalizedStatus;
                            }
                        }
                        else if (!isAlreadyCompleted && currentPage >= totalPages)
                        {
                            userBook.Status = "COMPLETED";
                        }

                        if (dto.Rating.HasValue)
                        {
                            if (dto.Rating < 0 || dto.Rating > 10)
                                return BadRequest(new ErrorResponseDTO { Error = "InvalidRating", Message = "Az értékelés 0 és 10 között kell legyen" });
                            userBook.Rating = dto.Rating.Value;
                        }
                        userBook.LastSeen = GetNextLastSeen(userBook.LastSeen);
                        break;
                    }

                    case "series":
                    {
                        var userSeries = await _context.UserSeries
                            .FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == dto.ContentId);

                        if (userSeries == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        if (dto.Progress.HasValue) userSeries.CurrentEpisode = dto.Progress.Value;
                        var seriesCompleted = string.Equals(userSeries.Status, "COMPLETED", StringComparison.OrdinalIgnoreCase);
                        if (!string.IsNullOrEmpty(normalizedStatus) && !(seriesCompleted && normalizedStatus != "COMPLETED"))
                            userSeries.Status = normalizedStatus;
                        if (dto.Rating.HasValue)
                        {
                            if (dto.Rating < 0 || dto.Rating > 10)
                                return BadRequest(new ErrorResponseDTO { Error = "InvalidRating", Message = "Az értékelés 0 és 10 között kell legyen" });
                            userSeries.Rating = dto.Rating.Value;
                        }
                        userSeries.LastSeen = GetNextLastSeen(userSeries.LastSeen);
                        break;
                    }

                    case "movie":
                    {
                        var userMovie = await _context.UserMovies
                            .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == dto.ContentId);

                        if (userMovie == null)
                            return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Az előzmény nem található" });

                        if (dto.Progress.HasValue) userMovie.CurrentPosition = dto.Progress.Value;
                        var movieCompleted = string.Equals(userMovie.Status, "COMPLETED", StringComparison.OrdinalIgnoreCase);
                        if (!string.IsNullOrEmpty(normalizedStatus) && !(movieCompleted && normalizedStatus != "COMPLETED"))
                            userMovie.Status = normalizedStatus;
                        if (dto.Rating.HasValue)
                        {
                            if (dto.Rating < 0 || dto.Rating > 10)
                                return BadRequest(new ErrorResponseDTO { Error = "InvalidRating", Message = "Az értékelés 0 és 10 között kell legyen" });
                            userMovie.Rating = dto.Rating.Value;
                        }
                        userMovie.LastSeen = GetNextLastSeen(userMovie.LastSeen);
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
            catch (DbUpdateException ex)
            {
                var dbMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new ErrorResponseDTO
                {
                    Error = "InvalidStateTransition",
                    Message = dbMessage
                });
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

        private static DateTime GetNextLastSeen(DateTime? currentLastSeen)
        {
            var now = DateTime.Now;
            if (!currentLastSeen.HasValue)
                return now;

            // DATETIME mező másodperces pontosságú, ezért gyors frissítésnél
            // legalább +1 mp-cel biztosan előre léptetjük az értéket.
            var minNext = currentLastSeen.Value.AddSeconds(1);
            return now <= minNext ? minNext : now;
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
            TotalUnits  = ub.Book.PageNum,
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
            TotalUnits  = um.Movie.Length,
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
            TotalUnits  = us.Series.Episodes.Count,
            Rating      = us.Rating,
            LastSeen    = us.LastSeen,
            AddedAt     = us.AddedAt
        };
    }
}
