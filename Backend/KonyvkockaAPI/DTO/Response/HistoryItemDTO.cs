namespace KonyvkockaAPI.DTO.Response
{
    public class HistoryItemDTO
    {
        public string ContentType { get; set; } = string.Empty;
        public int ContentId { get; set; }
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Szerző neve – csak könyveknél töltött
        /// </summary>
        public string? Author { get; set; }

        /// <summary>
        /// Borítókép API neve – könyveknél
        /// </summary>
        public string? Cover { get; set; }

        /// <summary>
        /// Poszter API neve – film és sorozatoknál
        /// </summary>
        public string? Poster { get; set; }

        /// <summary>
        /// Státusz: WATCHING | COMPLETED | PAUSED | DROPPED | PLANNED | ARCHIVED
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Haladás: könyv=aktuális oldal, sorozat=aktuális epizód, film=lejátszási pozíció percben
        /// </summary>
        public int? Progress { get; set; }

        public decimal? Rating { get; set; }

        /// <summary>
        /// Utolsó megtekintés/olvasás időpontja (LastSeen a DB-ben)
        /// </summary>
        public DateTime? LastSeen { get; set; }

        public DateTime? AddedAt { get; set; }
    }
}
