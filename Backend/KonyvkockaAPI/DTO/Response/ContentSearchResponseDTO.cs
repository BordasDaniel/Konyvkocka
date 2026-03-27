namespace KonyvkockaAPI.DTO.Response
{
    public class ContentSearchResponseDTO
    {
        public int Total { get; set; }
        public int Limit { get; set; }
        public int Offset { get; set; }

        /// <summary>
        /// Könyv találatok (type=all vagy type=book esetén)
        /// </summary>
        public List<ContentSearchItemDTO> Books { get; set; } = new();

        /// <summary>
        /// Film találatok (type=all vagy type=movie esetén)
        /// </summary>
        public List<ContentSearchItemDTO> Movies { get; set; } = new();

        /// <summary>
        /// Sorozat találatok (type=all vagy type=series esetén)
        /// </summary>
        public List<ContentSearchItemDTO> Series { get; set; } = new();
    }

    /// <summary>
    /// Egységes keresési találat elem – könyv, film és sorozat egyaránt
    /// </summary>
    public class ContentSearchItemDTO
    {
        public int Id { get; set; }

        /// <summary>
        /// "book" | "audiobook" | "ebook" | "movie" | "series"
        /// </summary>
        public string Type { get; set; } = null!;

        public string Title { get; set; } = null!;

        /// <summary>
        /// Borítókép / poszter API neve
        /// </summary>
        public string Img { get; set; } = null!;

        public int Year { get; set; }
        public decimal Rating { get; set; }
        public AgeRatingDTO? AgeRating { get; set; }
        public List<string> Genres { get; set; } = new();

        /// <summary>
        /// Szerzők / rendezők nevei
        /// </summary>
        public List<string> Authors { get; set; } = new();

        /// <summary>
        /// Könyv: oldal szám | Audiobook: perc | Film: perc | Sorozat: epizód szám
        /// </summary>
        public int? Length { get; set; }
    }
}
