namespace KonyvkockaAPI.DTO.Response
{
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
}
