namespace KonyvkockaAPI.DTO.Response
{
    /// <summary>
    /// Könyv lista-elem DTO – könyvtár és előzmény listákban
    /// </summary>
    public class BookItemDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;

        /// <summary>
        /// Borítókép API neve
        /// </summary>
        public string Img { get; set; } = null!;

        public string Status { get; set; } = null!;
        public bool Favorite { get; set; }
        public decimal? Rating { get; set; }
        public DateTime? AddedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int CurrentPage { get; set; }
        public int Pages { get; set; }

        /// <summary>
        /// Könyv típusa: "BOOK" | "AUDIOBOOK" | "EBOOK"
        /// </summary>
        public string Type { get; set; } = null!;

        public string? Author { get; set; }
    }
}
