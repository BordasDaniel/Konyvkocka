//using KonyvkockaAPI.DTO;
//using KonyvkockaAPI.DTO.Request;
//using KonyvkockaAPI.DTO.Response;
//using KonyvkockaAPI.Models;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;

//namespace KonyvkockaAPI.Controllers
//{
//    [Route("[controller]")]
//    [ApiController]
//    [Authorize]
//    public class HistoryController : ControllerBase
//    {
//        private readonly KonyvkockaContext _context;

//        public HistoryController(KonyvkockaContext context)
//        {
//            _context = context;
//        }

//        /// <summary>
//        /// Megtekintési előzmények lekérése
//        /// GET /api/history?type=all&limit=20&offset=0
//        /// Típusok: all, books, series, movies
//        /// </summary>
//        [HttpGet]
//        public async Task<IActionResult> GetHistory(
//            [FromQuery] string type = "all",
//            [FromQuery] int limit = 20,
//            [FromQuery] int offset = 0)
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

//                if (type.ToLower() == "books" || type.ToLower() == "all")
//                {
//                    var bookHistory = await _context.UserBooks
//                        .Where(ub => ub.UserId == userId)
//                        .OrderByDescending(ub => ub.LastSeen ?? ub.AddedAt)
//                        .Skip(offset)
//                        .Take(limit)
//                        .Include(ub => ub.Book)
//                        .Select(ub => new HistoryItemDTO
//                        {
//                            Id = ub.BookId,
//                            ContentType = "book",
//                            ContentId = ub.BookId,
//                            Title = ub.Book.Title,
//                            Author = ub.Book.Authors
//                                .OrderBy(a => a.Name)
//                                .Select(a => a.Name)
//                                .FirstOrDefault(),
//                            Cover = ub.Book.CoverApiName,
//                            Status = ub.Status,
//                            Rating = ub.Rating,
//                            Progress = ub.CurrentPage,
//                            LastRead = ub.LastSeen ?? ub.AddedAt ?? DateTime.MinValue
//                        })
//                        .ToListAsync();

//                    return Ok(new
//                    {
//                        type,
//                        history = bookHistory,
//                        total = await _context.UserBooks
//                            .Where(ub => ub.UserId == userId)
//                            .CountAsync(),
//                        limit,
//                        offset
//                    });
//                }

//                if (type.ToLower() == "series" || type.ToLower() == "all")
//                {
//                    var seriesHistory = await _context.UserSeries
//                        .Where(us => us.UserId == userId)
//                        .OrderByDescending(us => us.LastSeen ?? us.AddedAt)
//                        .Skip(offset)
//                        .Take(limit)
//                        .Include(us => us.Series)
//                        .Select(us => new HistoryItemDTO
//                        {
//                            Id = us.SeriesId,
//                            ContentType = "series",
//                            ContentId = us.SeriesId,
//                            Title = us.Series.Title,
//                            PosterUrl = us.Series.PosterApiName,
//                            Status = us.Status,
//                            Rating = us.Rating,
//                            Progress = us.CurrentEpisode,
//                            LastWatched = us.LastSeen ?? us.AddedAt ?? DateTime.MinValue
//                        })
//                        .ToListAsync();

//                    return Ok(new
//                    {
//                        type,
//                        history = seriesHistory,
//                        total = await _context.UserSeries
//                            .Where(us => us.UserId == userId)
//                            .CountAsync(),
//                        limit,
//                        offset
//                    });
//                }

//                if (type.ToLower() == "movies" || type.ToLower() == "all")
//                {
//                    var movieHistory = await _context.UserMovies
//                        .Where(um => um.UserId == userId)
//                        .OrderByDescending(um => um.LastSeen ?? um.AddedAt)
//                        .Skip(offset)
//                        .Take(limit)
//                        .Include(um => um.Movie)
//                        .Select(um => new HistoryItemDTO
//                        {
//                            Id = um.MovieId,
//                            ContentType = "movie",
//                            ContentId = um.MovieId,
//                            Title = um.Movie.Title,
//                            PosterUrl = um.Movie.PosterApiName,
//                            Status = um.Status,
//                            Rating = um.Rating,
//                            Progress = um.CurrentPosition,
//                            LastWatched = um.LastSeen ?? um.AddedAt ?? DateTime.MinValue
//                        })
//                        .ToListAsync();

//                    return Ok(new
//                    {
//                        type,
//                        history = movieHistory,
//                        total = await _context.UserMovies
//                            .Where(um => um.UserId == userId)
//                            .CountAsync(),
//                        limit,
//                        offset
//                    });
//                }

//                return BadRequest(new ErrorResponseDTO
//                {
//                    Error = "Invalid parameter",
//                    Message = "A típus nem megfelelő (books, series, movies, all)"
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO
//                {
//                    Error = "InternalError",
//                    Message = ex.Message
//                });
//            }
//        }

//        /// <summary>
//        /// Előzmény frissítése (progress, status, rating)
//        /// POST /api/history
//        /// </summary>
//        [HttpPost]
//        public async Task<IActionResult> UpdateHistory([FromBody] UpdateHistoryDTO updateDto)
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

