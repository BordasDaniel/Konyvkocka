namespace KonyvkockaAPI.DTO.Response
{
    /// <summary>
    /// Legutóbb megtekintett / kedvenc tartalom elem
    /// </summary>
    public class RecentFavoriteItemDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// "book" | "audiobook" | "ebook" | "movie" | "series"
        /// </summary>
        public string Type { get; set; } = null!;

        public string Title { get; set; } = null!;

        /// <summary>
        /// Borítókép / poszter API neve
        /// </summary>
        public string Img { get; set; } = null!;

        /// <summary>
        /// RewardPoints értéke
        /// </summary>
        public int Points { get; set; }

        /// <summary>
        /// User könyvtár státusza: "WATCHING" | "COMPLETED" | "PAUSED" | "DROPPED" | "PLANNED" | "ARCHIVED"
        /// </summary>
        public string? Status { get; set; }
    }
}
