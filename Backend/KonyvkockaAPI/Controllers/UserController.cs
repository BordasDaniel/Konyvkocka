using System.Security.Cryptography;
using System.Text;
using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using KonyvkockaAPI.Services;
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
        private readonly IEmailService _emailService;
        private readonly AppUrlSettings _appUrlSettings;
        private readonly ILogger<UserController> _logger;

        public UserController(
            KonyvkockaContext context,
            IEmailService emailService,
            AppUrlSettings appUrlSettings,
            ILogger<UserController> logger)
        {
            _context = context;
            _emailService = emailService;
            _appUrlSettings = appUrlSettings;
            _logger = logger;
        }

        private static string? NormalizeCountryCode(string? countryCode)
        {
            var normalized = countryCode?.Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalized) || normalized == "ZZ")
                return null;

            return normalized.Length == 2 ? normalized : null;
        }

        private static bool IsPremiumActive(User user, DateTime utcNow)
        {
            if (!user.Premium)
                return false;

            if (!user.PremiumExpiresAt.HasValue)
                return true;

            return user.PremiumExpiresAt.Value > utcNow;
        }

        private static bool NormalizeExpiredPremium(User user, DateTime utcNow)
        {
            if (user.Premium && user.PremiumExpiresAt.HasValue && user.PremiumExpiresAt.Value <= utcNow)
            {
                user.Premium = false;
                user.PremiumExpiresAt = null;
                return true;
            }

            return false;
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

                var utcNow = DateTime.UtcNow;
                if (NormalizeExpiredPremium(user, utcNow))
                {
                    await _context.SaveChangesAsync();
                }

                var isSubscriber = IsPremiumActive(user, utcNow);

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

                var normalizedCountryCode = NormalizeCountryCode(user.CountryCode);
                var hasCountryConfigured = !string.IsNullOrWhiteSpace(normalizedCountryCode);

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
                    CountryCode  = normalizedCountryCode,
                    Email        = email,
                    IsSubscriber = isSubscriber,
                    PremiumExpiresAt = isSubscriber ? user.PremiumExpiresAt : null,
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
                        CountryRank    = hasCountryConfigured ? rankCache?.CountryRankTotal : null,
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
                        CountryRank    = hasCountryConfigured ? rankCache?.CountryRankMedia : null,
                        Points         = user.SeriesPoints + user.MoviePoints,
                        WatchTimeMin   = user.WatchTimeMin,
                        CompletionRate = mediaTotal > 0 ? Math.Round((double)mediaCompleted / mediaTotal, 2) : 0,
                        Completed      = mediaCompleted,
                        Total          = mediaTotal
                    },

                    Books = new ProfileTabBooksDTO
                    {
                        GlobalRank     = rankCache?.GlobalRankBook,
                        CountryRank    = hasCountryConfigured ? rankCache?.CountryRankBook : null,
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
        // POST /api/user/{targetUserId}/report
        // Felhasználó jelentése - moderátor/admin címzetteknek továbbítva
        // ================================================================
        [HttpPost("{targetUserId}/report")]
        public async Task<IActionResult> ReportUser(int targetUserId, [FromBody] ReportUserDTO dto)
        {
            try
            {
                var reporterIdClaim = User.FindFirst("userId")?.Value;
                if (!int.TryParse(reporterIdClaim, out var reporterId) || reporterId <= 0)
                    return Unauthorized(new ErrorResponseDTO { Error = "Unauthorized", Message = "Érvénytelen vagy lejárt token" });

                if (targetUserId <= 0)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidUser",
                        Message = "Érvénytelen felhasználó azonosító"
                    });
                }

                if (reporterId == targetUserId)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "SelfReportNotAllowed",
                        Message = "Saját profil nem jelenthető"
                    });
                }

                if (dto == null)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidPayload",
                        Message = "A kérés törzse kötelező"
                    });
                }

                var reason = dto.Reason?.Trim().ToUpperInvariant() ?? string.Empty;
                var reasonLabels = new Dictionary<string, string>
                {
                    ["SPAM"] = "Spam / hirdetés",
                    ["HARASSMENT"] = "Zaklatás",
                    ["FRAUD"] = "Csalás",
                    ["IMPERSONATION"] = "Más személynek adja ki magát",
                    ["HATE_SPEECH"] = "Gyűlöletkeltő beszéd",
                    ["THREAT_VIOLENCE"] = "Fenyegetés vagy erőszak",
                    ["INAPPROPRIATE_CONTENT"] = "Nem megfelelő tartalom",
                    ["FAKE_PROFILE"] = "Hamis profil",
                    ["OTHER"] = "Egyéb"
                };

                if (!reasonLabels.TryGetValue(reason, out var reasonLabel))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidReason",
                        Message = "Érvénytelen jelentési ok"
                    });
                }

                var details = dto.Details?.Trim() ?? string.Empty;
                if (details.Length < 10)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidDetails",
                        Message = "A részletes indoklás legalább 10 karakter legyen"
                    });
                }

                if (details.Length > 2000)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "DetailsTooLong",
                        Message = "A részletes indoklás maximum 2000 karakter lehet"
                    });
                }

                var users = await _context.Users
                    .Where(u => u.Id == targetUserId || u.Id == reporterId)
                    .Select(u => new { u.Id, u.Username })
                    .ToListAsync();

                var targetUser = users.FirstOrDefault(u => u.Id == targetUserId);
                if (targetUser == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = "A jelentett felhasználó nem található"
                    });
                }

                var reporterUser = users.FirstOrDefault(u => u.Id == reporterId);
                if (reporterUser == null)
                    return Unauthorized(new ErrorResponseDTO { Error = "Unauthorized", Message = "A bejelentkező felhasználó nem található" });

                var receiverIds = await _context.Users
                    .Where(u => (u.PermissionLevel == "ADMIN" || u.PermissionLevel == "MODERATOR") && u.Id != reporterId)
                    .Select(u => u.Id)
                    .ToListAsync();

                if (receiverIds.Count == 0)
                {
                    return StatusCode(500, new ErrorResponseDTO
                    {
                        Error = "NoModeratorsAvailable",
                        Message = "Jelenleg nincs elérhető moderátor vagy admin a jelentés fogadásához"
                    });
                }

                var now = DateTime.UtcNow;
                var subject = $"Felhasználói jelentés • {reasonLabel}";
                var message =
                    $"Jelentett felhasználó: {targetUser.Username} (ID: {targetUser.Id})\n" +
                    $"Bejelentő: {reporterUser.Username} (ID: {reporterUser.Id})\n" +
                    $"Ok: {reasonLabel}\n" +
                    "\n" +
                    "Részletes indoklás:\n" +
                    details;

                var mails = receiverIds.Select(receiverId => new Mail
                {
                    ReceiverId = receiverId,
                    SenderId = reporterId,
                    Type = "SYSTEM",
                    Subject = subject,
                    Message = message,
                    IsRead = false,
                    CreatedAt = now
                }).ToList();

                await _context.Mails.AddRangeAsync(mails);
                await _context.SaveChangesAsync();

                return Ok(new MessageResponseDTO
                {
                    Message = "Köszönjük! A jelentést továbbítottuk a moderátoroknak."
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
                {
                    var trimmedCountryCode = dto.CountryCode.Trim();
                    if (trimmedCountryCode.Length > 0 && trimmedCountryCode.Length != 2)
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidCountryCode",
                            Message = "Az országkód pontosan 2 karakter lehet, vagy üresen hagyva törölhető."
                        });

                    user.CountryCode = NormalizeCountryCode(trimmedCountryCode);
                }

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
        // POST /api/user/settings/delete-request
        // Fiók törlésének indítása: jelszóellenőrzés + megerősítő email küldése
        // ================================================================
        [HttpPost("settings/delete-request")]
        public async Task<IActionResult> RequestAccountDeletion([FromBody] RequestAccountDeletionDTO dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
                    return Unauthorized(new ErrorResponseDTO { Error = "Unauthorized", Message = "Érvénytelen vagy lejárt token" });

                if (string.IsNullOrWhiteSpace(dto?.PasswordHash))
                    return BadRequest(new ErrorResponseDTO { Error = "MissingPassword", Message = "A jelszó megadása kötelező." });

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new ErrorResponseDTO { Error = "NotFound", Message = "Felhasználó nem található" });

                var calculatedDoubleHash = CreateSHA256(dto.PasswordHash + user.PasswordSalt);
                if (!string.Equals(user.PasswordHash, calculatedDoubleHash, StringComparison.Ordinal))
                {
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "InvalidCredentials",
                        Message = "Hibás jelszó"
                    });
                }

                var deletionToken = GenerateDeletionToken();
                user.EmailVerificationTokenHash = CreateSHA256(deletionToken);
                user.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);

                await _context.SaveChangesAsync();

                var deletionLink = BuildAccountDeletionLink(user.Id, deletionToken);
                var emailSent = await _emailService.SendEmailAsync(
                    user.Email,
                    "Fiók törlésének megerősítése - Konyvkocka",
                    BuildDeletionConfirmationBody(user.Username, deletionLink));

                if (!emailSent)
                {
                    user.EmailVerificationTokenHash = null;
                    user.EmailVerificationTokenExpiresAt = null;
                    await _context.SaveChangesAsync();

                    return StatusCode(500, new ErrorResponseDTO
                    {
                        Error = "EmailSendFailed",
                        Message = "A megerősítő email küldése sikertelen volt. Kérlek próbáld újra később."
                    });
                }

                return Ok(new MessageResponseDTO
                {
                    Message = "Küldtünk egy megerősítő emailt. A benne lévő linkre kattintva törölheted a fiókodat."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Account deletion request failed");
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/user/settings/delete-confirm?userId=123&token=...
        // Fiók törlésének megerősítése email linkből
        // ================================================================
        [HttpGet("settings/delete-confirm")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmAccountDeletion([FromQuery] int userId, [FromQuery] string token)
        {
            try
            {
                if (userId <= 0 || string.IsNullOrWhiteSpace(token))
                    return BuildDeletionHtmlResponse(false, "Érvénytelen törlési link.", 400);

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return BuildDeletionHtmlResponse(false, "A felhasználó már nem található vagy már törlésre került.", 404);

                if (string.IsNullOrWhiteSpace(user.EmailVerificationTokenHash) ||
                    !user.EmailVerificationTokenExpiresAt.HasValue)
                {
                    return BuildDeletionHtmlResponse(false, "A törlési link már nem érvényes.", 400);
                }

                if (user.EmailVerificationTokenExpiresAt.Value < DateTime.UtcNow)
                    return BuildDeletionHtmlResponse(false, "A törlési link lejárt. Kérj új megerősítő emailt a beállításokban.", 400);

                var incomingHash = CreateSHA256(token);
                if (!string.Equals(user.EmailVerificationTokenHash, incomingHash, StringComparison.Ordinal))
                    return BuildDeletionHtmlResponse(false, "A törlési link hibás vagy már nem érvényes.", 400);

                // A deleting_user trigger a deleted_user táblába ír, ahol CountryCode nem lehet NULL,
                // és PermissionLevel nem tartalmazza a BANNED értéket.
                var normalizedForDeletionTrigger = false;
                if (string.IsNullOrWhiteSpace(user.CountryCode))
                {
                    user.CountryCode = "ZZ";
                    normalizedForDeletionTrigger = true;
                }

                if (string.Equals(user.PermissionLevel, "BANNED", StringComparison.OrdinalIgnoreCase))
                {
                    user.PermissionLevel = "USER";
                    normalizedForDeletionTrigger = true;
                }

                if (normalizedForDeletionTrigger)
                    await _context.SaveChangesAsync();

                // A mail_sender_fk nem kaszkádol, ezért törlés előtt kezelni kell a küldött üzenetek feladóját.
                var hasSentMails = await _context.Mails.AnyAsync(m => m.SenderId == user.Id);
                if (hasSentMails)
                {
                    var canReassignToSystemSender = user.Id != 1 && await _context.Users.AnyAsync(u => u.Id == 1);

                    if (canReassignToSystemSender)
                    {
                        var sentMails = await _context.Mails
                            .Where(m => m.SenderId == user.Id)
                            .ToListAsync();

                        foreach (var mail in sentMails)
                            mail.SenderId = 1;
                    }
                    else
                    {
                        var sentMails = await _context.Mails
                            .Where(m => m.SenderId == user.Id)
                            .ToListAsync();

                        _context.Mails.RemoveRange(sentMails);
                    }
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return BuildDeletionHtmlResponse(true, "A fiókod sikeresen törlésre került.", 200);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Account deletion confirmation DB error for userId {UserId}. Inner: {InnerMessage}",
                    userId,
                    dbEx.InnerException?.Message);
                return BuildDeletionHtmlResponse(false, "A fiók törlése adatbázis hiba miatt sikertelen volt. Kérlek próbáld újra később.", 500);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Account deletion confirmation failed for userId {UserId}", userId);
                return BuildDeletionHtmlResponse(false, "Hiba történt a fiók törlése közben.", 500);
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

        private static string GenerateDeletionToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private string BuildAccountDeletionLink(int userId, string token)
        {
            var baseApiUrl = _appUrlSettings.ApiBaseUrl?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(baseApiUrl))
            {
                baseApiUrl = $"{Request.Scheme}://{Request.Host}";
            }

            return $"{baseApiUrl}/api/user/settings/delete-confirm?userId={userId}&token={Uri.EscapeDataString(token)}";
        }

        private static string BuildDeletionConfirmationBody(string username, string deletionLink)
        {
            var safeUsername = System.Net.WebUtility.HtmlEncode(username);
            var safeLink = System.Net.WebUtility.HtmlEncode(deletionLink);

            return $@"
                <!doctype html>
                <html lang='hu'>
                <head>
                    <meta charset='utf-8' />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                </head>
                <body style='margin:0; padding:24px 12px; background:#0b0f16; font-family:Segoe UI,Arial,sans-serif;'>
                    <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0'>
                        <tr>
                            <td align='center'>
                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width:620px; background:linear-gradient(180deg,#121823 0%,#0d1118 100%); border:1px solid #263247; border-radius:16px; overflow:hidden;'>
                                    <tr>
                                        <td style='padding:24px 24px 12px;'>
                                            <div style='display:inline-block; width:40px; height:40px; line-height:40px; text-align:center; border-radius:50%; background:#c29d59; color:#0f131a; font-weight:700;'>K</div>
                                            <h1 style='margin:16px 0 8px; color:#f2f3f7; font-size:28px; line-height:1.25;'>Szia {safeUsername}!</h1>
                                            <p style='margin:0 0 8px; color:#d6dae2; font-size:16px; line-height:1.6;'>
                                                Fióktörlési kérelmet indítottál a Konyvkocka fiókodhoz.
                                            </p>
                                            <p style='margin:0 0 20px; color:#f8b4b4; font-size:16px; line-height:1.6;'>
                                                Ez a művelet végleges és nem visszavonható.
                                            </p>
                                            <a href='{safeLink}' style='display:inline-block; padding:12px 20px; border-radius:10px; background:#ef4444; color:#ffffff; text-decoration:none; font-weight:700;'>
                                                Fiók végleges törlése
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding:16px 24px 24px;'>
                                            <div style='padding:12px; border:1px solid #2a3548; border-radius:10px; background:#0f141f;'>
                                                <p style='margin:0 0 8px; color:#9da8ba; font-size:13px;'>Ha a gomb nem működik, másold be ezt a linket:</p>
                                                <a href='{safeLink}' style='color:#7bc4ff; font-size:13px; word-break:break-all; text-decoration:none;'>{safeLink}</a>
                                            </div>
                                            <p style='margin:14px 0 0; color:#8390a5; font-size:12px;'>A link 30 percig érvényes.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>";
        }

        private IActionResult BuildDeletionHtmlResponse(bool success, string message, int statusCode)
        {
            var color = success ? "#c29d59" : "#f87171";
            var title = success ? "Fiók törölve" : "Fióktörlési hiba";
            var loginUrl = (_appUrlSettings.FrontendBaseUrl ?? string.Empty).TrimEnd('/') + "/#/belepes";

            var safeMessage = System.Net.WebUtility.HtmlEncode(message);
            var safeLoginUrl = System.Net.WebUtility.HtmlEncode(loginUrl);

            var html = $@"
                <!doctype html>
                <html lang='hu'>
                <head>
                    <meta charset='utf-8' />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                    <title>{title}</title>
                </head>
                <body style='margin:0; background:radial-gradient(circle at 15% 10%, #1e293b 0%, #0b0f16 55%, #06090f 100%); font-family:Segoe UI,Arial,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px;'>
                    <main style='max-width:620px; width:100%; background:linear-gradient(180deg,#121823 0%,#0d1118 100%); border:1px solid #253044; border-radius:18px; padding:28px; box-shadow:0 24px 60px rgba(0,0,0,.45);'>
                        <h1 style='margin:0 0 10px; color:{color};'>{title}</h1>
                        <p style='margin:0 0 22px; color:#d6dae2; line-height:1.65;'>{safeMessage}</p>
                        <a href='{safeLoginUrl}' style='display:inline-block; background:#c29d59; color:#0f131a; text-decoration:none; font-weight:700; border-radius:10px; padding:11px 16px;'>
                            Ugrás a bejelentkezéshez
                        </a>
                    </main>
                </body>
                </html>";

            Response.StatusCode = statusCode;
            return Content(html, "text/html", Encoding.UTF8);
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
