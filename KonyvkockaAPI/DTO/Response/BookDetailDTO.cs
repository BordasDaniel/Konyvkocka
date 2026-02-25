namespace KonyvkockaAPI.DTO.Response
{
    public class BookDetailDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// Tartalom típusa: "book" | "audiobook" | "ebook"
        /// </summary>
        public string Type { get; set; } = "book";

        public string Title { get; set; } = null!;
        public int Year { get; set; }
        public decimal Rating { get; set; }
        public string Description { get; set; } = null!;

        /// <summary>
        /// Borítókép API neve (CoverApiName)
        /// </summary>
        public string Img { get; set; } = null!;

        public int PageNum { get; set; }
        public int? AudioLength { get; set; }
        public string? NarratorName { get; set; }
        public string? OriginalLanguage { get; set; }
        public bool IsOfflineAvailable { get; set; }

        /// <summary>
        /// PDF/EPUB/Audio stream URL a könyv típusától függően
        /// </summary>
        public string? ReadUrl { get; set; }

        public AgeRatingDTO? AgeRating { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<AuthorDTO> Authors { get; set; } = new();
        public List<GenreDTO> Genres { get; set; } = new();

        /// <summary>
        /// null ha nincs bejelentkezve vagy a tartalom nincs a könyvtárban
        /// </summary>
        public UserLibrarySnapshotDTO? UserLibrary { get; set; }
    }
}
