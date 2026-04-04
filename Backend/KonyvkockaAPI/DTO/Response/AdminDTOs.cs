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
}
