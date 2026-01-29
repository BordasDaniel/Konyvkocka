namespace KonyvkockaAPI.DTO.Response
{
    public class LeaderboardEntryDTO
    {
        public int Rank { get; set; }
        public string Username { get; set; }
        public string Avatar { get; set; }
        public string CountryFlag { get; set; }
        public string CountryCode { get; set; }
        public string Continent { get; set; }
        public int Points { get; set; }
        public int BooksRead { get; set; }
        public int MediaWatched { get; set; }
        public int CompletionRate { get; set; }
        public int LongestStreak { get; set; }
        public int Level { get; set; }
        public bool IsSubscriber { get; set; }
        public DateTime JoinDate { get; set; }
    }
}
