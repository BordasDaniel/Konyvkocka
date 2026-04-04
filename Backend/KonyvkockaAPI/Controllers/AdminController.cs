using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public AdminController(KonyvkockaContext context)
        {
            _context = context;
        }

        // ================================================================
        // GET /api/admin/overview
        // Admin dashboard áttekintő statisztikák + legutóbbi aktivitások
        // ================================================================
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                var now = DateTime.UtcNow;
                var todayStart = now.Date;
                var yesterdayStart = todayStart.AddDays(-1);
                var monthStart = new DateTime(now.Year, now.Month, 1);
                var nextMonthStart = monthStart.AddMonths(1);
                var previousMonthStart = monthStart.AddMonths(-1);

                var totalUsers = await _context.Users.CountAsync();
                var newUsersToday = await _context.Users.CountAsync(u => u.CreationDate >= todayStart);

                var activeSubscribers = await _context.Users.CountAsync(u => u.Premium && (!u.PremiumExpiresAt.HasValue || u.PremiumExpiresAt.Value >= now));
                var newSubscribersToday = await _context.Purchases
                    .Where(p => p.PurchaseStatus == "SUCCESS" && p.PurchaseDate.HasValue && p.PurchaseDate.Value >= todayStart)
                    .Select(p => p.UserId)
                    .Distinct()
                    .CountAsync();

                var monthlyRevenue = await _context.Purchases
                    .Where(p => p.PurchaseStatus == "SUCCESS" && p.PurchaseDate.HasValue && p.PurchaseDate.Value >= monthStart && p.PurchaseDate.Value < nextMonthStart)
                    .SumAsync(p => p.Price ?? 0);

                var previousMonthlyRevenue = await _context.Purchases
                    .Where(p => p.PurchaseStatus == "SUCCESS" && p.PurchaseDate.HasValue && p.PurchaseDate.Value >= previousMonthStart && p.PurchaseDate.Value < monthStart)
                    .SumAsync(p => p.Price ?? 0);

                var totalBooks = await _context.Books.CountAsync();
                var totalMovies = await _context.Movies.CountAsync();
                var totalSeries = await _context.Series.CountAsync();
                var totalContent = totalBooks + totalMovies + totalSeries;

                var activeUsersToday = await _context.Users.CountAsync(u => u.LastLoginDate >= todayStart);
                var activeUsersYesterday = await _context.Users.CountAsync(u => u.LastLoginDate >= yesterdayStart && u.LastLoginDate < todayStart);

                var activeChallenges = await _context.Challenges.CountAsync(c => c.IsActive == true);
                var newChallengesThisMonth = await _context.Challenges.CountAsync(c => c.CreatedAt.HasValue && c.CreatedAt.Value >= monthStart);

                var revenueDelta = monthlyRevenue - previousMonthlyRevenue;
                var revenueDeltaPct = previousMonthlyRevenue == 0
                    ? (monthlyRevenue > 0 ? 100.0 : 0.0)
                    : (revenueDelta / (double)previousMonthlyRevenue) * 100.0;

                var dailyVisitorsDelta = activeUsersToday - activeUsersYesterday;
                var dailyVisitorsDeltaPct = activeUsersYesterday == 0
                    ? (activeUsersToday > 0 ? 100.0 : 0.0)
                    : (dailyVisitorsDelta / (double)activeUsersYesterday) * 100.0;

                var activities = new List<AdminOverviewActivityDTO>();

                var recentUsers = await _context.Users
                    .OrderByDescending(u => u.CreationDate)
                    .Take(3)
                    .Select(u => new { u.Username, u.CreationDate })
                    .ToListAsync();

                activities.AddRange(recentUsers.Select(u => new AdminOverviewActivityDTO
                {
                    Icon = "bi-person-plus-fill",
                    Color = "#4a9eff",
                    Text = $"Új felhasználó regisztrált: {u.Username}",
                    Timestamp = u.CreationDate
                }));

                var recentPurchases = await _context.Purchases
                    .Include(p => p.User)
                    .Where(p => p.PurchaseStatus == "SUCCESS")
                    .OrderByDescending(p => p.PurchaseDate)
                    .Take(3)
                    .Select(p => new
                    {
                        Username = p.User.Username,
                        p.Price,
                        Time = p.PurchaseDate
                    })
                    .ToListAsync();

                activities.AddRange(recentPurchases
                    .Where(p => p.Time.HasValue)
                    .Select(p => new AdminOverviewActivityDTO
                    {
                        Icon = "bi-star-fill",
                        Color = "var(--secondary)",
                        Text = $"Új Premium előfizető: {p.Username} ({(p.Price ?? 0).ToString("N0", new CultureInfo("hu-HU"))} Ft)",
                        Timestamp = p.Time!.Value
                    }));

                var recentArticles = await _context.Articles
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(2)
                    .Select(a => new { a.Title, a.CreatedAt })
                    .ToListAsync();

                activities.AddRange(recentArticles.Select(a => new AdminOverviewActivityDTO
                {
                    Icon = "bi-newspaper",
                    Color = "#4ade80",
                    Text = $"Új hír közzétéve: {a.Title}",
                    Timestamp = a.CreatedAt
                }));

                var recentChallenges = await _context.Challenges
                    .Where(c => c.CreatedAt.HasValue)
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(2)
                    .Select(c => new { c.Title, c.CreatedAt })
                    .ToListAsync();

                activities.AddRange(recentChallenges.Select(c => new AdminOverviewActivityDTO
                {
                    Icon = "bi-trophy-fill",
                    Color = "#a78bfa",
                    Text = $"Új kihívás létrehozva: {c.Title}",
                    Timestamp = c.CreatedAt ?? now
                }));

                var response = new AdminOverviewDTO
                {
                    Stats = new List<AdminOverviewStatDTO>
                    {
                        new()
                        {
                            Label = "Felhasználók",
                            Value = totalUsers.ToString("N0", new CultureInfo("hu-HU")),
                            Change = newUsersToday > 0 ? $"+{newUsersToday}" : "0",
                            ChangeType = newUsersToday > 0 ? "up" : "neutral",
                            Icon = "bi-people-fill",
                            Color = "#4a9eff"
                        },
                        new()
                        {
                            Label = "Aktív előfizetők",
                            Value = activeSubscribers.ToString("N0", new CultureInfo("hu-HU")),
                            Change = newSubscribersToday > 0 ? $"+{newSubscribersToday}" : "0",
                            ChangeType = newSubscribersToday > 0 ? "up" : "neutral",
                            Icon = "bi-star-fill",
                            Color = "var(--secondary)"
                        },
                        new()
                        {
                            Label = "Havi bevétel",
                            Value = $"{monthlyRevenue.ToString("N0", new CultureInfo("hu-HU"))} Ft",
                            Change = $"{(revenueDeltaPct >= 0 ? "+" : string.Empty)}{revenueDeltaPct:0.0}%",
                            ChangeType = revenueDeltaPct > 0 ? "up" : revenueDeltaPct < 0 ? "down" : "neutral",
                            Icon = "bi-cash-stack",
                            Color = "#4ade80"
                        },
                        new()
                        {
                            Label = "Tartalmak",
                            Value = totalContent.ToString("N0", new CultureInfo("hu-HU")),
                            Change = "0",
                            ChangeType = "neutral",
                            Icon = "bi-collection-fill",
                            Color = "#f472b6"
                        },
                        new()
                        {
                            Label = "Mai látogatók",
                            Value = activeUsersToday.ToString("N0", new CultureInfo("hu-HU")),
                            Change = $"{(dailyVisitorsDeltaPct >= 0 ? "+" : string.Empty)}{dailyVisitorsDeltaPct:0.0}%",
                            ChangeType = dailyVisitorsDeltaPct > 0 ? "up" : dailyVisitorsDeltaPct < 0 ? "down" : "neutral",
                            Icon = "bi-eye-fill",
                            Color = "#fb923c"
                        },
                        new()
                        {
                            Label = "Aktív kihívások",
                            Value = activeChallenges.ToString("N0", new CultureInfo("hu-HU")),
                            Change = newChallengesThisMonth > 0 ? $"+{newChallengesThisMonth}" : "0",
                            ChangeType = newChallengesThisMonth > 0 ? "up" : "neutral",
                            Icon = "bi-trophy-fill",
                            Color = "#a78bfa"
                        }
                    },
                    Activities = activities
                        .OrderByDescending(a => a.Timestamp)
                        .Take(8)
                        .ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/admin/content/{type}/{id}
        // Részletes tartalom lekérés – admin/moderátor számára
        //
        // type: "book" | "movie" | "series"
        // Tartalmazza a UserLibrary snapshot-ot is, ha a user-nek van bejegyzése
        // ================================================================
        [HttpGet("content/{type}/{id}")]
        public async Task<IActionResult> GetContentDetails(string type, int id)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

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

                    var readUrl = book.Type switch
                    {
                        "AUDIOBOOK" => book.AudioUrl,
                        "EBOOK"     => book.PdfUrl,
                        _           => book.PdfUrl
                    };

                    return Ok(new BookDetailDTO
                    {
                        Id                 = book.Id,
                        Type               = book.Type.ToLower(),
                        Title              = book.Title,
                        Year               = book.Released,
                        Rating             = book.Rating,
                        Description        = book.Description,
                        Img                = book.CoverApiName,
                        PageNum            = book.PageNum,
                        AudioLength        = book.AudioLength,
                        NarratorName       = book.NarratorName,
                        OriginalLanguage   = book.OriginalLanguage,
                        IsOfflineAvailable = book.IsOfflineAvailable,
                        ReadUrl            = readUrl,
                        AgeRating          = book.AgeRating != null ? new AgeRatingDTO { Id = book.AgeRating.Id, Name = book.AgeRating.Name, MinAge = book.AgeRating.MinAge } : null,
                        Tags               = book.Tags.Select(t => t.Name).ToList(),
                        UserLibrary        = librarySnapshot
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
        // GET /api/admin/users
        // Összes felhasználó listázása – admin/moderátor jogosultság szükséges
        //
        // Query paraméterek:
        //   page     – oldalszám (alapértelmezett: 1)
        //   pageSize – oldal mérete (alapértelmezett: 20, max: 100)
        //   q        – keresés felhasználónév vagy e-mail alapján
        // ================================================================
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int page     = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? q    = null)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                IQueryable<User> query = _context.Users;

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var search = q.Trim().ToLower();
                    query = query.Where(u =>
                        u.Username.ToLower().Contains(search) ||
                        u.Email.ToLower().Contains(search));
                }

                var total = await query.CountAsync();

                var users = await query
                    .OrderByDescending(u => u.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new AdminUserItemDTO
                    {
                        Id              = u.Id,
                        Username        = u.Username,
                        Email           = u.Email,
                        Avatar          = u.ProfilePic != null ? Convert.ToBase64String(u.ProfilePic) : null,
                        PermissionLevel = u.PermissionLevel,
                        Premium         = u.Premium,
                        PremiumExpiresAt = u.PremiumExpiresAt,
                        Level           = u.Level,
                        Xp              = u.Xp,
                        CountryCode     = u.CountryCode,
                        CreationDate    = u.CreationDate,
                        LastLoginDate   = u.LastLoginDate,
                        DayStreak       = u.DayStreak,
                        ReadTimeMin     = u.ReadTimeMin,
                        WatchTimeMin    = u.WatchTimeMin,
                        BookPoints      = u.BookPoints,
                        SeriesPoints    = u.SeriesPoints,
                        MoviePoints     = u.MoviePoints
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/admin/purchases
        // Összes vásárlás listázása – admin/moderátor jogosultság szükséges
        //
        // Query paraméterek:
        //   page     – oldalszám (alapértelmezett: 1)
        //   pageSize – oldal mérete (alapértelmezett: 20, max: 100)
        //   status   – szűrés státusz alapján (opcionális)
        //   q        – keresés vásárlás azonosítóra, felhasználónévre vagy e-mailre (opcionális)
        // ================================================================
        [HttpGet("purchases")]
        public async Task<IActionResult> GetPurchases(
            [FromQuery] int page     = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? status = null,
            [FromQuery] string? q = null)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                IQueryable<Purchase> query = _context.Purchases.Include(p => p.User);

                if (!string.IsNullOrWhiteSpace(status))
                {
                    var normalizedStatus = status.Trim().ToUpperInvariant();
                    var allowedStatuses = new[] { "SUCCESS", "PENDING", "FAILED", "REFUNDED" };

                    if (!allowedStatuses.Contains(normalizedStatus))
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidStatus",
                            Message = "Érvénytelen status. Lehetséges: SUCCESS, PENDING, FAILED, REFUNDED"
                        });
                    }

                    query = query.Where(p => p.PurchaseStatus == normalizedStatus);
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var search = q.Trim().ToLower();
                    if (int.TryParse(search, out var purchaseId))
                    {
                        query = query.Where(p =>
                            p.Id == purchaseId ||
                            p.User.Username.ToLower().Contains(search) ||
                            p.User.Email.ToLower().Contains(search));
                    }
                    else
                    {
                        query = query.Where(p =>
                            p.User.Username.ToLower().Contains(search) ||
                            p.User.Email.ToLower().Contains(search));
                    }
                }

                var total = await query.CountAsync();

                var purchases = await query
                    .OrderByDescending(p => p.PurchaseDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new AdminPurchaseItemDTO
                    {
                        Id             = p.Id,
                        UserId         = p.UserId,
                        Username       = p.User.Username,
                        Email          = p.User.Email,
                        PurchaseDate   = p.PurchaseDate,
                        Price          = p.Price,
                        Tier           = p.Tier,
                        PurchaseStatus = p.PurchaseStatus,
                        UpdatedAt      = p.PurchaseDate
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, purchases });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}
