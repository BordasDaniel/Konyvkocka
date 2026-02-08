//using KonyvkockaAPI.DTO;
//using KonyvkockaAPI.DTO.Response;
//using KonyvkockaAPI.Services;
//using KonyvkockaAPI.Models;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using System.Globalization;

//namespace KonyvkockaAPI.Controllers
//{
//    [Route("[controller]")]
//    [ApiController]
//    [Authorize]
//    public class UserController : ControllerBase
//    {
//        private readonly KonyvkockaContext _context;
//        private readonly ICountryService _countryService;

//        public UserController(KonyvkockaContext context, ICountryService countryService)
//        {
//            _context = context;
//            _countryService = countryService;
//        }

//        /// <summary>
//        /// Felhasználói profil lekérése
//        /// GET /api/user/profile
//        /// </summary>
//        [HttpGet("profile")]
//        public async Task<IActionResult> GetProfile()
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
//                var user = await _context.Users.FindAsync(userId);

//                if (user == null)
//                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

//                var booksCompleted = await _context.UserBooks
//                    .Where(ub => ub.UserId == userId && ub.Status == "COMPLETED")
//                    .CountAsync();

//                var moviesWatched = await _context.UserMovies
//                    .Where(um => um.UserId == userId && um.Status == "COMPLETED")
//                    .CountAsync();

//                var seriesWatched = await _context.UserSeries
//                    .Where(us => us.UserId == userId && us.Status == "COMPLETED")
//                    .CountAsync();

//                var countryName = _countryService.GetCountryName(user.CountryCode);
//                var countryFlag = _countryService.GetCountryFlag(user.CountryCode);

//                var response = new UserProfileDTO
//                {
//                    Username = user.Username,
//                    Avatar = user.ProfilePic,
//                    Country = countryName,
//                    CountryFlag = countryFlag,
//                    Level = user.Level,
//                    LevelProgress = 0.75m, // TODO: Calculate based on XP system
//                    IsSubscriber = user.Premium,
//                    Email = user.Email,
//                    Stats = new UserStatsDTO
//                    {
//                        ReadTimeMin = user.ReadTimeMin,
//                        WatchTimeMin = user.WatchTimeMin,
//                        BooksCompleted = booksCompleted,
//                        MoviesWatched = moviesWatched,
//                        SeriesWatched = seriesWatched,
//                        DayStreak = user.DayStreak
//                    }
//                };

//                return Ok(response);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        [HttpGet("User{id}")]
//        public async Task<IActionResult> GetUserById(int id)
//        {
//            try
//            {
//                var user = await _context.Users.FindAsync(id);

//                if (user == null)
//                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

//                var response = new UserMeDTO
//                {
//                    Id = user.Id,
//                    Username = user.Username,
//                    Email = user.Email,
//                    Avatar = user.ProfilePic,
//                    IsSubscriber = user.Premium
//                };

//                return Ok(response);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        [HttpGet("AllUser")]
//        public async Task<IActionResult> GetAllUsers()
//        {
//            try
//            {
//                var users = await _context.Users.ToListAsync();

//                var response = users.Select(user => new UserMeDTO
//                {
//                    Id = user.Id,
//                    Username = user.Username,
//                    Email = user.Email,
//                    Avatar = user.ProfilePic,
//                    IsSubscriber = user.Premium
//                }).ToList();

//                return Ok(response);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        /// <summary>
//        /// Felhasználói statisztikák
//        /// GET /api/user/stats
//        /// </summary>
//        [HttpGet("stats")]
//        public async Task<IActionResult> GetStats()
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
//                var user = await _context.Users.FindAsync(userId);

//                if (user == null)
//                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

//                var booksCompleted = await _context.UserBooks
//                    .Where(ub => ub.UserId == userId && ub.Status == "COMPLETED")
//                    .CountAsync();

//                var moviesCompleted = await _context.UserMovies
//                    .Where(um => um.UserId == userId && um.Status == "COMPLETED")
//                    .CountAsync();

//                var seriesCompleted = await _context.UserSeries
//                    .Where(us => us.UserId == userId && us.Status == "COMPLETED")
//                    .CountAsync();

//                var totalPoints = user.BookPoints + user.SeriesPoints + user.MoviePoints;

//                // TODO: Implement real ranking system
//                var globalRank = 1234;
//                var countryRank = 45;

//                var response = new UserStatisticsDTO
//                {
//                    BookPoints = user.BookPoints,
//                    SeriesPoints = user.SeriesPoints,
//                    MoviePoints = user.MoviePoints,
//                    TotalPoints = totalPoints,
//                    Level = user.Level,
//                    DayStreak = user.DayStreak,
//                    ReadTimeMin = user.ReadTimeMin,
//                    WatchTimeMin = user.WatchTimeMin,
//                    BooksCompleted = booksCompleted,
//                    MoviesCompleted = moviesCompleted,
//                    SeriesCompleted = seriesCompleted,
//                    GlobalRank = globalRank,
//                    CountryRank = countryRank
//                };

//                return Ok(response);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        /// <summary>
//        /// Felhasználó olvasott könyvei
//        /// GET /api/user/read-books
//        /// </summary>
//        [HttpGet("read-books")]
//        public async Task<IActionResult> GetReadBooks([FromQuery] string? status = null, [FromQuery] int limit = 20)
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

//                // Keep the query typed as IQueryable so we can apply additional filters
//                // after Include without IIncludableQueryable assignment issues.
//                IQueryable<UserBook> query = _context.UserBooks
//                    .Where(ub => ub.UserId == userId)
//                    .Include(ub => ub.Book);

//                if (!string.IsNullOrEmpty(status))
//                {
//                    query = query.Where(ub => ub.Status == status.ToUpper());
//                }

//                var userBooks = await query
//                    .Take(limit)
//                    .Select(ub => new BookItemDTO
//                    {
//                        Id = ub.Book.Id,
//                        Title = ub.Book.Title,
//                        Img = ub.Book.CoverApiName,
//                        Status = ub.Status == "WATCHING" ? "reading" : ub.Status.ToLower(),
//                        Favorite = ub.Favorite,
//                        Rating = ub.Rating,
//                        AddedAt = ub.AddedAt,
//                        CompletedAt = ub.CompletedAt,
//                        CurrentPage = ub.CurrentPage ?? 0,
//                        Pages = ub.Book.PageNum,
//                        Type = "book"
//                    })
//                    .ToListAsync();

//                var total = await _context.UserBooks
//                    .Where(ub => ub.UserId == userId)
//                    .CountAsync();

//                return Ok(new { books = userBooks, total });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }

//        /// <summary>
//        /// Felhasználó medáljai (achievements)
//        /// GET /api/user/medals
//        /// </summary>
//        [HttpGet("medals")]
//        public async Task<IActionResult> GetMedals()
//        {
//            try
//            {
//                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

//                var achievements = await _context.Achievements
//                    .Where(a => a.UserId == userId)
//                    .Select(a => new AchievementDTO
//                    {
//                        Id = a.Id,
//                        Title = a.Title,
//                        Description = a.Description,
//                        Icon = a.LogoUrl,
//                        AchieveDate = a.AchieveDate,
//                        // Model uses bool, DTO expects int
//                        Rarity = a.Rarity ? 1 : 0,
//                        Category = a.Category
//                    })
//                    .ToListAsync();

//                return Ok(new { achievements });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
//            }
//        }
//    }
//}
