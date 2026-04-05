namespace KonyvkockaAPI.DTO.Response
{
    public class AdminOverviewStatDTO
    {
        public string Label { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Change { get; set; } = string.Empty;
        public string ChangeType { get; set; } = "neutral";
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public class AdminOverviewActivityDTO
    {
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class AdminOverviewDTO
    {
        public List<AdminOverviewStatDTO> Stats { get; set; } = new();
        public List<AdminOverviewActivityDTO> Activities { get; set; } = new();
    }

    public class AdminPurchaseItemDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime? PurchaseDate { get; set; }
        public int? Price { get; set; }
        public string Tier { get; set; } = null!;
        public string? PurchaseStatus { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class AdminUserItemDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
        public string PermissionLevel { get; set; } = "USER";
        public bool Premium { get; set; }
        public DateTime? PremiumExpiresAt { get; set; }
        public int Level { get; set; }
        public int Xp { get; set; }
        public string CountryCode { get; set; } = null!;
        public DateTime CreationDate { get; set; }
        public DateTime LastLoginDate { get; set; }
        public int DayStreak { get; set; }
        public int ReadTimeMin { get; set; }
        public int WatchTimeMin { get; set; }
        public int BookPoints { get; set; }
        public int SeriesPoints { get; set; }
        public int MoviePoints { get; set; }
    }

    public class AdminContentItemDTO
    {
        public int Id { get; set; }
        public string ContentType { get; set; } = null!;
        public string Title { get; set; } = null!;
        public int Released { get; set; }
        public decimal Rating { get; set; }
        public string Description { get; set; } = null!;
        public int? AgeRatingId { get; set; }
        public string? TrailerUrl { get; set; }
        public int RewardXP { get; set; }
        public int RewardPoints { get; set; }
        public bool HasSubtitles { get; set; }
        public bool IsOriginalLanguage { get; set; }
        public bool IsOfflineAvailable { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CoverOrPosterApiName { get; set; } = null!;
        public int? PageNum { get; set; }
        public string? BookType { get; set; }
        public string? PdfUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? EpubUrl { get; set; }
        public int? AudioLength { get; set; }
        public string? NarratorName { get; set; }
        public string? OriginalLanguage { get; set; }
        public string? StreamUrl { get; set; }
        public int? Length { get; set; }
        public List<int> TagIds { get; set; } = new();
    }

    public class AdminContentSummaryDTO
    {
        public int Total { get; set; }
        public int Books { get; set; }
        public int Series { get; set; }
        public int Movies { get; set; }
    }

    public class AdminContentTagOptionDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }

    public class AdminAgeRatingOptionDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int MinAge { get; set; }
    }

    public class AdminContentOptionsDTO
    {
        public List<AdminContentTagOptionDTO> Tags { get; set; } = new();
        public List<AdminAgeRatingOptionDTO> AgeRatings { get; set; } = new();
    }

    public class AdminNewsItemDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string EventTag { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class AdminNewsSummaryDTO
    {
        public int Total { get; set; }
        public int Updates { get; set; }
        public int Announcements { get; set; }
        public int Events { get; set; }
        public int Functions { get; set; }
    }

    public class AdminChallengeItemDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string? IconUrl { get; set; }
        public string Type { get; set; } = null!;
        public int TargetValue { get; set; }
        public int RewardXP { get; set; }
        public int? RewardBadgeId { get; set; }
        public int? RewardTitleId { get; set; }
        public string Difficulty { get; set; } = null!;
        public bool IsActive { get; set; }
        public bool IsRepeatable { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int Participants { get; set; }
        public int Completions { get; set; }
    }

    public class AdminChallengeSummaryDTO
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Repeatable { get; set; }
        public int Event { get; set; }
    }

    public class AdminChallengeBadgeOptionDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string Rarity { get; set; } = null!;
        public bool IsHidden { get; set; }
    }

    public class AdminChallengeTitleOptionDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string Rarity { get; set; } = null!;
    }

    public class AdminChallengeOptionsDTO
    {
        public List<AdminChallengeBadgeOptionDTO> Badges { get; set; } = new();
        public List<AdminChallengeTitleOptionDTO> Titles { get; set; } = new();
    }
}
