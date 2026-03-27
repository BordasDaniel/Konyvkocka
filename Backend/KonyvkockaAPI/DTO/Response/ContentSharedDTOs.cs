namespace KonyvkockaAPI.DTO.Response
{
    /// <summary>
    /// Szerző / rendező DTO
    /// </summary>
    public class AuthorDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }

    /// <summary>
    /// Felhasználó könyvtár-bejegyzés összefoglaló – tartalom detail válaszokban
    /// null ha a tartalom nincs a user könyvtárában
    /// </summary>
    public class UserLibrarySnapshotDTO
    {
        public string Status { get; set; } = null!;
        public bool Favorite { get; set; }
        public decimal? Rating { get; set; }
        public DateTime? AddedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Könyv specifikus
        public int? CurrentPage { get; set; }
        public int? CurrentAudioPosition { get; set; }

        // Film/sorozat specifikus
        public int? CurrentPosition { get; set; }
        public int? CurrentSeason { get; set; }
        public int? CurrentEpisode { get; set; }
    }
}
