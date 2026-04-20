namespace KonyvkockaKliensWPF.Models
{
    /// <summary>
    /// Felhasználó DTO az admin listázó végponthoz
    /// </summary>
    public class UserDto
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
        public string? CountryCode { get; set; }
        public DateTime LastLoginDate { get; set; }
        public int DayStreak { get; set; }
        public int ReadTimeMin { get; set; }
        public int WatchTimeMin { get; set; }
        public int BookPoints { get; set; }
        public int SeriesPoints { get; set; }
        public int MoviePoints { get; set; }
    }

    public class UpdateAdminUserRequestDto
    {
        public string PermissionLevel { get; set; } = "USER";
        public bool ResetProfilePicture { get; set; }
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
        public string? NewPasswordHash { get; set; }
        public string? NewPasswordSalt { get; set; }
    }

    public class UsersListResponseDto
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<UserDto> Users { get; set; } = new();
    }
}
