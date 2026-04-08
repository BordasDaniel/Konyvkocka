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

        [Required]
        public string LastName { get; set; } = null!;

        [Required]
        public string FirstName { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string BillingEmail { get; set; } = null!;

        public string? Phone { get; set; }

        [Required]
        public string Country { get; set; } = null!;

        [Required]
        public string Zip { get; set; } = null!;

        [Required]
        public string City { get; set; } = null!;

        [Required]
        public string Address { get; set; } = null!;
    }
}
