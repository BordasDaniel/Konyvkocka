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
    public class UserController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public UserController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/user/profile
        // Bejelentkezett felhasználó teljes profilja:
        // alap adatok + statisztikák + jelvények + rangcímek
        // ================================================================
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var booksCompleted  = await _context.UserBooks.CountAsync(ub => ub.UserId == userId && ub.Status == "COMPLETED");
                var moviesCompleted = await _context.UserMovies.CountAsync(um => um.UserId == userId && um.Status == "COMPLETED");
                var seriesCompleted = await _context.UserSeries.CountAsync(us => us.UserId == userId && us.Status == "COMPLETED");

                var badges = await _context.UserBadges
                    .Where(ub => ub.UserId == userId)
                    .Include(ub => ub.Badge)
                    .OrderByDescending(ub => ub.EarnedAt)
                    .Select(ub => new UserBadgeDTO
                    {
                        Id          = ub.Badge.Id,
                        Name        = ub.Badge.Name,
                        Description = ub.Badge.Description,
                        IconUrl     = ub.Badge.IconUrl,
                        Category    = ub.Badge.Category,
                        Rarity      = ub.Badge.Rarity,
                        EarnedAt    = ub.EarnedAt
                    })
                    .ToListAsync();

                var titles = await _context.UserTitles
                    .Where(ut => ut.UserId == userId)
                    .Include(ut => ut.Title)
                    .OrderByDescending(ut => ut.EarnedAt)
                    .Select(ut => new UserTitleDTO
                    {
                        Id          = ut.Title.Id,
                        Name        = ut.Title.Name,
                        Description = ut.Title.Description,
                        Rarity      = ut.Title.Rarity,
                        EarnedAt    = ut.EarnedAt,
                        IsActive    = ut.IsActive
                    })
                    .ToListAsync();

                var activeTitle = titles.FirstOrDefault(t => t.IsActive)?.Name;

                return Ok(new UserProfileDTO
                {
                    Id               = user.Id,
                    Username         = user.Username,
                    Avatar           = user.ProfilePic,
                    CountryCode      = user.CountryCode,
                    Level            = user.Level,
                    Xp               = user.Xp,
                    IsSubscriber     = user.Premium,
                    PremiumExpiresAt = user.PremiumExpiresAt,
                    PermissionLevel  = user.PermissionLevel ?? "USER",
                    Email            = user.Email,
                    CreationDate     = user.CreationDate,
                    LastLoginDate    = user.LastLoginDate,
                    ActiveTitle      = activeTitle,
                    Stats = new UserStatsDTO
                    {
                        ReadTimeMin     = user.ReadTimeMin,
                        WatchTimeMin    = user.WatchTimeMin,
                        BooksCompleted  = booksCompleted,
                        MoviesCompleted = moviesCompleted,
                        SeriesCompleted = seriesCompleted,
                        DayStreak       = user.DayStreak,
                        BookPoints      = user.BookPoints,
                        SeriesPoints    = user.SeriesPoints,
                        MoviePoints     = user.MoviePoints,
                        TotalPoints     = user.BookPoints + user.SeriesPoints + user.MoviePoints
                    },
                    Badges = badges,
                    Titles = titles
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/stats
        // Részletes statisztikák + rangsor adatok a user_rank_cache alapján
        // A user_rank_cache nincs a DbContext-ben, raw SQL-lel kérjük le
        // ================================================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var booksCompleted  = await _context.UserBooks.CountAsync(ub => ub.UserId == userId && ub.Status == "COMPLETED");
                var moviesCompleted = await _context.UserMovies.CountAsync(um => um.UserId == userId && um.Status == "COMPLETED");
                var seriesCompleted = await _context.UserSeries.CountAsync(us => us.UserId == userId && us.Status == "COMPLETED");

                // user_rank_cache: nincs DbSet, raw SQL-lel kérjük
                // Oszlopnevek: GlobalRank_Total, CountryRank_Total, GlobalRank_Book, GlobalRank_Media
                int? globalRank = null, countryRank = null, globalBookRank = null, globalMediaRank = null;

                try
                {
                    var rankRow = await _context.Database
                        .SqlQueryRaw<RankCacheRow>(
                            @"SELECT 
                                `GlobalRank_Total`  AS GlobalRankTotal,
                                `CountryRank_Total` AS CountryRankTotal,
                                `GlobalRank_Book`   AS GlobalRankBook,
                                `GlobalRank_Media`  AS GlobalRankMedia
                              FROM user_rank_cache
                              WHERE UserId = {0}
                              LIMIT 1", userId)
                        .FirstOrDefaultAsync();

                    if (rankRow != null)
                    {
                        globalRank      = rankRow.GlobalRankTotal;
                        countryRank     = rankRow.CountryRankTotal;
                        globalBookRank  = rankRow.GlobalRankBook;
                        globalMediaRank = rankRow.GlobalRankMedia;
                    }
                }
                catch
                {
                    // Ha a cache tábla még nem frissült vagy nem létezik a sor, null marad
                }

                return Ok(new UserStatisticsDTO
                {
                    BookPoints      = user.BookPoints,
                    SeriesPoints    = user.SeriesPoints,
                    MoviePoints     = user.MoviePoints,
                    TotalPoints     = user.BookPoints + user.SeriesPoints + user.MoviePoints,
                    Level           = user.Level,
                    Xp              = user.Xp,
                    DayStreak       = user.DayStreak,
                    ReadTimeMin     = user.ReadTimeMin,
                    WatchTimeMin    = user.WatchTimeMin,
                    BooksCompleted  = booksCompleted,
                    MoviesCompleted = moviesCompleted,
                    SeriesCompleted = seriesCompleted,
                    GlobalRank      = globalRank,
                    CountryRank     = countryRank,
                    GlobalBookRank  = globalBookRank,
                    GlobalMediaRank = globalMediaRank
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PATCH /api/user/title/{titleId}/activate
        // Aktív rangcím beállítása – egyszerre csak egy lehet aktív
        // ================================================================
        [HttpPatch("title/{titleId}/activate")]
        public async Task<IActionResult> SetActiveTitle(int titleId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var userTitle = await _context.UserTitles
                    .FirstOrDefaultAsync(ut => ut.UserId == userId && ut.TitleId == titleId);

                if (userTitle == null)
                    return NotFound(new ErrorResponseDTO
                    {
                        Error   = "NotFound",
                        Message = "Ez a rangcím nem szerepel a gyűjteményedben."
                    });

                // Összes korábbi active title kikapcsolása
                var allUserTitles = await _context.UserTitles
                    .Where(ut => ut.UserId == userId && ut.IsActive)
                    .ToListAsync();

                foreach (var t in allUserTitles)
                    t.IsActive = false;

                userTitle.IsActive = true;

                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO { Message = "Aktív rangcím sikeresen beállítva." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/{userId}/public
        // Más felhasználó publikus profilja (email és érzékeny adatok nélkül)
        // ================================================================
        [HttpGet("{userId}/public")]
        public async Task<IActionResult> GetPublicProfile(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var booksCompleted  = await _context.UserBooks.CountAsync(ub => ub.UserId == userId && ub.Status == "COMPLETED");
                var moviesCompleted = await _context.UserMovies.CountAsync(um => um.UserId == userId && um.Status == "COMPLETED");
                var seriesCompleted = await _context.UserSeries.CountAsync(us => us.UserId == userId && us.Status == "COMPLETED");

                var activeTitle = await _context.UserTitles
                    .Where(ut => ut.UserId == userId && ut.IsActive)
                    .Include(ut => ut.Title)
                    .Select(ut => ut.Title.Name)
                    .FirstOrDefaultAsync();

                // Publikus profilnál csak a nem rejtett jelvények látszanak
                var badges = await _context.UserBadges
                    .Where(ub => ub.UserId == userId && !ub.Badge.IsHidden)
                    .Include(ub => ub.Badge)
                    .OrderByDescending(ub => ub.EarnedAt)
                    .Select(ub => new UserBadgeDTO
                    {
                        Id          = ub.Badge.Id,
                        Name        = ub.Badge.Name,
                        Description = ub.Badge.Description,
                        IconUrl     = ub.Badge.IconUrl,
                        Category    = ub.Badge.Category,
                        Rarity      = ub.Badge.Rarity,
                        EarnedAt    = ub.EarnedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    id           = user.Id,
                    username     = user.Username,
                    avatar       = user.ProfilePic,
                    countryCode  = user.CountryCode,
                    level        = user.Level,
                    isPremium    = user.Premium,
                    activeTitle,
                    creationDate = user.CreationDate,
                    stats = new
                    {
                        booksCompleted,
                        moviesCompleted,
                        seriesCompleted,
                        dayStreak   = user.DayStreak,
                        totalPoints = user.BookPoints + user.SeriesPoints + user.MoviePoints
                    },
                    badges
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // Belső segédosztály a raw SQL user_rank_cache projekcióhoz
        // ================================================================
        private class RankCacheRow
        {
            public int? GlobalRankTotal { get; set; }
            public int? CountryRankTotal { get; set; }
            public int? GlobalRankBook { get; set; }
            public int? GlobalRankMedia { get; set; }
        }
    }
}
