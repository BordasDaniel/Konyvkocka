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

        /// <summary>
        /// Book esetén a book.Type értéke: "BOOK", "AUDIOBOOK", "EBOOK"
        /// Movie/Series esetén null
        /// </summary>
        public string? BookType { get; set; }

        // --- Tartalom adatok ---
        public string Title { get; set; } = null!;
        public string Cover { get; set; } = null!;
        public int? Year { get; set; }
        public decimal? Rating { get; set; }
        public string? Description { get; set; }

        // --- Könyv-specifikus ---
        public int? Pages { get; set; }
        public int? AudioLength { get; set; }

        // --- Film/Sorozat-specifikus ---
        public int? Length { get; set; }
        public string? TrailerUrl { get; set; }
        public bool? HasSubtitles { get; set; }
        public bool? IsOriginalLanguage { get; set; }

        // --- Közös jelölők ---
        public bool IsOfflineAvailable { get; set; }

        public AgeRatingDTO? AgeRating { get; set; }

        public List<TagItemDTO> Tags { get; set; } = new();

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
