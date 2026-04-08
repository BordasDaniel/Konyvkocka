namespace KonyvkockaAPI.DTO.Response
{
    /// <summary>
    /// Publikus profil válasz – GET /api/user/{userId}/profile
    /// </summary>
    public class ProfileResponseDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Avatar { get; set; }
        public string? CountryCode { get; set; }
        public string? Email { get; set; }
        public bool IsSubscriber { get; set; }
        public DateTime? PremiumExpiresAt { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime LastLoginDate { get; set; }
        public int Xp { get; set; }
        public int Level { get; set; }
        public int DayStreak { get; set; }
        public int BookPoints { get; set; }
        public int SeriesPoints { get; set; }
        public int MoviePoints { get; set; }

        /// <summary>
        /// Jelenleg aktív rangcímek (null ha nincs beállítva)
        /// </summary>
        public List<string> ActiveTitles { get; set; } = new();

        /// <summary>
        /// "All" fül statisztikák
        /// </summary>
        public ProfileTabAllDTO All { get; set; } = null!;

        /// <summary>
        /// "Media" fül statisztikák (film + sorozat)
        /// </summary>
        public ProfileTabMediaDTO Media { get; set; } = null!;

        /// <summary>
        /// "Books" fül statisztikák
        /// </summary>
        public ProfileTabBooksDTO Books { get; set; } = null!;
    }

    public class ProfileTabAllDTO
    {
        public int? GlobalRank { get; set; }
        public int? CountryRank { get; set; }
        public int Points { get; set; }
        public int TimeMin { get; set; }
        public double CompletionRate { get; set; }
        public int BooksCompleted { get; set; }
        public int MediaCompleted { get; set; }
        public int DayStreak { get; set; }
    }

    public class ProfileTabMediaDTO
    {
        public int? GlobalRank { get; set; }
        public int? CountryRank { get; set; }
        public int Points { get; set; }
        public int WatchTimeMin { get; set; }
        public double CompletionRate { get; set; }
        public int Completed { get; set; }
        public int Total { get; set; }
    }

    public class ProfileTabBooksDTO
    {
        public int? GlobalRank { get; set; }
        public int? CountryRank { get; set; }
        public int Points { get; set; }
        public int ReadTimeMin { get; set; }
        public double CompletionRate { get; set; }
        public int Completed { get; set; }
        public int Total { get; set; }
    }
}
