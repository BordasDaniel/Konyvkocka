using KonyvkockaAPI.DTO.Response;

namespace KonyvkockaAPI.Services
{
    public interface IContentService
    {
        // 10.1
        Task<ContentSearchResponseDTO> SearchContent(
            string q, string type, string bookType, int? genreId,
            int? yearMin, int? yearMax, decimal? ratingMin,
            int? ageRatingId, int limit, int offset);

        // 10.2
        Task<object> GetContentDetails(string type, int id, int userId);

        // 10.3
        Task<ContentCategoryResultDTO> GetContentByCategory(string category, string type, int limit);

        // 10.4
        Task<object> RateContent(string type, int id, int userId, decimal rating);

        // 10.5
        Task<List<GenreDTO>> GetGenres();

        // 10.6
        Task<List<AgeRatingDTO>> GetAgeRatings();
    }
}
