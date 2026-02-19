namespace KonyvkockaAPI.DTO.Response
{
    public class LeaderboardEntryDTO
    {
        public int Rank { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Avatar { get; set; } = null!;
        public string CountryCode { get; set; } = null!;
        public bool IsPremium { get; set; }
        public int Points { get; set; }
        public int BookCount { get; set; }
        public int MediaCount { get; set; }
        public double CompletionPct { get; set; }
        public int Level { get; set; }
        public int DayStreak { get; set; }
    }
}