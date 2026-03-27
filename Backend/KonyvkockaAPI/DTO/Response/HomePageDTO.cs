namespace KonyvkockaAPI.DTO.Response
{
    /// <summary>
    /// Főoldal teljes válasz – friss, felkapott kártyák és carousel
    /// </summary>
    public class HomePageResponseDTO
    {
        /// <summary>
        /// Friss tartalmak (3 db, legújabb kiadási év szerint, vegyes típus)
        /// </summary>
        public List<HomeCardDTO> Fresh { get; set; } = new();

        /// <summary>
        /// Felkapott tartalmak (3 db, "Népszerű" tag, legújabb)
        /// </summary>
        public List<HomeCardDTO> Hot { get; set; } = new();

        /// <summary>
        /// Carousel tartalmak (6 db, "Bestseller" tag, legújabb)
        /// </summary>
        public List<HomeCarouselDTO> Carousel { get; set; } = new();
    }

    /// <summary>
    /// Sima kártya DTO – friss/felkapott szekciókhoz
    /// 2 tag, cím, kép, értékelés, kiadási év
    /// </summary>
    public class HomeCardDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// "book" | "audiobook" | "ebook" | "movie" | "series"
        /// </summary>
        public string Type { get; set; } = null!;

        public string Title { get; set; } = null!;
        public string Img { get; set; } = null!;
        public int Year { get; set; }
        public decimal Rating { get; set; }

        public AgeRatingDTO? AgeRating { get; set; }

        /// <summary>
        /// Maximum 2 tag neve
        /// </summary>
        public List<string> Tags { get; set; } = new();
    }

    /// <summary>
    /// Carousel kártya DTO – bestseller szekció
    /// 2 tag, cím, leírás, kép, kiadási év (értékelés nélkül)
    /// </summary>
    public class HomeCarouselDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// "book" | "audiobook" | "ebook" | "movie" | "series"
        /// </summary>
        public string Type { get; set; } = null!;

        public string Title { get; set; } = null!;
        public string Img { get; set; } = null!;
        public int Year { get; set; }
        public string Description { get; set; } = null!;

        /// <summary>
        /// Maximum 2 tag neve
        /// </summary>
        public List<string> Tags { get; set; } = new();
    }

    /// <summary>
    /// Modal DTO – kattintásra megjelenő részletes nézet
    /// </summary>
    public class HomeModalDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// "book" | "audiobook" | "ebook" | "movie" | "series"
        /// </summary>
        public string Type { get; set; } = null!;

        public string Title { get; set; } = null!;
        public string Img { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Rating { get; set; }

        /// <summary>
        /// Trailer URL – könyv esetén null
        /// </summary>
        public string? TrailerUrl { get; set; }

        public AgeRatingDTO? AgeRating { get; set; }

        /// <summary>
        /// Összes tag neve
        /// </summary>
        public List<string> Tags { get; set; } = new();

        /// <summary>
        /// Megtekintés/olvasás URL
        /// Könyv: PdfUrl/EpubUrl/AudioUrl | Film: StreamUrl | Sorozat: null (Episodes-ban vannak)
        /// </summary>
        public string? WatchUrl { get; set; }

        /// <summary>
        /// Sorozat epizódjai – könyv/film esetén null
        /// </summary>
        public List<EpisodeDTO>? Episodes { get; set; }
    }
}
