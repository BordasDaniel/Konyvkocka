namespace KonyvkockaAPI.DTO.Request
{
    public class UpdateHistoryDTO
    {
        public string ContentType { get; set; } = string.Empty;
        public int ContentId { get; set; }

        /// <summary>
        /// Generic progress value:
        /// - book: current page
        /// - series/movie: current position/episode progress (as used by the app)
        /// </summary>
        public int? Progress { get; set; }

        public string? Status { get; set; }
        public decimal? Rating { get; set; }
    }
}
