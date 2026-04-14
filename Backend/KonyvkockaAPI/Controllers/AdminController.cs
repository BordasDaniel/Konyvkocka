using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.DTO.Request;
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
        // GET /api/admin/content/options
        // Tartalom szerkesztéshez opciók (tagek)
        // ================================================================
        [HttpGet("content/options")]
        public async Task<IActionResult> GetContentOptions()
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                var tags = await _context.Tags
                    .OrderBy(t => t.Name)
                    .Select(t => new AdminContentTagOptionDTO
                    {
                        Id = t.Id,
                        Name = t.Name
                    })
                    .ToListAsync();

                var ageRatings = await _context.AgeRatings
                    .OrderBy(a => a.MinAge)
                    .ThenBy(a => a.Name)
                    .Select(a => new AdminAgeRatingOptionDTO
                    {
                        Id = a.Id,
                        Name = a.Name,
                        MinAge = a.MinAge
                    })
                    .ToListAsync();

                return Ok(new AdminContentOptionsDTO
                {
                    Tags = tags,
                    AgeRatings = ageRatings
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/admin/content
        // Tartalmak listázása – admin/moderátor jogosultság szükséges
        //
        // Query paraméterek:
        //   page     – oldalszám (alapértelmezett: 1)
        //   pageSize – oldal mérete (alapértelmezett: 20, max: 100)
        //   type     – all|BOOK|MOVIE|SERIES
        //   q        – keresés cím alapján
        // ================================================================
        [HttpGet("content")]
        public async Task<IActionResult> GetContent(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? type = null,
            [FromQuery] string? q = null)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var normalizedType = string.IsNullOrWhiteSpace(type) ? "ALL" : type.Trim().ToUpperInvariant();
                var allowedTypes = new[] { "ALL", "BOOK", "MOVIE", "SERIES" };
                if (!allowedTypes.Contains(normalizedType))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidType",
                        Message = "Érvénytelen type. Lehetséges: all, BOOK, MOVIE, SERIES"
                    });
                }

                var summary = new AdminContentSummaryDTO
                {
                    Books = await _context.Books.CountAsync(),
                    Movies = await _context.Movies.CountAsync(),
                    Series = await _context.Series.CountAsync()
                };
                summary.Total = summary.Books + summary.Movies + summary.Series;

                var contentItems = new List<AdminContentItemDTO>();

                if (normalizedType is "ALL" or "BOOK")
                {
                    var books = await _context.Books
                        .Include(b => b.Tags)
                        .Select(b => new AdminContentItemDTO
                        {
                            Id = b.Id,
                            ContentType = "BOOK",
                            Title = b.Title,
                            Released = b.Released,
                            Rating = b.Rating,
                            Description = b.Description,
                            AgeRatingId = b.AgeRatingId,
                            TrailerUrl = null,
                            RewardXP = b.RewardXp,
                            RewardPoints = b.RewardPoints,
                            HasSubtitles = false,
                            IsOriginalLanguage = !string.IsNullOrWhiteSpace(b.OriginalLanguage),
                            IsOfflineAvailable = b.IsOfflineAvailable,
                            UpdatedAt = b.UpdatedAt,
                            CoverOrPosterApiName = b.CoverApiName,
                            PageNum = b.PageNum,
                            BookType = b.Type,
                            PdfUrl = b.PdfUrl,
                            AudioUrl = b.AudioUrl,
                            EpubUrl = b.EpubUrl,
                            AudioLength = b.AudioLength,
                            NarratorName = b.NarratorName,
                            OriginalLanguage = b.OriginalLanguage,
                            StreamUrl = null,
                            Length = null,
                            TagIds = b.Tags.Select(t => t.Id).ToList()
                        })
                        .ToListAsync();

                    contentItems.AddRange(books);
                }

                if (normalizedType is "ALL" or "MOVIE")
                {
                    var movies = await _context.Movies
                        .Include(m => m.Tags)
                        .Select(m => new AdminContentItemDTO
                        {
                            Id = m.Id,
                            ContentType = "MOVIE",
                            Title = m.Title,
                            Released = m.Released,
                            Rating = m.Rating,
                            Description = m.Description,
                            AgeRatingId = m.AgeRatingId,
                            TrailerUrl = m.TrailerUrl,
                            RewardXP = m.RewardXp,
                            RewardPoints = m.RewardPoints,
                            HasSubtitles = m.HasSubtitles,
                            IsOriginalLanguage = m.IsOriginalLanguage,
                            IsOfflineAvailable = m.IsOfflineAvailable,
                            UpdatedAt = m.UpdatedAt,
                            CoverOrPosterApiName = m.PosterApiName,
                            PageNum = null,
                            BookType = null,
                            PdfUrl = null,
                            AudioUrl = null,
                            EpubUrl = null,
                            AudioLength = null,
                            NarratorName = null,
                            OriginalLanguage = null,
                            StreamUrl = m.StreamUrl,
                            Length = m.Length,
                            TagIds = m.Tags.Select(t => t.Id).ToList()
                        })
                        .ToListAsync();

                    contentItems.AddRange(movies);
                }

                if (normalizedType is "ALL" or "SERIES")
                {
                    var series = await _context.Series
                        .Include(s => s.Tags)
                        .Select(s => new AdminContentItemDTO
                        {
                            Id = s.Id,
                            ContentType = "SERIES",
                            Title = s.Title,
                            Released = s.Released,
                            Rating = s.Rating,
                            Description = s.Description,
                            AgeRatingId = s.AgeRatingId,
                            TrailerUrl = s.TrailerUrl,
                            RewardXP = s.RewardXp,
                            RewardPoints = s.RewardPoints,
                            HasSubtitles = s.HasSubtitles,
                            IsOriginalLanguage = s.IsOriginalLanguage,
                            IsOfflineAvailable = s.IsOfflineAvailable,
                            UpdatedAt = s.UpdatedAt,
                            CoverOrPosterApiName = s.PosterApiName,
                            PageNum = null,
                            BookType = null,
                            PdfUrl = null,
                            AudioUrl = null,
                            EpubUrl = null,
                            AudioLength = null,
                            NarratorName = null,
                            OriginalLanguage = null,
                            StreamUrl = null,
                            Length = null,
                            TagIds = s.Tags.Select(t => t.Id).ToList()
                        })
                        .ToListAsync();

                    contentItems.AddRange(series);
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var search = q.Trim().ToLowerInvariant();
                    contentItems = contentItems
                        .Where(c => c.Title.ToLowerInvariant().Contains(search))
                        .ToList();
                }

                contentItems = contentItems
                    .OrderByDescending(c => c.Id)
                    .ToList();

                var total = contentItems.Count;
                var pagedItems = contentItems
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return Ok(new { total, page, pageSize, content = pagedItems, summary });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PUT /api/admin/content/{type}/{id}
        // Tartalom frissítése – admin/moderátor jogosultság szükséges
        // ================================================================
        [HttpPut("content/{type}/{id}")]
        public async Task<IActionResult> UpdateContent(string type, int id, [FromBody] UpdateAdminContentDTO dto)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (dto == null)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidPayload",
                        Message = "A kérés törzse kötelező"
                    });
                }

                var normalizedType = type.Trim().ToLowerInvariant();
                if (normalizedType is not ("book" or "movie" or "series"))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidType",
                        Message = "Érvénytelen type. Lehetséges: book, movie, series"
                    });
                }

                var normalizedTitle = dto.Title?.Trim() ?? string.Empty;
                var normalizedDescription = dto.Description?.Trim() ?? string.Empty;
                var normalizedCover = dto.CoverOrPosterApiName?.Trim() ?? string.Empty;

                if (string.IsNullOrWhiteSpace(normalizedTitle) || normalizedTitle.Length > 128)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidTitle",
                        Message = "A cím kötelező, maximum 128 karakter hosszú lehet"
                    });
                }

                if (string.IsNullOrWhiteSpace(normalizedDescription))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidDescription",
                        Message = "A leírás kötelező"
                    });
                }

                if (string.IsNullOrWhiteSpace(normalizedCover))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidCover",
                        Message = "A borító/poster mező kötelező"
                    });
                }

                if (dto.Released < 1800 || dto.Released > 2099)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidReleased",
                        Message = "A kiadás éve 1800 és 2099 között lehet"
                    });
                }

                if (dto.Rating < 0 || dto.Rating > 10)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidRating",
                        Message = "Az értékelés 0 és 10 között lehet"
                    });
                }

                if (dto.RewardXP < 0 || dto.RewardPoints < 0)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidReward",
                        Message = "A jutalom mezők nem lehetnek negatívak"
                    });
                }

                if (dto.AgeRatingId.HasValue)
                {
                    var ageRatingExists = await _context.AgeRatings.AnyAsync(a => a.Id == dto.AgeRatingId.Value);
                    if (!ageRatingExists)
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidAgeRating",
                            Message = "A megadott age rating nem létezik"
                        });
                    }
                }

                var normalizedTagIds = (dto.TagIds ?? new List<int>())
                    .Where(idValue => idValue > 0)
                    .Distinct()
                    .ToList();

                var tags = await _context.Tags
                    .Where(t => normalizedTagIds.Contains(t.Id))
                    .ToListAsync();

                if (normalizedTagIds.Count != tags.Count)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidTags",
                        Message = "Egy vagy több megadott tag nem létezik"
                    });
                }

                if (normalizedType == "book")
                {
                    var book = await _context.Books
                        .Include(b => b.Tags)
                        .FirstOrDefaultAsync(b => b.Id == id);

                    if (book == null)
                    {
                        return NotFound(new ErrorResponseDTO
                        {
                            Error = "NotFound",
                            Message = "A könyv nem található"
                        });
                    }

                    var normalizedBookType = dto.BookType?.Trim().ToUpperInvariant() ?? string.Empty;
                    var allowedBookTypes = new[] { "BOOK", "AUDIOBOOK", "EBOOK" };
                    if (!allowedBookTypes.Contains(normalizedBookType))
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidBookType",
                            Message = "A book type értéke BOOK, AUDIOBOOK vagy EBOOK lehet"
                        });
                    }

                    if (!dto.PageNum.HasValue || dto.PageNum.Value < 1)
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidPageNum",
                            Message = "Az oldalszám minimum 1 lehet"
                        });
                    }

                    if (dto.AudioLength.HasValue && dto.AudioLength.Value < 0)
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidAudioLength",
                            Message = "Az audio hossz nem lehet negatív"
                        });
                    }

                    book.Title = normalizedTitle;
                    book.Released = dto.Released;
                    book.Rating = dto.Rating;
                    book.Description = normalizedDescription;
                    book.AgeRatingId = dto.AgeRatingId;
                    book.RewardXp = dto.RewardXP;
                    book.RewardPoints = dto.RewardPoints;
                    book.IsOfflineAvailable = dto.IsOfflineAvailable;
                    book.CoverApiName = normalizedCover;
                    book.PageNum = dto.PageNum.Value;
                    book.Type = normalizedBookType;
                    book.PdfUrl = dto.PdfUrl;
                    book.AudioUrl = dto.AudioUrl;
                    book.EpubUrl = dto.EpubUrl;
                    book.AudioLength = dto.AudioLength;
                    book.NarratorName = dto.NarratorName;
                    book.OriginalLanguage = dto.OriginalLanguage;

                    book.Tags.Clear();
                    foreach (var tag in tags)
                    {
                        book.Tags.Add(tag);
                    }

                    await _context.SaveChangesAsync();
                    await _context.Entry(book).ReloadAsync();

                    return Ok(new AdminContentItemDTO
                    {
                        Id = book.Id,
                        ContentType = "BOOK",
                        Title = book.Title,
                        Released = book.Released,
                        Rating = book.Rating,
                        Description = book.Description,
                        AgeRatingId = book.AgeRatingId,
                        TrailerUrl = null,
                        RewardXP = book.RewardXp,
                        RewardPoints = book.RewardPoints,
                        HasSubtitles = false,
                        IsOriginalLanguage = !string.IsNullOrWhiteSpace(book.OriginalLanguage),
                        IsOfflineAvailable = book.IsOfflineAvailable,
                        UpdatedAt = book.UpdatedAt,
                        CoverOrPosterApiName = book.CoverApiName,
                        PageNum = book.PageNum,
                        BookType = book.Type,
                        PdfUrl = book.PdfUrl,
                        AudioUrl = book.AudioUrl,
                        EpubUrl = book.EpubUrl,
                        AudioLength = book.AudioLength,
                        NarratorName = book.NarratorName,
                        OriginalLanguage = book.OriginalLanguage,
                        StreamUrl = null,
                        Length = null,
                        TagIds = book.Tags.Select(t => t.Id).ToList()
                    });
                }

                if (normalizedType == "movie")
                {
                    var movie = await _context.Movies
                        .Include(m => m.Tags)
                        .FirstOrDefaultAsync(m => m.Id == id);

                    if (movie == null)
                    {
                        return NotFound(new ErrorResponseDTO
                        {
                            Error = "NotFound",
                            Message = "A film nem található"
                        });
                    }

                    if (!dto.Length.HasValue || dto.Length.Value < 1)
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidLength",
                            Message = "A film hossza minimum 1 perc lehet"
                        });
                    }

                    var normalizedStream = dto.StreamUrl?.Trim() ?? string.Empty;
                    if (string.IsNullOrWhiteSpace(normalizedStream))
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidStreamUrl",
                            Message = "A stream URL kötelező"
                        });
                    }

                    movie.Title = normalizedTitle;
                    movie.Released = dto.Released;
                    movie.Rating = dto.Rating;
                    movie.Description = normalizedDescription;
                    movie.AgeRatingId = dto.AgeRatingId;
                    movie.TrailerUrl = dto.TrailerUrl;
                    movie.RewardXp = dto.RewardXP;
                    movie.RewardPoints = dto.RewardPoints;
                    movie.HasSubtitles = dto.HasSubtitles;
                    movie.IsOriginalLanguage = dto.IsOriginalLanguage;
                    movie.IsOfflineAvailable = dto.IsOfflineAvailable;
                    movie.PosterApiName = normalizedCover;
                    movie.StreamUrl = normalizedStream;
                    movie.Length = dto.Length.Value;

                    movie.Tags.Clear();
                    foreach (var tag in tags)
                    {
                        movie.Tags.Add(tag);
                    }

                    await _context.SaveChangesAsync();
                    await _context.Entry(movie).ReloadAsync();

                    return Ok(new AdminContentItemDTO
                    {
                        Id = movie.Id,
                        ContentType = "MOVIE",
                        Title = movie.Title,
                        Released = movie.Released,
                        Rating = movie.Rating,
                        Description = movie.Description,
                        AgeRatingId = movie.AgeRatingId,
                        TrailerUrl = movie.TrailerUrl,
                        RewardXP = movie.RewardXp,
                        RewardPoints = movie.RewardPoints,
                        HasSubtitles = movie.HasSubtitles,
                        IsOriginalLanguage = movie.IsOriginalLanguage,
                        IsOfflineAvailable = movie.IsOfflineAvailable,
                        UpdatedAt = movie.UpdatedAt,
                        CoverOrPosterApiName = movie.PosterApiName,
                        PageNum = null,
                        BookType = null,
                        PdfUrl = null,
                        AudioUrl = null,
                        EpubUrl = null,
                        AudioLength = null,
                        NarratorName = null,
                        OriginalLanguage = null,
                        StreamUrl = movie.StreamUrl,
                        Length = movie.Length,
                        TagIds = movie.Tags.Select(t => t.Id).ToList()
                    });
                }

                var series = await _context.Series
                    .Include(s => s.Tags)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (series == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = "A sorozat nem található"
                    });
                }

                series.Title = normalizedTitle;
                series.Released = dto.Released;
                series.Rating = dto.Rating;
                series.Description = normalizedDescription;
                series.AgeRatingId = dto.AgeRatingId;
                series.TrailerUrl = dto.TrailerUrl;
                series.RewardXp = dto.RewardXP;
                series.RewardPoints = dto.RewardPoints;
                series.HasSubtitles = dto.HasSubtitles;
                series.IsOriginalLanguage = dto.IsOriginalLanguage;
                series.IsOfflineAvailable = dto.IsOfflineAvailable;
                series.PosterApiName = normalizedCover;

                series.Tags.Clear();
                foreach (var tag in tags)
                {
                    series.Tags.Add(tag);
                }

                await _context.SaveChangesAsync();
                await _context.Entry(series).ReloadAsync();

                return Ok(new AdminContentItemDTO
                {
                    Id = series.Id,
                    ContentType = "SERIES",
                    Title = series.Title,
                    Released = series.Released,
                    Rating = series.Rating,
                    Description = series.Description,
                    AgeRatingId = series.AgeRatingId,
                    TrailerUrl = series.TrailerUrl,
                    RewardXP = series.RewardXp,
                    RewardPoints = series.RewardPoints,
                    HasSubtitles = series.HasSubtitles,
                    IsOriginalLanguage = series.IsOriginalLanguage,
                    IsOfflineAvailable = series.IsOfflineAvailable,
                    UpdatedAt = series.UpdatedAt,
                    CoverOrPosterApiName = series.PosterApiName,
                    PageNum = null,
                    BookType = null,
                    PdfUrl = null,
                    AudioUrl = null,
                    EpubUrl = null,
                    AudioLength = null,
                    NarratorName = null,
                    OriginalLanguage = null,
                    StreamUrl = null,
                    Length = null,
                    TagIds = series.Tags.Select(t => t.Id).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
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
            [FromQuery] string? q    = null,
            [FromQuery] string? userType = null)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var now = DateTime.UtcNow;
                var todayStart = now.Date;

                var summary = new
                {
                    totalUsers = await _context.Users.CountAsync(),
                    premium = await _context.Users.CountAsync(u => u.Premium && (!u.PremiumExpiresAt.HasValue || u.PremiumExpiresAt.Value >= now)),
                    staff = await _context.Users.CountAsync(u => u.PermissionLevel == "ADMIN" || u.PermissionLevel == "MODERATOR"),
                    banned = await _context.Users.CountAsync(u => u.PermissionLevel == "BANNED"),
                    activeToday = await _context.Users.CountAsync(u => u.LastLoginDate >= todayStart)
                };

                IQueryable<User> query = _context.Users;

                if (!string.IsNullOrWhiteSpace(userType))
                {
                    var normalizedFilter = userType.Trim().ToLowerInvariant();
                    var allowedFilters = new[] { "all", "premium", "staff", "banned" };

                    if (!allowedFilters.Contains(normalizedFilter))
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidUserType",
                            Message = "Érvénytelen userType. Lehetséges: all, premium, staff, banned"
                        });
                    }

                    if (normalizedFilter == "premium")
                    {
                        query = query.Where(u => u.Premium);
                    }
                    else if (normalizedFilter == "staff")
                    {
                        query = query.Where(u => u.PermissionLevel == "ADMIN" || u.PermissionLevel == "MODERATOR");
                    }
                    else if (normalizedFilter == "banned")
                    {
                        query = query.Where(u => u.PermissionLevel == "BANNED");
                    }
                }

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
                        CountryCode     = string.Equals(u.CountryCode, "ZZ", StringComparison.OrdinalIgnoreCase) ? null : u.CountryCode,
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

                return Ok(new { total, page, pageSize, users, summary });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PUT /api/admin/users/{id}
        // Felhasználó frissítése – admin/moderátor jogosultság szükséges
        // ================================================================
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateAdminUserDTO dto)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (dto == null)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidPayload",
                        Message = "A kérés törzse kötelező"
                    });
                }

                var normalizedPermissionLevel = dto.PermissionLevel?.Trim().ToUpperInvariant() ?? string.Empty;
                var normalizedCountryCode = dto.CountryCode?.Trim().ToUpperInvariant();

                var allowedPermissionLevels = new[] { "USER", "MODERATOR", "ADMIN", "BANNED" };
                if (!allowedPermissionLevels.Contains(normalizedPermissionLevel))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidPermissionLevel",
                        Message = "Érvénytelen jogosultság. Lehetséges: USER, MODERATOR, ADMIN, BANNED"
                    });
                }

                if (!string.IsNullOrEmpty(normalizedCountryCode) && normalizedCountryCode != "ZZ" && normalizedCountryCode.Length != 2)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidCountryCode",
                        Message = "Az országkód pontosan 2 karakter lehet, vagy üresen hagyva törölhető"
                    });
                }

                var countryCodeToSave = string.IsNullOrEmpty(normalizedCountryCode) || normalizedCountryCode == "ZZ"
                    ? null
                    : normalizedCountryCode;

                if (dto.Level < 1)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidLevel",
                        Message = "A szint minimum 1 lehet"
                    });
                }

                if (dto.Xp < 0 || dto.Xp > 999)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidXP",
                        Message = "Az XP értéke 0 és 999 közé kell essen"
                    });
                }

                if (dto.DayStreak < 0 || dto.ReadTimeMin < 0 || dto.WatchTimeMin < 0 || dto.BookPoints < 0 || dto.SeriesPoints < 0 || dto.MoviePoints < 0)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidNumericValues",
                        Message = "A numerikus mezők nem lehetnek negatívak"
                    });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
                if (user == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = "A felhasználó nem található"
                    });
                }

                user.PermissionLevel = normalizedPermissionLevel;
                if (dto.ResetProfilePicture)
                {
                    // Null profile picture means default avatar should be used by clients.
                    user.ProfilePic = null;
                }
                user.Premium = dto.Premium;
                user.PremiumExpiresAt = dto.Premium ? dto.PremiumExpiresAt : null;
                user.Level = dto.Level;
                user.Xp = dto.Xp;
                user.CountryCode = countryCodeToSave;
                user.DayStreak = dto.DayStreak;
                user.ReadTimeMin = dto.ReadTimeMin;
                user.WatchTimeMin = dto.WatchTimeMin;
                user.BookPoints = dto.BookPoints;
                user.SeriesPoints = dto.SeriesPoints;
                user.MoviePoints = dto.MoviePoints;

                await _context.SaveChangesAsync();

                return Ok(new AdminUserItemDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Avatar = user.ProfilePic != null ? Convert.ToBase64String(user.ProfilePic) : null,
                    PermissionLevel = user.PermissionLevel,
                    Premium = user.Premium,
                    PremiumExpiresAt = user.PremiumExpiresAt,
                    Level = user.Level,
                    Xp = user.Xp,
                    CountryCode = string.Equals(user.CountryCode, "ZZ", StringComparison.OrdinalIgnoreCase) ? null : user.CountryCode,
                    CreationDate = user.CreationDate,
                    LastLoginDate = user.LastLoginDate,
                    DayStreak = user.DayStreak,
                    ReadTimeMin = user.ReadTimeMin,
                    WatchTimeMin = user.WatchTimeMin,
                    BookPoints = user.BookPoints,
                    SeriesPoints = user.SeriesPoints,
                    MoviePoints = user.MoviePoints
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // DELETE /api/admin/users/{id}
        // Felhasználó törlése – admin jogosultság szükséges
        // ================================================================
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel != "ADMIN")
                    return Forbid();

                var actorUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (actorUserId == id)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "SelfDeleteNotAllowed",
                        Message = "Saját admin fiók törlése ezen a végponton nem engedélyezett"
                    });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
                if (user == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = "A felhasználó nem található"
                    });
                }

                // deleting_user trigger: CountryCode cannot be NULL, PermissionLevel cannot be BANNED
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

                // mail_sender_fk doesn't cascade; handle sent mails before deleting user
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

                return Ok(new MessageResponseDTO
                {
                    Message = "Felhasználó sikeresen törölve"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/admin/news
        // Hírek listázása – admin/moderátor jogosultság szükséges
        //
        // Query paraméterek:
        //   page      – oldalszám (alapértelmezett: 1)
        //   pageSize  – oldal mérete (alapértelmezett: 20, max: 100)
        //   eventTag  – szűrés EventTag alapján (opcionális)
        //   q         – keresés cím/tartalom/EventTag alapján (opcionális)
        // ================================================================
        [HttpGet("news")]
        public async Task<IActionResult> GetNews(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? eventTag = null,
            [FromQuery] string? q = null)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var summary = new AdminNewsSummaryDTO
                {
                    Total = await _context.Articles.CountAsync(),
                    Updates = await _context.Articles.CountAsync(a => a.EventTag == "UPDATE"),
                    Announcements = await _context.Articles.CountAsync(a => a.EventTag == "ANNOUNCEMENT"),
                    Events = await _context.Articles.CountAsync(a => a.EventTag == "EVENT"),
                    Functions = await _context.Articles.CountAsync(a => a.EventTag == "FUNCTION")
                };

                IQueryable<Article> query = _context.Articles;

                if (!string.IsNullOrWhiteSpace(eventTag))
                {
                    var normalizedTag = eventTag.Trim().ToUpperInvariant();
                    var allowedEventTags = new[] { "UPDATE", "ANNOUNCEMENT", "EVENT", "FUNCTION" };

                    if (!allowedEventTags.Contains(normalizedTag))
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidEventTag",
                            Message = "Érvénytelen EventTag. Lehetséges: UPDATE, ANNOUNCEMENT, EVENT, FUNCTION"
                        });
                    }

                    query = query.Where(a => a.EventTag == normalizedTag);
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var search = q.Trim().ToLower();
                    query = query.Where(a =>
                        a.Title.ToLower().Contains(search) ||
                        a.Content.ToLower().Contains(search) ||
                        a.EventTag.ToLower().Contains(search));
                }

                var total = await query.CountAsync();

                var news = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new AdminNewsItemDTO
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Content = a.Content,
                        EventTag = a.EventTag,
                        CreatedAt = a.CreatedAt,
                        UpdatedAt = a.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, news, summary });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PUT /api/admin/news/{id}
        // Hír frissítése – admin/moderátor jogosultság szükséges
        // ================================================================
        [HttpPut("news/{id}")]
        public async Task<IActionResult> UpdateNews(int id, [FromBody] UpdateAdminNewsDTO dto)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (dto == null)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidPayload",
                        Message = "A kérés törzse kötelező"
                    });
                }

                var title = dto.Title?.Trim() ?? string.Empty;
                var content = dto.Content?.Trim() ?? string.Empty;
                var eventTag = dto.EventTag?.Trim().ToUpperInvariant() ?? string.Empty;

                if (string.IsNullOrWhiteSpace(title) || title.Length > 255)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidTitle",
                        Message = "A cím kötelező, maximum 255 karakter hosszú lehet"
                    });
                }

                if (string.IsNullOrWhiteSpace(content))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidContent",
                        Message = "A tartalom kötelező"
                    });
                }

                var allowedEventTags = new[] { "UPDATE", "ANNOUNCEMENT", "EVENT", "FUNCTION" };
                if (!allowedEventTags.Contains(eventTag))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidEventTag",
                        Message = "Érvénytelen EventTag. Lehetséges: UPDATE, ANNOUNCEMENT, EVENT, FUNCTION"
                    });
                }

                var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id);
                if (article == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = "A hír nem található"
                    });
                }

                article.Title = title;
                article.Content = content;
                article.EventTag = eventTag;
                article.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new AdminNewsItemDTO
                {
                    Id = article.Id,
                    Title = article.Title,
                    Content = article.Content,
                    EventTag = article.EventTag,
                    CreatedAt = article.CreatedAt,
                    UpdatedAt = article.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // GET /api/admin/challenges/options
        // Kihívás szerkesztéshez badge/title opciók – admin/moderátor jogosultság szükséges
        // ================================================================
        [HttpGet("challenges/options")]
        public async Task<IActionResult> GetChallengeOptions()
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                var badges = await _context.Badges
                    .OrderBy(b => b.Name)
                    .Select(b => new AdminChallengeBadgeOptionDTO
                    {
                        Id = b.Id,
                        Name = b.Name,
                        Category = b.Category,
                        Rarity = b.Rarity,
                        IsHidden = b.IsHidden
                    })
                    .ToListAsync();

                var titles = await _context.Titles
                    .OrderBy(t => t.Name)
                    .Select(t => new AdminChallengeTitleOptionDTO
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        Rarity = t.Rarity
                    })
                    .ToListAsync();

                return Ok(new AdminChallengeOptionsDTO
                {
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
        // GET /api/admin/challenges
        // Kihívások listázása – admin/moderátor jogosultság szükséges
        //
        // Query paraméterek:
        //   page      – oldalszám (alapértelmezett: 1)
        //   pageSize  – oldal mérete (alapértelmezett: 20, max: 100)
        //   type      – szűrés típus alapján (opcionális)
        //   q         – keresés cím/típus/nehézség/leírás alapján (opcionális)
        // ================================================================
        [HttpGet("challenges")]
        public async Task<IActionResult> GetChallenges(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? type = null,
            [FromQuery] string? q = null)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var summary = new AdminChallengeSummaryDTO
                {
                    Total = await _context.Challenges.CountAsync(),
                    Active = await _context.Challenges.CountAsync(c => c.IsActive == true),
                    Repeatable = await _context.Challenges.CountAsync(c => c.IsRepeatable),
                    Event = await _context.Challenges.CountAsync(c => c.Type == "EVENT")
                };

                IQueryable<Challenge> query = _context.Challenges;

                if (!string.IsNullOrWhiteSpace(type))
                {
                    var normalizedType = type.Trim().ToUpperInvariant();
                    var allowedTypes = new[] { "READ", "WATCH", "SOCIAL", "MIXED", "DEDICATION", "EVENT" };

                    if (!allowedTypes.Contains(normalizedType))
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidType",
                            Message = "Érvénytelen type. Lehetséges: READ, WATCH, SOCIAL, MIXED, DEDICATION, EVENT"
                        });
                    }

                    query = query.Where(c => c.Type == normalizedType);
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var search = q.Trim().ToLower();
                    query = query.Where(c =>
                        c.Title.ToLower().Contains(search) ||
                        c.Description.ToLower().Contains(search) ||
                        c.Type.ToLower().Contains(search) ||
                        c.Difficulty.ToLower().Contains(search));
                }

                var total = await query.CountAsync();

                var challenges = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .ThenByDescending(c => c.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new AdminChallengeItemDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        IconUrl = c.IconUrl,
                        Type = c.Type,
                        TargetValue = c.TargetValue,
                        RewardXP = c.RewardXp,
                        RewardBadgeId = c.RewardBadgeId,
                        RewardTitleId = c.RewardTitleId,
                        Difficulty = c.Difficulty,
                        IsActive = c.IsActive ?? false,
                        IsRepeatable = c.IsRepeatable,
                        CreatedAt = c.CreatedAt,
                        Participants = _context.UserChallenges.Count(uc => uc.ChallengeId == c.Id),
                        Completions = _context.UserChallenges.Count(uc => uc.ChallengeId == c.Id && (uc.Status == "COMPLETED" || uc.Status == "CLAIMED"))
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, challenges, summary });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        // ================================================================
        // PUT /api/admin/challenges/{id}
        // Kihívás frissítése – admin/moderátor jogosultság szükséges
        // ================================================================
        [HttpPut("challenges/{id}")]
        public async Task<IActionResult> UpdateChallenge(int id, [FromBody] UpdateAdminChallengeDTO dto)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (dto == null)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidPayload",
                        Message = "A kérés törzse kötelező"
                    });
                }

                var title = dto.Title?.Trim() ?? string.Empty;
                var description = dto.Description?.Trim() ?? string.Empty;
                var type = dto.Type?.Trim().ToUpperInvariant() ?? string.Empty;
                var difficulty = dto.Difficulty?.Trim().ToUpperInvariant() ?? string.Empty;

                if (string.IsNullOrWhiteSpace(title) || title.Length > 128)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidTitle",
                        Message = "A cím kötelező, maximum 128 karakter hosszú lehet"
                    });
                }

                if (string.IsNullOrWhiteSpace(description))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidDescription",
                        Message = "A leírás kötelező"
                    });
                }

                var allowedTypes = new[] { "READ", "WATCH", "SOCIAL", "MIXED", "DEDICATION", "EVENT" };
                if (!allowedTypes.Contains(type))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidType",
                        Message = "Érvénytelen type. Lehetséges: READ, WATCH, SOCIAL, MIXED, DEDICATION, EVENT"
                    });
                }

                var allowedDifficulties = new[] { "EASY", "MEDIUM", "HARD", "EPIC" };
                if (!allowedDifficulties.Contains(difficulty))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidDifficulty",
                        Message = "Érvénytelen difficulty. Lehetséges: EASY, MEDIUM, HARD, EPIC"
                    });
                }

                if (dto.TargetValue < 1)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidTargetValue",
                        Message = "A célérték minimum 1 lehet"
                    });
                }

                if (dto.RewardXP < 0)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidRewardXP",
                        Message = "A jutalom XP nem lehet negatív"
                    });
                }

                if (dto.RewardBadgeId.HasValue)
                {
                    var badgeExists = await _context.Badges.AnyAsync(b => b.Id == dto.RewardBadgeId.Value);
                    if (!badgeExists)
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidRewardBadge",
                            Message = "A megadott reward badge nem létezik"
                        });
                    }
                }

                if (dto.RewardTitleId.HasValue)
                {
                    var titleExists = await _context.Titles.AnyAsync(t => t.Id == dto.RewardTitleId.Value);
                    if (!titleExists)
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidRewardTitle",
                            Message = "A megadott reward title nem létezik"
                        });
                    }
                }

                var challenge = await _context.Challenges.FirstOrDefaultAsync(c => c.Id == id);
                if (challenge == null)
                {
                    return NotFound(new ErrorResponseDTO
                    {
                        Error = "NotFound",
                        Message = "A kihívás nem található"
                    });
                }

                challenge.Title = title;
                challenge.Description = description;
                challenge.Type = type;
                challenge.TargetValue = dto.TargetValue;
                challenge.RewardXp = dto.RewardXP;
                challenge.RewardBadgeId = dto.RewardBadgeId;
                challenge.RewardTitleId = dto.RewardTitleId;
                challenge.Difficulty = difficulty;
                challenge.IsActive = dto.IsActive;
                challenge.IsRepeatable = dto.IsRepeatable;

                await _context.SaveChangesAsync();

                var participants = await _context.UserChallenges.CountAsync(uc => uc.ChallengeId == challenge.Id);
                var completions = await _context.UserChallenges.CountAsync(uc => uc.ChallengeId == challenge.Id && (uc.Status == "COMPLETED" || uc.Status == "CLAIMED"));

                return Ok(new AdminChallengeItemDTO
                {
                    Id = challenge.Id,
                    Title = challenge.Title,
                    Description = challenge.Description,
                    IconUrl = challenge.IconUrl,
                    Type = challenge.Type,
                    TargetValue = challenge.TargetValue,
                    RewardXP = challenge.RewardXp,
                    RewardBadgeId = challenge.RewardBadgeId,
                    RewardTitleId = challenge.RewardTitleId,
                    Difficulty = challenge.Difficulty,
                    IsActive = challenge.IsActive ?? false,
                    IsRepeatable = challenge.IsRepeatable,
                    CreatedAt = challenge.CreatedAt,
                    Participants = participants,
                    Completions = completions
                });
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

        // ================================================================
        // POST /api/admin/announcements
        // Rendszerszintű bejelentés küldése a mail táblába
        // ================================================================
        [HttpPost("announcements")]
        public async Task<IActionResult> SendAnnouncement([FromBody] CreateAdminAnnouncementDTO dto)
        {
            try
            {
                var permissionLevel = User.FindFirst("permissionLevel")?.Value;
                if (permissionLevel is not ("ADMIN" or "MODERATOR"))
                    return Forbid();

                if (dto == null)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidPayload",
                        Message = "A kérés törzse kötelező"
                    });
                }

                var target = dto.Target?.Trim().ToLowerInvariant() ?? string.Empty;
                var message = dto.Message?.Trim() ?? string.Empty;
                var allowedTargets = new[] { "all", "subscribers", "free", "specific" };

                if (!allowedTargets.Contains(target))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidTarget",
                        Message = "Érvénytelen célcsoport. Lehetséges: all, subscribers, free, specific"
                    });
                }

                if (string.IsNullOrWhiteSpace(message))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "InvalidMessage",
                        Message = "Az üzenet szövege kötelező"
                    });
                }

                IQueryable<User> usersQuery = _context.Users;
                List<string> missingUsernames = new();

                if (target == "subscribers")
                {
                    usersQuery = usersQuery.Where(u => u.Premium);
                }
                else if (target == "free")
                {
                    usersQuery = usersQuery.Where(u => !u.Premium);
                }
                else if (target == "specific")
                {
                    var normalizedUsernames = (dto.Usernames ?? new List<string>())
                        .Where(u => !string.IsNullOrWhiteSpace(u))
                        .Select(u => u.Trim().ToLowerInvariant())
                        .Distinct()
                        .ToList();

                    if (normalizedUsernames.Count == 0)
                    {
                        return BadRequest(new ErrorResponseDTO
                        {
                            Error = "InvalidRecipients",
                            Message = "Adott felhasználók célcsoportnál legalább egy felhasználónevet meg kell adni"
                        });
                    }

                    var foundUsers = await _context.Users
                        .Where(u => normalizedUsernames.Contains(u.Username.ToLower()))
                        .Select(u => new { u.Id, u.Username })
                        .ToListAsync();

                    var foundUsernameSet = foundUsers
                        .Select(u => u.Username.ToLowerInvariant())
                        .ToHashSet();

                    missingUsernames = normalizedUsernames
                        .Where(username => !foundUsernameSet.Contains(username))
                        .ToList();

                    usersQuery = _context.Users.Where(u => foundUsernameSet.Contains(u.Username.ToLower()));
                }

                var receiverIds = await usersQuery.Select(u => u.Id).ToListAsync();

                if (receiverIds.Count == 0)
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "NoRecipients",
                        Message = "A kiválasztott célcsoporthoz nem tartozik egyetlen felhasználó sem"
                    });
                }

                var senderId = int.TryParse(User.FindFirst("userId")?.Value, out var parsedSenderId)
                    ? parsedSenderId
                    : 1;
                var now = DateTime.UtcNow;

                var mails = receiverIds.Select(receiverId => new Mail
                {
                    ReceiverId = receiverId,
                    SenderId = senderId,
                    Type = "SYSTEM",
                    Subject = "Rendszerbejelentés",
                    Message = message,
                    IsRead = false,
                    CreatedAt = now
                }).ToList();

                await _context.Mails.AddRangeAsync(mails);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    sentCount = mails.Count,
                    missingUsernames
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}
