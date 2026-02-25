namespace KonyvkockaAPI.DTO.Response
{
    public class ContentCategoryResultDTO
    {
        /// <summary>
        /// Kategória neve: "latest" | "popular" | "top_rated" | "new_books" | "new_movies" | "new_series"
        /// </summary>
        public string Category { get; set; } = null!;

        public List<ContentSearchItemDTO> Items { get; set; } = new();
        public int Total { get; set; }
    }
}
