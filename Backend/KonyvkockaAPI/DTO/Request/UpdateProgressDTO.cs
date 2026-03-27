using System.ComponentModel.DataAnnotations;

namespace KonyvkockaAPI.DTO.Request
{
    public class UpdateProgressDTO
    {
        /// <summary>
        /// Tartalom típusa: "book", "movie", "series"
        /// </summary>
        [Required]
        public string Type { get; set; } = null!;

        // --- Könyv előrehaladás ---

        /// <summary>
        /// Aktuális oldal (BOOK / EBOOK esetén)
        /// </summary>
        public int? CurrentPage { get; set; }

        /// <summary>
        /// Hangoskönyv pozíció másodpercben (AUDIOBOOK esetén)
        /// </summary>
        public int? CurrentAudioPosition { get; set; }

        // --- Film előrehaladás ---

        /// <summary>
        /// Lejátszási pozíció másodpercben (movie esetén)
        /// </summary>
        public int? CurrentPosition { get; set; }

        // --- Sorozat előrehaladás ---

        /// <summary>
        /// Aktuális évad
        /// </summary>
        public int? CurrentSeason { get; set; }

        /// <summary>
        /// Aktuális epizód
        /// </summary>
        public int? CurrentEpisode { get; set; }

        /// <summary>
        /// Epizódon belüli pozíció másodpercben
        /// </summary>
        public int? CurrentEpisodePosition { get; set; }

        // --- Státusz frissítés ---

        /// <summary>
        /// Ha meg van adva, egyszerre frissíti a státuszt is.
        /// Pl. "COMPLETED" küldésekor a trigger automatikusan adja az XP-t és pontokat.
        /// Értékek: "WATCHING", "COMPLETED", "PAUSED", "DROPPED", "PLANNED", "ARCHIVED"
        /// </summary>
        public string? Status { get; set; }
    }
}
