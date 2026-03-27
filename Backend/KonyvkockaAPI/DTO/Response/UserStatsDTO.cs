namespace KonyvkockaAPI.DTO.Response
{
    public class UserStatsDTO
    {
        public int ReadTimeMin { get; set; }
        public int WatchTimeMin { get; set; }
        public int BooksCompleted { get; set; }
        public int MoviesCompleted { get; set; }
        public int SeriesCompleted { get; set; }
        public int DayStreak { get; set; }
        public int BookPoints { get; set; }
        public int SeriesPoints { get; set; }
        public int MoviePoints { get; set; }
        public int TotalPoints { get; set; }
    }
}
