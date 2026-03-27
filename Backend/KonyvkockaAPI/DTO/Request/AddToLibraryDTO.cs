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
        /// Kezdeti státusz: "WATCHING", "PLANNED"
        /// Alapértelmezett: "PLANNED"
        /// </summary>
        public string Status { get; set; } = "PLANNED";
    }
}