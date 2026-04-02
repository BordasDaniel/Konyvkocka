using System.Security.Cryptography;
using System.Text;
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
    public class UserController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public UserController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/user/{userId}/profile
        // Publikus profil – nem kell auth
        // Alap adatok + 3 aktív jelvény + All/Media/Books statisztikák
        // ================================================================
        [HttpGet("{userId}/profile")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProfile(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var booksCompleted  = await _context.UserBooks.CountAsync(ub => ub.UserId == userId && ub.Status == "COMPLETED");
                var booksTotal      = await _context.UserBooks.CountAsync(ub => ub.UserId == userId);
                var moviesCompleted = await _context.UserMovies.CountAsync(um => um.UserId == userId && um.Status == "COMPLETED");
                var moviesTotal     = await _context.UserMovies.CountAsync(um => um.UserId == userId);
                var seriesCompleted = await _context.UserSeries.CountAsync(us => us.UserId == userId && us.Status == "COMPLETED");
                var seriesTotal     = await _context.UserSeries.CountAsync(us => us.UserId == userId);

                var mediaCompleted = moviesCompleted + seriesCompleted;
                var mediaTotal     = moviesTotal + seriesTotal;
                var allCompleted   = booksCompleted + mediaCompleted;
                var allTotal       = booksTotal + mediaTotal;

                var rankCache = await _context.UserRankCaches
                    .FirstOrDefaultAsync(r => r.UserId == userId);

                var activeTitles = await _context.UserTitles
                    .Where(ut => ut.UserId == userId && ut.IsActive)
                    .Include(ut => ut.Title)
                    .Select(ut => ut.Title.Name)
                    .ToListAsync();

                string? email = null;
                if (User?.Identity?.IsAuthenticated == true)
                {
                    var requesterIdClaim = User.FindFirst("userId")?.Value;
                    var requesterPermission = User.FindFirst("permissionLevel")?.Value;
                    if (int.TryParse(requesterIdClaim, out var requesterId) && (requesterId == userId || requesterPermission == "ADMIN"))
                    {
                        email = user.Email;
                    }
                }

                return Ok(new ProfileResponseDTO
                {
                    Id           = user.Id,
                    Username     = user.Username,
                    Avatar       = user.ProfilePic != null ? Convert.ToBase64String(user.ProfilePic) : null,
                    CountryCode  = user.CountryCode,
                    Email        = email,
                    IsSubscriber = user.Premium,
                    PremiumExpiresAt = user.PremiumExpiresAt,
                    CreationDate = user.CreationDate,
                    LastLoginDate = user.LastLoginDate,
                    Xp           = user.Xp,
                    Level        = user.Level,
                    DayStreak    = user.DayStreak,
                    BookPoints   = user.BookPoints,
                    SeriesPoints = user.SeriesPoints,
                    MoviePoints  = user.MoviePoints,
                    ActiveTitles = activeTitles,

                    All = new ProfileTabAllDTO
                    {
                        GlobalRank     = rankCache?.GlobalRankTotal,
                        CountryRank    = rankCache?.CountryRankTotal,
                        Points         = user.BookPoints + user.SeriesPoints + user.MoviePoints,
                        TimeMin        = user.ReadTimeMin + user.WatchTimeMin,
                        CompletionRate = allTotal > 0 ? Math.Round((double)allCompleted / allTotal, 2) : 0,
                        BooksCompleted = booksCompleted,
                        MediaCompleted = mediaCompleted,
                        DayStreak      = user.DayStreak
                    },

                    Media = new ProfileTabMediaDTO
                    {
                        GlobalRank     = rankCache?.GlobalRankMedia,
                        CountryRank    = rankCache?.CountryRankMedia,
                        Points         = user.SeriesPoints + user.MoviePoints,
                        WatchTimeMin   = user.WatchTimeMin,
                        CompletionRate = mediaTotal > 0 ? Math.Round((double)mediaCompleted / mediaTotal, 2) : 0,
                        Completed      = mediaCompleted,
                        Total          = mediaTotal
                    },

                    Books = new ProfileTabBooksDTO
                    {
                        GlobalRank     = rankCache?.GlobalRankBook,
                        CountryRank    = rankCache?.CountryRankBook,
                        Points         = user.BookPoints,
                        ReadTimeMin    = user.ReadTimeMin,
                        CompletionRate = booksTotal > 0 ? Math.Round((double)booksCompleted / booksTotal, 2) : 0,
                        Completed      = booksCompleted,
                        Total          = booksTotal
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/{userId}/recent/{type}
        // Legutóbb megtekintett 3 tartalom
        // type: "all" | "media" | "books"
        // ================================================================
        [HttpGet("{userId}/recent/{type}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecent(int userId, string type)
        {
            try
            {
                var normalizedType = type.ToLower();
                if (normalizedType is not ("all" or "media" or "books"))
                    return BadRequest(new ErrorResponseDTO { Error = "InvalidType", Message = "type: all | media | books" });

                var limit = 3;
                var items = new List<RecentFavoriteItemDTO>();

                if (normalizedType is "all" or "books")
                {
                    var books = await _context.UserBooks
                        .Where(ub => ub.UserId == userId)
                        .OrderByDescending(ub => ub.LastSeen)
                        .Take(limit)
                        .Select(ub => new RecentFavoriteItemDTO
                        {
                            Id     = ub.BookId,
                            Type   = ub.Book.Type.ToLower(),
                            Title  = ub.Book.Title,
                            Img    = ub.Book.CoverApiName,
                            Points = ub.Book.RewardPoints,
                            Status = ub.Status
                        }).ToListAsync();
                    items.AddRange(books);
                }

                if (normalizedType is "all" or "media")
                {
                    var movies = await _context.UserMovies
                        .Where(um => um.UserId == userId)
                        .OrderByDescending(um => um.LastSeen)
                        .Take(limit)
                        .Select(um => new RecentFavoriteItemDTO
                        {
                            Id     = um.MovieId,
                            Type   = "movie",
                            Title  = um.Movie.Title,
                            Img    = um.Movie.PosterApiName,
                            Points = um.Movie.RewardPoints,
                            Status = um.Status
                        }).ToListAsync();
                    items.AddRange(movies);

                    var series = await _context.UserSeries
                        .Where(us => us.UserId == userId)
                        .OrderByDescending(us => us.LastSeen)
                        .Take(limit)
                        .Select(us => new RecentFavoriteItemDTO
                        {
                            Id     = us.SeriesId,
                            Type   = "series",
                            Title  = us.Series.Title,
                            Img    = us.Series.PosterApiName,
                            Points = us.Series.RewardPoints,
                            Status = us.Status
                        }).ToListAsync();
                    items.AddRange(series);
                }

                if (normalizedType == "all")
                {
                    var allWithDates = new List<(RecentFavoriteItemDTO Item, DateTime? LastSeen)>();

                    foreach (var item in items)
                    {
                        DateTime? lastSeen = item.Type switch
                        {
                            "movie" => await _context.UserMovies
                                .Where(um => um.UserId == userId && um.MovieId == item.Id)
                                .Select(um => um.LastSeen).FirstOrDefaultAsync(),
                            "series" => await _context.UserSeries
                                .Where(us => us.UserId == userId && us.SeriesId == item.Id)
                                .Select(us => us.LastSeen).FirstOrDefaultAsync(),
                            _ => await _context.UserBooks
                                .Where(ub => ub.UserId == userId && ub.BookId == item.Id)
                                .Select(ub => ub.LastSeen).FirstOrDefaultAsync()
                        };
                        allWithDates.Add((item, lastSeen));
                    }

                    return Ok(allWithDates.OrderByDescending(x => x.LastSeen).Take(limit).Select(x => x.Item));
                }

                return Ok(items.Take(limit));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/{userId}/favorites/{type}
        // Kedvenc 3 tartalom
        // type: "all" | "media" | "books"
        // ================================================================
        [HttpGet("{userId}/favorites/{type}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFavorites(int userId, string type)
        {
            try
            {
                var normalizedType = type.ToLower();
                if (normalizedType is not ("all" or "media" or "books"))
                    return BadRequest(new ErrorResponseDTO { Error = "InvalidType", Message = "type: all | media | books" });

                var limit = 3;
                var items = new List<RecentFavoriteItemDTO>();

                if (normalizedType is "all" or "books")
                {
                    var books = await _context.UserBooks
                        .Where(ub => ub.UserId == userId && ub.Favorite)
                        .OrderByDescending(ub => ub.AddedAt)
                        .Take(limit)
                        .Select(ub => new RecentFavoriteItemDTO
                        {
                            Id     = ub.BookId,
                            Type   = ub.Book.Type.ToLower(),
                            Title  = ub.Book.Title,
                            Img    = ub.Book.CoverApiName,
                            Points = ub.Book.RewardPoints,
                            Status = ub.Status
                        }).ToListAsync();
                    items.AddRange(books);
                }

                if (normalizedType is "all" or "media")
                {
                    var movies = await _context.UserMovies
                        .Where(um => um.UserId == userId && um.Favorite)
                        .OrderByDescending(um => um.AddedAt)
                        .Take(limit)
                        .Select(um => new RecentFavoriteItemDTO
                        {
                            Id     = um.MovieId,
                            Type   = "movie",
                            Title  = um.Movie.Title,
                            Img    = um.Movie.PosterApiName,
                            Points = um.Movie.RewardPoints,
                            Status = um.Status
                        }).ToListAsync();
                    items.AddRange(movies);

                    var series = await _context.UserSeries
                        .Where(us => us.UserId == userId && us.Favorite)
                        .OrderByDescending(us => us.AddedAt)
                        .Take(limit)
                        .Select(us => new RecentFavoriteItemDTO
                        {
                            Id     = us.SeriesId,
                            Type   = "series",
                            Title  = us.Series.Title,
                            Img    = us.Series.PosterApiName,
                            Points = us.Series.RewardPoints,
                            Status = us.Status
                        }).ToListAsync();
                    items.AddRange(series);
                }

                if (normalizedType == "all")
                {
                    var allWithDates = new List<(RecentFavoriteItemDTO Item, DateTime? AddedAt)>();

                    foreach (var item in items)
                    {
                        DateTime? addedAt = item.Type switch
                        {
                            "movie" => await _context.UserMovies
                                .Where(um => um.UserId == userId && um.MovieId == item.Id)
                                .Select(um => um.AddedAt).FirstOrDefaultAsync(),
                            "series" => await _context.UserSeries
                                .Where(us => us.UserId == userId && us.SeriesId == item.Id)
                                .Select(us => us.AddedAt).FirstOrDefaultAsync(),
                            _ => await _context.UserBooks
                                .Where(ub => ub.UserId == userId && ub.BookId == item.Id)
                                .Select(ub => ub.AddedAt).FirstOrDefaultAsync()
                        };
                        allWithDates.Add((item, addedAt));
                    }

                    return Ok(allWithDates.OrderByDescending(x => x.AddedAt).Take(limit).Select(x => x.Item));
                }

                return Ok(items.Take(limit));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/{userId}/badges
        // Összes megszerzett kitűző, kategóriánként csoportosítva
        // ================================================================
        [HttpGet("{userId}/badges")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBadges(int userId)
        {
            try
            {
                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var earnedBadges = await _context.UserBadges
                    .Where(ub => ub.UserId == userId)
                    .Include(ub => ub.Badge)
                    .OrderByDescending(ub => ub.EarnedAt)
                    .Select(ub => new
                    {
                        ub.Badge.Category,
                        Badge = new BadgeCardDTO
                        {
                            Id       = ub.Badge.Id,
                            Name     = ub.Badge.Name,
                            IconUrl  = ub.Badge.IconUrl,
                            EarnedAt = ub.EarnedAt
                        }
                    })
                    .ToListAsync();

                var grouped = earnedBadges
                    .GroupBy(x => x.Category)
                    .Select(g => new BadgeCategoryGroupDTO
                    {
                        Category = g.Key,
                        Badges   = g.Select(x => x.Badge).ToList()
                    })
                    .ToList();

                return Ok(grouped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/{userId}/badges/{badgeId}
        // Egy kitűző részletei – modal nézet
        // ================================================================
        [HttpGet("{userId}/badges/{badgeId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBadgeDetail(int userId, int badgeId)
        {
            try
            {
                var badge = await _context.Badges.FindAsync(badgeId);
                if (badge == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Kitűző nem található" });

                var userBadge = await _context.UserBadges
                    .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);

                return Ok(new BadgeDetailDTO
                {
                    Id          = badge.Id,
                    Name        = badge.Name,
                    IconUrl     = badge.IconUrl,
                    Category    = badge.Category,
                    Description = badge.Description,
                    Rarity      = badge.Rarity,
                    IsEarned    = userBadge != null,
                    EarnedAt    = userBadge?.EarnedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/settings/titles
        // Saját megszerzett title-k listája – dropdown feltöltéséhez
        // ================================================================
        [HttpGet("settings/titles")]
        public async Task<IActionResult> GetOwnedTitles()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                var titles = await _context.UserTitles
                    .Where(ut => ut.UserId == userId)
                    .Include(ut => ut.Title)
                    .OrderBy(ut => ut.Title.Name)
                    .Select(ut => new
                    {
                        id       = ut.TitleId,
                        name     = ut.Title.Name,
                        rarity   = ut.Title.Rarity,
                        isActive = ut.IsActive,
                        earnedAt = ut.EarnedAt
                    })
                    .ToListAsync();

                return Ok(titles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PATCH /api/user/settings
        // Saját profil beállítások: pfp, országkód, jelszó, aktív title-k
        // ================================================================
        [HttpPatch("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateProfileSettingsDTO dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
                    return Unauthorized(new ErrorResponseDTO { Error = "Unauthorized", Message = "Érvénytelen vagy lejárt token" });

                dto.ActiveTitleIds ??= new List<int>();

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                // --- Profilkép ---
                if (dto.Avatar != null)
                {
                    var avatarInput = dto.Avatar.Trim();

                    if (avatarInput.Length == 0)
                    {
                        user.ProfilePic = null;
                    }
                    else
                    {
                        if (avatarInput.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                        {
                            var commaIndex = avatarInput.IndexOf(',');
                            if (commaIndex >= 0 && commaIndex < avatarInput.Length - 1)
                                avatarInput = avatarInput[(commaIndex + 1)..];
                        }

                        byte[] avatarBytes;
                        try
                        {
                            avatarBytes = Convert.FromBase64String(avatarInput);
                        }
                        catch
                        {
                            return BadRequest(new ErrorResponseDTO { Error = "InvalidAvatar", Message = "Érvénytelen base64 formátum." });
                        }

                        const int maxAvatarBytes = 512 * 1024;
                        if (avatarBytes.Length > maxAvatarBytes)
                            return BadRequest(new ErrorResponseDTO
                            {
                                Error = "AvatarTooLarge",
                                Message = "A profilkép túl nagy. Maximum 512KB méretű képet tölthetsz fel."
                            });

                        user.ProfilePic = avatarBytes;
                    }
                }

                // --- Országkód ---
                if (dto.CountryCode != null)
                    user.CountryCode = dto.CountryCode;

                // --- Jelszó ---
                if (!string.IsNullOrWhiteSpace(dto.NewPasswordHash))
                {
                    if (string.IsNullOrWhiteSpace(dto.NewPasswordSalt))
                        return BadRequest(new ErrorResponseDTO { Error = "MissingSalt", Message = "NewPasswordSalt kötelező ha jelszót változtatsz." });

                    user.PasswordHash = CreateSHA256(dto.NewPasswordHash + dto.NewPasswordSalt);
                    user.PasswordSalt = dto.NewPasswordSalt;
                }

                // --- Aktív title-k (max 3, csak saját megszerzett) ---
                if (dto.ActiveTitleIds.Count > 3)
                    return BadRequest(new ErrorResponseDTO { Error = "TooManyTitles", Message = "Maximum 3 aktív rangcím állítható be." });

                // Ellenőrzés: csak a saját megszerzett title-k közül lehet választani
                var ownedTitleIds = await _context.UserTitles
                    .Where(ut => ut.UserId == userId)
                    .Select(ut => ut.TitleId)
                    .ToListAsync();

                var invalid = dto.ActiveTitleIds.Except(ownedTitleIds).ToList();
                if (invalid.Count > 0)
                    return BadRequest(new ErrorResponseDTO { Error = "TitleNotOwned", Message = "Egy vagy több rangcím nem szerepel a gyűjteményedben." });

                // Összes aktív title kikapcsolása, majd a küldöttek bekapcsolása.
                // Ha a lista üres, akkor minden title inaktív lesz.
                var allUserTitles = await _context.UserTitles
                    .Where(ut => ut.UserId == userId)
                    .ToListAsync();

                foreach (var t in allUserTitles)
                    t.IsActive = dto.ActiveTitleIds.Contains(t.TitleId);

                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO { Message = "Beállítások sikeresen mentve." });
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
        private static string CreateSHA256(string input)
        {
            using SHA256 sha256 = SHA256.Create();
            byte[] data = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            var sb = new StringBuilder();
            foreach (byte b in data) sb.Append(b.ToString("x2"));
            return sb.ToString();
        }
    }
}
