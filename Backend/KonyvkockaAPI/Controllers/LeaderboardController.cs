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
    public class LeaderboardController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public LeaderboardController(KonyvkockaContext context)
        {
            _context = context;
        }

        private static string? NormalizeCountryCode(string? countryCode)
        {
            var normalized = countryCode?.Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalized) || normalized == "ZZ")
                return null;

            return normalized;
        }

        /// <summary>
        /// Ranglista lekérése tartalom- és régió-szűrő szerint.
        /// GET /api/leaderboard?content=all&amp;region=world&amp;page=1&amp;pageSize=50
        ///
        /// content: all | books | media
        ///   - all:   BookPoints + SeriesPoints + MoviePoints
        ///   - books: BookPoints
        ///   - media: SeriesPoints + MoviePoints
        ///
        /// region: world | country
        ///   - world:   minden felhasználó
        ///   - country: csak a bejelentkezett user CountryCode-jával megegyező userek
        ///
        /// A válasz tetején mindig szerepel a "me" objektum a bejelentkezett user
        /// aktuális szűrés szerinti adataival, függetlenül attól, hogy melyik oldalon van.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetLeaderboard(
            [FromQuery] string content = "all",
            [FromQuery] string region = "world",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            // --- paraméter validáció ---
            var validContent = new[] { "all", "books", "media" };
            var validRegion = new[] { "world", "country" };

            var normalizedContent = content.ToLowerInvariant();
            var normalizedRegion = region.ToLowerInvariant();

            if (!validContent.Contains(normalizedContent))
                return BadRequest(new ErrorResponseDTO
                {
                    Error = "InvalidParameter",
                    Message = "A content paraméter értéke csak 'all', 'books' vagy 'media' lehet."
                });

            if (!validRegion.Contains(normalizedRegion))
                return BadRequest(new ErrorResponseDTO
                {
                    Error = "InvalidParameter",
                    Message = "A region paraméter értéke csak 'world' vagy 'country' lehet."
                });

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 50;

            try
            {
                var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var currentUser = await _context.Users.FindAsync(currentUserId);

                if (currentUser == null)
                    return Unauthorized(new ErrorResponseDTO
                    {
                        Error = "Unauthorized",
                        Message = "Érvénytelen vagy lejárt token."
                    });

                var normalizedCurrentCountryCode = NormalizeCountryCode(currentUser.CountryCode);

                if (normalizedRegion == "country" && string.IsNullOrWhiteSpace(normalizedCurrentCountryCode))
                {
                    return BadRequest(new ErrorResponseDTO
                    {
                        Error = "CountryNotSet",
                        Message = "Az ország ranglistához előbb állíts be országot a profil beállításokban."
                    });
                }

                // --- alap lekérdezés, régió szűrés ---
                IQueryable<User> query = _context.Users;

                if (normalizedRegion == "country")
                    query = query.Where(u => u.CountryCode == normalizedCurrentCountryCode);

                // --- rendezés content szerint ---
                query = content.ToLower() switch
                {
                    "books" => query.OrderByDescending(u => u.BookPoints).ThenBy(u => u.Id),
                    "media" => query.OrderByDescending(u => u.SeriesPoints + u.MoviePoints).ThenBy(u => u.Id),
                    _ => query.OrderByDescending(u => u.BookPoints + u.SeriesPoints + u.MoviePoints).ThenBy(u => u.Id)
                };

                // --- összes találat a lapozáshoz ---
                var total = await query.CountAsync();

                // --- rangsor: SQL nem tud közvetlen sorszámot adni,
                //     ezért az összes Id-t lekérjük rendezve, és az index adja a rangot ---
                var orderedIds = await query.Select(u => u.Id).ToListAsync();

                // --- aktuális oldal userei ---
                var skip = (page - 1) * pageSize;
                var pageUserIds = orderedIds.Skip(skip).Take(pageSize).ToList();

                var pageUsers = await _context.Users
                    .Where(u => pageUserIds.Contains(u.Id))
                    .Include(u => u.UserBooks)
                    .Include(u => u.UserMovies)
                    .Include(u => u.UserSeries)
                    .ToListAsync();

                // --- entries összeállítása a helyes rang-sorrendben ---
                var entries = pageUserIds
                    .Select((userId, idx) =>
                    {
                        var u = pageUsers.First(x => x.Id == userId);
                        return BuildEntry(u, skip + idx + 1, content);
                    })
                    .ToList();

                // --- "me" objektum: bejelentkezett user rangja az aktuális szűrésben ---
                var meIndex = orderedIds.IndexOf(currentUserId);
                var meRank = meIndex >= 0 ? meIndex + 1 : 0;

                var meUser = await _context.Users
                    .Where(u => u.Id == currentUserId)
                    .Include(u => u.UserBooks)
                    .Include(u => u.UserMovies)
                    .Include(u => u.UserSeries)
                    .FirstAsync();

                var me = BuildEntry(meUser, meRank, content);

                return Ok(new LeaderboardResponseDTO
                {
                    Me = me,
                    Entries = entries,
                    Total = total,
                    Page = page,
                    PageSize = pageSize
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

        // -------------------------------------------------------
        // Segédfüggvény: egy User-ből LeaderboardEntryDTO építése
        // -------------------------------------------------------
        private static LeaderboardEntryDTO BuildEntry(User u, int rank, string content)
        {
            // --- pontszám a content szűrő szerint ---
            var points = content.ToLower() switch
            {
                "books" => u.BookPoints,
                "media" => u.SeriesPoints + u.MoviePoints,
                _ => u.BookPoints + u.SeriesPoints + u.MoviePoints
            };

            // --- bookCount / mediaCount: minden státuszú elem ---
            var bookCount = u.UserBooks.Count;
            var mediaCount = u.UserMovies.Count + u.UserSeries.Count;

            // --- completionPct: COMPLETED elemek / összes hozzáadott elem (content szerint) ---
            double completionPct = content.ToLower() switch
            {
                "books" => CalcPct(
                    u.UserBooks.Count(b => b.Status == "COMPLETED"),
                    bookCount),

                "media" => CalcPct(
                    u.UserMovies.Count(m => m.Status == "COMPLETED") +
                    u.UserSeries.Count(s => s.Status == "COMPLETED"),
                    mediaCount),

                _ => CalcPct(
                    u.UserBooks.Count(b => b.Status == "COMPLETED") +
                    u.UserMovies.Count(m => m.Status == "COMPLETED") +
                    u.UserSeries.Count(s => s.Status == "COMPLETED"),
                    bookCount + mediaCount)
            };

            return new LeaderboardEntryDTO
            {
                Rank = rank,
                UserId = u.Id,
                Username = u.Username,
                Avatar = u.ProfilePic != null ? Convert.ToBase64String(u.ProfilePic) : null,
                CountryCode = NormalizeCountryCode(u.CountryCode),
                IsPremium = u.Premium,
                Points = points,
                BookCount = bookCount,
                MediaCount = mediaCount,
                CompletionPct = completionPct,
                Level = u.Level,
                DayStreak = u.DayStreak
            };
        }

        private static double CalcPct(int completed, int total)
        {
            if (total == 0) return 0.0;
            return Math.Round((double)completed / total * 100, 1);
        }
    }
}