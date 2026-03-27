namespace KonyvkockaAPI.DTO.Response
{
    public class HistoryItemDTO
    {
        public int Id { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public int ContentId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Author { get; set; }

        /// <summary>
        /// Book cover URL.
        /// </summary>
        public string? Cover { get; set; }

        /// <summary>
        /// Series/movie poster URL.
        /// </summary>
        public string? PosterUrl { get; set; }

        public string? Status { get; set; }
        public int? Progress { get; set; }
        public decimal? Rating { get; set; }

        public DateTime LastRead { get; set; }
        public DateTime LastWatched { get; set; }
    }
}
