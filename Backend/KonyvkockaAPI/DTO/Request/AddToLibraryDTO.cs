using System.ComponentModel.DataAnnotations;

namespace KonyvkockaAPI.DTO.Request
{
    public class AddToLibraryDTO
    {
        /// <summary>
        /// Tartalom típusa: "book", "movie", "series"
        /// </summary>
        [Required]
        public string Type { get; set; } = null!;

        /// <summary>
        /// A tartalom azonosítója (book.Id / movie.Id / series.Id)
        /// </summary>
        [Required]
        public int ContentId { get; set; }

        /// <summary>
        /// Opcionális kezdeti státusz.
        /// Lehetséges értékek: "WATCHING", "COMPLETED", "PAUSED", "DROPPED", "PLANNED", "ARCHIVED"
        /// Ha nincs megadva, akkor üres (NULL) marad.
        /// </summary>
        public string? Status { get; set; }
    }
}