namespace KonyvkockaAPI.DTO.Response
{
    public class UserStatisticsDTO
    {
        public int BookPoints { get; set; }
        public int SeriesPoints { get; set; }
        public int MoviePoints { get; set; }
        public int TotalPoints { get; set; }
        public int Level { get; set; }
        public int Xp { get; set; }
        public int DayStreak { get; set; }
        public int ReadTimeMin { get; set; }
        public int WatchTimeMin { get; set; }
        public int BooksCompleted { get; set; }
        public int MoviesCompleted { get; set; }
        public int SeriesCompleted { get; set; }

        /// <summary>
        /// Globális összesített helyezés (user_rank_cache, óránként frissítve)
        /// null ha még nem számolódott ki
        /// </summary>
        public int? GlobalRank { get; set; }

        /// <summary>
        /// Országon belüli összesített helyezés
        /// </summary>
        public int? CountryRank { get; set; }

        /// <summary>
        /// Globális könyv pontszám szerinti helyezés
        /// </summary>
        public int? GlobalBookRank { get; set; }

        /// <summary>
        /// Globális média (film+sorozat) pontszám szerinti helyezés
        /// </summary>
        public int? GlobalMediaRank { get; set; }
    }
}
