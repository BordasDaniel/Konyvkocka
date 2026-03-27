namespace KonyvkockaAPI.DTO.Response
{
    public class MovieDetailDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = "movie";
        public string Title { get; set; } = null!;
        public int Year { get; set; }
        public decimal Rating { get; set; }
        public string Description { get; set; } = null!;

        /// <summary>
        /// Poszter API neve (PosterApiName)
        /// </summary>
        public string Img { get; set; } = null!;

        public string StreamUrl { get; set; } = null!;
        public string? TrailerUrl { get; set; }

        /// <summary>
        /// Film hossza percben
        /// </summary>
        public int Length { get; set; }

        public bool HasSubtitles { get; set; }
        public bool IsOriginalLanguage { get; set; }
        public bool IsOfflineAvailable { get; set; }

        public AgeRatingDTO? AgeRating { get; set; }
        public List<string> Tags { get; set; } = new();

        /// <summary>
        /// null ha nincs bejelentkezve vagy a tartalom nincs a könyvtárban
        /// </summary>
        public UserLibrarySnapshotDTO? UserLibrary { get; set; }
    }
}
