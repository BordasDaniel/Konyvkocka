namespace KonyvkockaAPI.DTO.Response
{
    public class SeriesDetailDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = "series";
        public string Title { get; set; }
        public int Year { get; set; }
        public decimal Rating { get; set; }
        public string Desc { get; set; }
        public string Img { get; set; }
        public string Trailer { get; set; }
        public bool HasSubtitles { get; set; }
        public bool IsOriginalLanguage { get; set; }
        public bool IsOfflineAvailable { get; set; }
        public object AgeRating { get; set; }
        public List<string> Tags { get; set; }
        public List<object> Authors { get; set; }
        public List<EpisodeDTO> Episodes { get; set; }
        public int TotalSeasons { get; set; }
        public int TotalEpisodes { get; set; }
        public object UserLibrary { get; set; }
    }
}
