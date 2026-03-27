namespace KonyvkockaAPI.DTO.Response
{
    public class SeriesDetailDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = "series";
        public string Title { get; set; } = null!;
        public int Year { get; set; }
        public decimal Rating { get; set; }
        public string Description { get; set; } = null!;

        /// <summary>
        /// Poszter API neve (PosterApiName)
        /// </summary>
        public string Img { get; set; } = null!;

        public string? TrailerUrl { get; set; }
        public bool HasSubtitles { get; set; }
        public bool IsOriginalLanguage { get; set; }
        public bool IsOfflineAvailable { get; set; }

        public int TotalSeasons { get; set; }
        public int TotalEpisodes { get; set; }

        public AgeRatingDTO? AgeRating { get; set; }
        public List<string> Tags { get; set; } = new();

        /// <summary>
        /// Epizódok szezon és epizódszám szerint rendezve
        /// </summary>
        public List<EpisodeDTO> Episodes { get; set; } = new();

        /// <summary>
        /// null ha nincs bejelentkezve vagy a tartalom nincs a könyvtárban
        /// </summary>
        public UserLibrarySnapshotDTO? UserLibrary { get; set; }
    }
}
