namespace KonyvkockaAPI.DTO.Request
{
    public class UpdateAdminUserDTO
    {
        public string PermissionLevel { get; set; } = string.Empty;
        public bool Premium { get; set; }
        public DateTime? PremiumExpiresAt { get; set; }
        public int Level { get; set; }
        public int Xp { get; set; }
        public string? CountryCode { get; set; }
        public int DayStreak { get; set; }
        public int ReadTimeMin { get; set; }
        public int WatchTimeMin { get; set; }
        public int BookPoints { get; set; }
        public int SeriesPoints { get; set; }
        public int MoviePoints { get; set; }
    }
}
