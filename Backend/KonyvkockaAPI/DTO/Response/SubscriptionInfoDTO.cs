namespace KonyvkockaAPI.DTO.Response
{
    public class SubscriptionInfoDTO
    {
        /// <summary>
        /// "free" | "premium"
        /// </summary>
        public string Type { get; set; } = "free";

        public string Name { get; set; } = null!;

        public DateTime? ExpiresAt { get; set; }
    }

    public class PurchaseItemDTO
    {
        public int Id { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public int? Price { get; set; }
        public string Tier { get; set; } = null!;

        /// <summary>
        /// Vásárlás státusza: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
        /// </summary>
        public string? PurchaseStatus { get; set; }
    }
}
