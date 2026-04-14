namespace KonyvkockaAPI.DTO.Response
{
    /// <summary>
    /// Kitűzők listája kategóriánként csoportosítva – GET /api/user/{userId}/badges
    /// </summary>
    public class BadgeListResponseDTO
    {
        public List<BadgeCategoryGroupDTO> Categories { get; set; } = new();
    }

    public class BadgeCategoryGroupDTO
    {
        /// <summary>
        /// Kategória neve: "EVENT" | "STREAK" | "READING" | "WATCHING" | "SOCIAL" | "SPECIAL"
        /// </summary>
        public string Category { get; set; } = null!;

        public List<BadgeCardDTO> Badges { get; set; } = new();
    }

    /// <summary>
    /// Kitűző kártya – a listában jelenik meg
    /// </summary>
    public class BadgeCardDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; }
        public DateTime EarnedAt { get; set; }
    }

    /// <summary>
    /// Kitűző részletes nézet – modal – GET /api/user/{userId}/badges/{badgeId}
    /// </summary>
    public class BadgeDetailDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; }
        public string Category { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Rarity { get; set; } = null!;

        /// <summary>
        /// true = megszerezve, false = zárolt
        /// </summary>
        public bool IsEarned { get; set; }

        /// <summary>
        /// Megszerzés dátuma – null ha zárolt
        /// </summary>
        public DateTime? EarnedAt { get; set; }
    }
}
