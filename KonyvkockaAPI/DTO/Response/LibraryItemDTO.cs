namespace KonyvkockaAPI.DTO.Response
{
    public class LibraryItemDTO
    {
        // --- Azonosítók ---
        public int Id { get; set; }

        /// <summary>
        /// Tartalom típusa: "BOOK", "AUDIOBOOK", "EBOOK", "MOVIE", "SERIES"
        /// </summary>
        public string ContentType { get; set; } = null!;

        // --- Tartalom adatok ---
        public string Title { get; set; } = null!;
        public string Cover { get; set; } = null!;
        public int? Year { get; set; }
        public decimal? Rating { get; set; }

        public AgeRatingDTO? AgeRating { get; set; }

        public List<string> Tags { get; set; } = new();

        // --- User könyvtár adatok ---

        /// <summary>
        /// Státusz: "WATCHING", "COMPLETED", "PAUSED", "DROPPED", "PLANNED", "ARCHIVED"
        /// </summary>
        public string? Status { get; set; }
        public bool Favorite { get; set; }
        public decimal? UserRating { get; set; }
        public DateTime? AddedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? LastSeen { get; set; }

        // --- Előrehaladás ---
        public int? CurrentPage { get; set; }
        public int? CurrentAudioPosition { get; set; }
        public int? CurrentPosition { get; set; }   // film
        public int? CurrentSeason { get; set; }     // sorozat
        public int? CurrentEpisode { get; set; }    // sorozat
    }
}
