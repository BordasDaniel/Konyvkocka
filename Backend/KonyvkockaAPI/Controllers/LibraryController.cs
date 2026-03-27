using KonyvkockaAPI.DTO;
using KonyvkockaAPI.DTO.Request;
using KonyvkockaAPI.DTO.Response;
using KonyvkockaAPI.Extensions;
using KonyvkockaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KonyvkockaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LibraryController : ControllerBase
    {
        private readonly KonyvkockaContext _context;

        public LibraryController(KonyvkockaContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Könyvtár tartalmainak lekérése
        /// GET /api/library/items
        /// </summary>
        [HttpGet("items")]
        public async Task<IActionResult> GetLibraryItems(
            [FromQuery] string? query = null,
            [FromQuery] string[]? status = null,
            [FromQuery] string[]? type = null,
            [FromQuery] bool? favorite = null,
            [FromQuery] string? sort = "lastSeen",
            [FromQuery] string? order = "desc")
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var items = new List<LibraryItemDTO>();

                // Books
                if (type == null || type.Contains("book"))
                {
                    var books = await _context.UserBooks
                        .Where(ub => ub.UserId == userId)
                        .Include(ub => ub.Book)
                        .ThenInclude(b => b.Genres)
                        .AsQueryable()
                        .ApplyFilters(query, status, favorite)
                        .Select(ub => new LibraryItemDTO
                        {
                            Type = "book",
                            Id = ub.Book.Id,
                            Title = ub.Book.Title,
                            Img = ub.Book.CoverApiName,
                            Year = (int?)ub.Book.Released,
                            Rating = (decimal?)ub.Book.Rating,
                            Desc = ub.Book.Description,
                            Pages = ub.Book.PageNum,
                            BookType = ub.Book.Type,
                            Reader = ub.Book.PdfUrl,
                            Status = ub.Status == "WATCHING" ? "reading" : ub.Status.ToLower(),
                            Favorite = ub.Favorite,
                            UserRating = ub.Rating,
                            AddedAt = ub.AddedAt,
                            CurrentPage = ub.CurrentPage,
                            Tags = ub.Book.Genres.Select(g => g.Name).ToList()
                        })
                        .ToListAsync();
                    items.AddRange(books);
                }

                // Movies
                if (type == null || type.Contains("movie"))
                {
                    var movies = await _context.UserMovies
                        .Where(um => um.UserId == userId)
                        .Include(um => um.Movie)
                        .ThenInclude(m => m.Genres)
                        .AsQueryable()
                        .ApplyFilters(query, status, favorite)
                        .Select(um => new LibraryItemDTO
                        {
                            Type = "movie",
                            Id = um.Movie.Id,
                            Title = um.Movie.Title,
                            Img = um.Movie.PosterApiName,
                            Year = (int?)um.Movie.Released,
                            Rating = (decimal?)um.Movie.Rating,
                            Desc = um.Movie.Description,
                            Trailer = um.Movie.TrailerUrl,
                            Length = um.Movie.Length,
                            Status = um.Status.ToLower(),
                            Favorite = um.Favorite,
                            UserRating = um.Rating,
                            AddedAt = um.AddedAt,
                            CompletedAt = um.CompletedAt,
                            CurrentPosition = um.CurrentPosition,
                            Tags = um.Movie.Genres.Select(g => g.Name).ToList()
                        })
                        .ToListAsync();
                    items.AddRange(movies);
                }

                // Series
                if (type == null || type.Contains("series"))
                {
                    var series = await _context.UserSeries
                        .Where(us => us.UserId == userId)
                        .Include(us => us.Series)
                        .ThenInclude(s => s.Genres)
                        .AsQueryable()
                        .ApplyFilters(query, status, favorite)
                        .Select(us => new LibraryItemDTO
                        {
                            Type = "series",
                            Id = us.Series.Id,
                            Title = us.Series.Title,
                            Img = us.Series.PosterApiName,
                            Year = (int?)us.Series.Released,
                            Rating = (decimal?)us.Series.Rating,
                            Desc = us.Series.Description,
                            Trailer = us.Series.TrailerUrl,
                            Status = us.Status.ToLower(),
                            Favorite = us.Favorite,
                            UserRating = us.Rating,
                            AddedAt = us.AddedAt,
                            Tags = us.Series.Genres.Select(g => g.Name).ToList()
                        })
                        .ToListAsync();
                    items.AddRange(series);
                }

                // Sort
                items = sort switch
                {
                    "title" => order == "desc" ? items.OrderByDescending(i => i.Title).ToList() : items.OrderBy(i => i.Title).ToList(),
                    "rating" => order == "desc" ? items.OrderByDescending(i => i.Rating).ToList() : items.OrderBy(i => i.Rating).ToList(),
                    "addedAt" => order == "desc" ? items.OrderByDescending(i => i.AddedAt).ToList() : items.OrderBy(i => i.AddedAt).ToList(),
                    _ => items.OrderByDescending(i => i.AddedAt).ToList()
                };

                return Ok(new { items, total = items.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }

        /// <summary>
        /// Tartalom hozzáadása a könyvtárhoz
        /// POST /api/library/add
        /// </summary>
        [HttpPost("add")]
        public async Task<IActionResult> AddToLibrary(AddToLibraryDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

                if (dto.Type == "book")
                {
                    var existing = await _context.UserBooks.FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == dto.ContentId);
                    if (existing != null)
                        return StatusCode(409, new ErrorResponseDTO { Error = "Already in library", Message = "Ez a tartalom már szerepel a könyvtáradban" });

                    var userBook = new UserBook
                    {
                        UserId = userId,
                        BookId = dto.ContentId,
                        Status = dto.Status.ToUpper() == "PLANNED" ? "PLANNED" : "WATCHING",
                        AddedAt = DateTime.Now
                    };
                    _context.UserBooks.Add(userBook);
                }
                else if (dto.Type == "movie")
                {
                    var existing = await _context.UserMovies.FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == dto.ContentId);
                    if (existing != null)
                        return StatusCode(409, new ErrorResponseDTO { Error = "Already in library", Message = "Ez a tartalom már szerepel a könyvtáradban" });

                    var userMovie = new UserMovie
                    {
                        UserId = userId,
                        MovieId = dto.ContentId,
                        Status = dto.Status.ToUpper() == "PLANNED" ? "PLANNED" : "WATCHING",
                        AddedAt = DateTime.Now
                    };
                    _context.UserMovies.Add(userMovie);
                }
                else if (dto.Type == "series")
                {
                    var existing = await _context.UserSeries.FirstOrDefaultAsync(us => us.UserId == userId && us.SeriesId == dto.ContentId);
                    if (existing != null)
                        return StatusCode(409, new ErrorResponseDTO { Error = "Already in library", Message = "Ez a tartalom már szerepel a könyvtáradban" });

                    var userSeries = new UserSeries
                    {
                        UserId = userId,
                        SeriesId = dto.ContentId,
                        Status = dto.Status.ToUpper() == "PLANNED" ? "PLANNED" : "WATCHING",
                        AddedAt = DateTime.Now
                    };
                    _context.UserSeries.Add(userSeries);
                }

                await _context.SaveChangesAsync();
                return Ok(new MessageResponseDTO { Message = "Tartalom hozzáadva a könyvtárhoz" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponseDTO { Error = "InternalError", Message = ex.Message });
            }
        }
    }
}