//                switch (updateDto.ContentType.ToLower())
//                {
//                    case "book":
//                        var userBook = await _context.UserBooks
//                            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == updateDto.ContentId);

//                        if (userBook == null)
//                        {
//                            return NotFound(new ErrorResponseDTO
//                            {
//                                Error = "Not found",
//                                Message = "Az előzmény nem található"
//                            });
//                        }

//                        if (updateDto.Progress.HasValue)
//                            userBook.CurrentPage = updateDto.Progress.Value;
//                        if (!string.IsNullOrEmpty(updateDto.Status))
//                            userBook.Status = updateDto.Status;
//                        if (updateDto.Rating.HasValue)
//                            userBook.Rating = updateDto.Rating.Value;

//                        userBook.LastSeen = DateTime.Now;
//                        break;

//                    case "series":
//                        var userSeries = await _context.UserSeries
//                            .FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == updateDto.ContentId);

//                        if (userSeries == null)
//                        {
//                            return NotFound(new ErrorResponseDTO
//                            {
//                                Error = "Not found",
//                                Message = "Az előzmény nem található"
//                            });
//                        }

//                        if (updateDto.Progress.HasValue)
//                            userSeries.CurrentEpisode = updateDto.Progress.Value;
//                        if (!string.IsNullOrEmpty(updateDto.Status))
//                            userSeries.Status = updateDto.Status;
//                        if (updateDto.Rating.HasValue)
//                            userSeries.Rating = updateDto.Rating.Value;

//                        userSeries.LastSeen = DateTime.Now;
//                        break;

//                    case "movie":
//                        var userMovie = await _context.UserMovies
//                            .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == updateDto.ContentId);

//                        if (userMovie == null)
//                        {
//                            return NotFound(new ErrorResponseDTO
//                            {
//                                Error = "Not found",
//                                Message = "Az előzmény nem található"
//                            });
//                        }

//                        if (updateDto.Progress.HasValue)
//                            userMovie.CurrentPosition = updateDto.Progress.Value;
//                        if (!string.IsNullOrEmpty(updateDto.Status))
//                            userMovie.Status = updateDto.Status;
//                        if (updateDto.Rating.HasValue)
//                            userMovie.Rating = updateDto.Rating.Value;

//                        userMovie.LastSeen = DateTime.Now;
//                        break;

//                    default:
//                        return BadRequest(new ErrorResponseDTO
//                        {
//                            Error = "Invalid parameter",
//                            Message = "Az előzmény típusa nem megfelelő"
//                        });
//                }

//                await _context.SaveChangesAsync();

//                return Ok(new MessageResponseDTO
//                {
//                    Message = "Az előzmény sikeresen frissítve"
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO
//                {
//                    Error = "InternalError",
//                    Message = ex.Message
//                });
//            }
//        }

//        /// <summary>
//        /// Előzmény törlése
//        /// DELETE /api/history/{contentType}/{contentId}
//        /// </summary>
//        [HttpDelete("{contentType}/{contentId}")]
//        public async Task<IActionResult> DeleteHistory(string contentType, int contentId)
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

//                switch (contentType.ToLower())
//                {
//                    case "book":
//                        var userBook = await _context.UserBooks
//                            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == contentId);
//                        if (userBook != null)
//                            _context.UserBooks.Remove(userBook);
//                        break;

//                    case "series":
//                        var userSeries = await _context.UserSeries
//                            .FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == contentId);
//                        if (userSeries != null)
//                            _context.UserSeries.Remove(userSeries);
//                        break;

//                    case "movie":
//                        var userMovie = await _context.UserMovies
//                            .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == contentId);
//                        if (userMovie != null)
//                            _context.UserMovies.Remove(userMovie);
//                        break;

//                    default:
//                        return BadRequest(new ErrorResponseDTO
//                        {
//                            Error = "Invalid parameter",
//                            Message = "Az előzmény típusa nem megfelelő"
//                        });
//                }

//                await _context.SaveChangesAsync();

//                return Ok(new MessageResponseDTO
//                {
//                    Message = "Az előzmény sikeresen törölve"
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO
//                {
//                    Error = "InternalError",
//                    Message = ex.Message
//                });
//            }
//        }

//        /// <summary>
//        /// Összes előzmény törlése
//        /// DELETE /api/history/clear-all
//        /// </summary>
//        [HttpDelete("clear-all")]
//        public async Task<IActionResult> ClearAllHistory()
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

//                var userBooks = await _context.UserBooks
//                    .Where(ub => ub.UserId == userId)
//                    .ToListAsync();

//                var userSeries = await _context.UserSeries
//                    .Where(us => us.UserId == userId)
//                    .ToListAsync();

//                var userMovies = await _context.UserMovies
//                    .Where(um => um.UserId == userId)
//                    .ToListAsync();

//                _context.UserBooks.RemoveRange(userBooks);
//                _context.UserSeries.RemoveRange(userSeries);
//                _context.UserMovies.RemoveRange(userMovies);

//                await _context.SaveChangesAsync();

//                return Ok(new MessageResponseDTO
//                {
//                    Message = "Az összes előzmény sikeresen törölve"
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO
//                {
//                    Error = "InternalError",
//                    Message = ex.Message
//                });
//            }
//        }
//    }
//}