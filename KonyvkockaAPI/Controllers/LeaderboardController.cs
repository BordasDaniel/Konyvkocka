using KonyvkockaAPI.DTO;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class LeaderboardController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public LeaderboardController(KonyvkockaContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Ranglista lekérése különböző kategóriák szerint
        /// GET /api/leaderboard?category=all&limit=50&offset=0
        /// Kategóriák: all, books, series, movies, reading-time, watch-time, day-streak
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetLeaderboard(
            [FromQuery] string category = "all",
            [FromQuery] int limit = 50,
            [FromQuery] int offset = 0)
        {
            try
            {
                IQueryable<User> query = _context.Users;

                // Rendezés kategória alapján
                switch (category.ToLower())
                {
                    case "books":
                        query = query.OrderByDescending(u => u.BookPoints).ThenByDescending(u => u.Level);
                        break;
                    case "series":
                        query = query.OrderByDescending(u => u.SeriesPoints).ThenByDescending(u => u.Level);
                        break;
                    case "movies":
                        query = query.OrderByDescending(u => u.MoviePoints).ThenByDescending(u => u.Level);
                        break;
                    case "reading-time":
                        query = query.OrderByDescending(u => u.ReadTimeMin).ThenByDescending(u => u.Level);
                        break;
                    case "watch-time":
                        query = query.OrderByDescending(u => u.WatchTimeMin).ThenByDescending(u => u.Level);
                        break;
                    case "day-streak":
                        query = query.OrderByDescending(u => u.DayStreak).ThenByDescending(u => u.Level);
                        break;
                    default: // all - combined score
                        query = query.OrderByDescending(u => u.BookPoints + u.SeriesPoints + u.MoviePoints)
                                    .ThenByDescending(u => u.Level);
                        break;
                }

                var total = await query.CountAsync();

                var leaderboard = await query
                    .Skip(offset)
                    .Take(limit)
                    .Select((u, index) => new
                    {
                        rank = offset + index + 1,
                        userId = u.Id,
                        username = u.Username,
                        avatar = u.ProfilePic,
                        level = u.Level,
                        bookPoints = u.BookPoints,
                        seriesPoints = u.SeriesPoints,
                        moviePoints = u.MoviePoints,
                        readTimeMin = u.ReadTimeMin,
                        watchTimeMin = u.WatchTimeMin,
                        dayStreak = u.DayStreak,
                        totalScore = u.BookPoints + u.SeriesPoints + u.MoviePoints,
                        isPremium = u.Premium
                    })
                    .ToListAsync();

                // Aktuális felhasználó rang keresése
                var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var userRank = await query
                    .Where(u => u.Id == currentUserId)
                    .Select((u, index) => new { Rank = index + 1, User = u })
                    .FirstOrDefaultAsync();

                var userRankPosition = userRank?.Rank ?? 0;

                return Ok(new
                {
                    category,
                    leaderboard,
                    total,
                    yourRank = userRankPosition,
                    limit,
                    offset
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Felhasználó részletezettebb ranglista adatai
        /// GET /api/leaderboard/user/{userId}
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserLeaderboardStats(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "Not found",
                        Message = "A felhasználó nem található"
                    });
                }

                // Összesen elolvasott könyvek száma
                var booksCount = await _context.UserBooks
                    .Where(ub => ub.UserId == userId && ub.Status == "finished")
                    .CountAsync();

                // Összesen megtekintett sorozatok száma
                var seriesCount = await _context.UserSeries
                    .Where(us => us.UserId == userId && us.Status == "finished")
                    .CountAsync();

                // Összesen megtekintett filmek száma
                var moviesCount = await _context.UserMovies
                    .Where(um => um.UserId == userId && um.Status == "finished")
                    .CountAsync();

                return Ok(new
                {
                    userId,
                    username = user.Username,
                    avatar = user.ProfilePic,
                    level = user.Level,
                    bookPoints = user.BookPoints,
                    seriesPoints = user.SeriesPoints,
                    moviePoints = user.MoviePoints,
                    readTimeMin = user.ReadTimeMin,
                    watchTimeMin = user.WatchTimeMin,
                    dayStreak = user.DayStreak,
                    booksFinished = booksCount,
                    seriesFinished = seriesCount,
                    moviesFinished = moviesCount,
                    totalScore = user.BookPoints + user.SeriesPoints + user.MoviePoints,
                    isPremium = user.Premium,
                    creationDate = user.CreationDate,
                    lastLoginDate = user.LastLoginDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Heti ranglista
        /// GET /api/leaderboard/weekly?limit=50
        /// </summary>
        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeeklyLeaderboard(
            [FromQuery] int limit = 50,
            [FromQuery] int offset = 0)
        {
            try
            {
                var weekAgo = DateTime.Now.AddDays(-7);

                var weeklyLeaderboard = await _context.Users
                    .Where(u => u.LastLoginDate >= weekAgo)
                    .OrderByDescending(u => u.BookPoints + u.SeriesPoints + u.MoviePoints)
                    .Skip(offset)
                    .Take(limit)
                    .Select((u, index) => new
                    {
                        rank = offset + index + 1,
                        userId = u.Id,
                        username = u.Username,
                        avatar = u.ProfilePic,
                        level = u.Level,
                        weeklyScore = u.BookPoints + u.SeriesPoints + u.MoviePoints,
                        isPremium = u.Premium
                    })
                    .ToListAsync();

                var total = await _context.Users
                    .Where(u => u.LastLoginDate >= weekAgo)
                    .CountAsync();

                return Ok(new
                {
                    timeframe = "weekly",
                    leaderboard = weeklyLeaderboard,
                    total,
                    limit,
                    offset
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Havi ranglista
        /// GET /api/leaderboard/monthly?limit=50
        /// </summary>
        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthlyLeaderboard(
            [FromQuery] int limit = 50,
            [FromQuery] int offset = 0)
        {
            try
            {
                var monthAgo = DateTime.Now.AddMonths(-1);

                var monthlyLeaderboard = await _context.Users
                    .Where(u => u.LastLoginDate >= monthAgo)
                    .OrderByDescending(u => u.BookPoints + u.SeriesPoints + u.MoviePoints)
                    .Skip(offset)
                    .Take(limit)
                    .Select((u, index) => new
                    {
                        rank = offset + index + 1,
                        userId = u.Id,
                        username = u.Username,
                        avatar = u.ProfilePic,
                        level = u.Level,
                        monthlyScore = u.BookPoints + u.SeriesPoints + u.MoviePoints,
                        isPremium = u.Premium
                    })
                    .ToListAsync();

                var total = await _context.Users
                    .Where(u => u.LastLoginDate >= monthAgo)
                    .CountAsync();

                return Ok(new
                {
                    timeframe = "monthly",
                    leaderboard = monthlyLeaderboard,
                    total,
                    limit,
                    offset
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Felhasználó friends ranglista (premium feature)
        /// GET /api/leaderboard/friends
        /// </summary>
        [HttpGet("friends")]
        public async Task<IActionResult> GetFriendsLeaderboard(
            [FromQuery] int limit = 50,
            [FromQuery] int offset = 0)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                // TODO: Implement friends system
                // For now, return top 10 random users as placeholder

                var friendsLeaderboard = await _context.Users
                    .OrderByDescending(u => u.BookPoints + u.SeriesPoints + u.MoviePoints)
                    .Skip(offset)
                    .Take(limit)
                    .Select((u, index) => new
                    {
                        rank = offset + index + 1,
                        userId = u.Id,
                        username = u.Username,
                        avatar = u.ProfilePic,
                        level = u.Level,
                        score = u.BookPoints + u.SeriesPoints + u.MoviePoints,
                        isPremium = u.Premium
                    })
                    .ToListAsync();

                return Ok(new
                {
                    type = "friends",
                    leaderboard = friendsLeaderboard,
                    limit,
                    offset
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Error = "InternalError",
                    Message = ex.Message
                });
            }
        }
    }
}