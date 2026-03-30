using System.ComponentModel.DataAnnotations;

namespace KonyvkockaAPI.DTO.Request
{
    public class CreatePurchaseDTO
    {
        /// <summary>
        /// Előfizetési szint: "ONE_M" | "QUARTER_Y" | "FULL_Y"
        /// </summary>
        [Required]
        public string Tier { get; set; } = null!;
    }
}
