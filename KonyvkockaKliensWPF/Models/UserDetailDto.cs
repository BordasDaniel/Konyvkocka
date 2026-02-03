namespace KonyvkockaKliensWPF.Models
{
    /// <summary>
    /// Teljes felhasználó DTO a módosításhoz és részletes megjelenítéshez
    /// </summary>
    public class UserDetailDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
        public string? CountryCode { get; set; }
        public bool IsSubscriber { get; set; }
        public string? CreationDate { get; set; }
        public string? LastLoginDate { get; set; }
        public int Level { get; set; }
        public int BookPoints { get; set; }
        public int SeriesPoints { get; set; }
        public int MoviePoints { get; set; }
        public int DayStreak { get; set; }
        public int ReadTimeMin { get; set; }
        public int WatchTimeMin { get; set; }
    }
}
