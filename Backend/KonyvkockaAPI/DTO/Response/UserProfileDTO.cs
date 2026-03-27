namespace KonyvkockaAPI.DTO.Response
{
    public class UserProfileDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Avatar { get; set; }
        public string CountryCode { get; set; } = null!;
        public int Level { get; set; }
        public int Xp { get; set; }
        public bool IsSubscriber { get; set; }
        public DateTime? PremiumExpiresAt { get; set; }
        public string PermissionLevel { get; set; } = "USER";
        public string Email { get; set; } = null!;
        public DateTime CreationDate { get; set; }
        public DateTime LastLoginDate { get; set; }

        /// <summary>
        /// Az éppen aktív rangcím neve (IsActive = true), null ha nincs aktív
        /// </summary>
        public string? ActiveTitle { get; set; }

        public UserStatsDTO Stats { get; set; } = null!;
        public List<UserBadgeDTO> Badges { get; set; } = new();
        public List<UserTitleDTO> Titles { get; set; } = new();
    }

    public class UserBadgeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string? IconUrl { get; set; }

        /// <summary>
        /// Kategória: "EVENT" | "STREAK" | "READING" | "WATCHING" | "SOCIAL" | "SPECIAL"
        /// </summary>
        public string Category { get; set; } = null!;

        /// <summary>
        /// Ritkaság: "COMMON" | "RARE" | "EPIC" | "LEGENDARY"
        /// </summary>
        public string Rarity { get; set; } = null!;

        public DateTime EarnedAt { get; set; }
    }

    public class UserTitleDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        /// <summary>
        /// Ritkaság: "COMMON" | "RARE" | "EPIC" | "LEGENDARY"
        /// </summary>
        public string Rarity { get; set; } = null!;

        public DateTime EarnedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
