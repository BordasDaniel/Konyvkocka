namespace KonyvkockaAPI.DTO.Response
{
    public class UserStatsDTO
    {
        public int ReadTimeMin { get; set; }
        public int WatchTimeMin { get; set; }
        public int BooksCompleted { get; set; }
        public int MoviesWatched { get; set; }
        public int SeriesWatched { get; set; }
        public int DayStreak { get; set; }
    }
}
