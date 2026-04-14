using System.ComponentModel.DataAnnotations;

namespace KonyvkockaAPI.DTO.Request
{
    public class RecordViewDTO
    {
        /// <summary>
        /// Tartalom típusa: "book", "movie", "series"
        /// </summary>
        [Required]
        public string ContentType { get; set; } = string.Empty;

        /// <summary>
        /// A tartalom azonosítója (book.Id / movie.Id / series.Id)
        /// </summary>
        [Required]
        public int ContentId { get; set; }
    }
}
