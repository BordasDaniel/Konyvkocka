namespace KonyvkockaAPI.DTO.Response
{
    public class SubscriptionInfoDTO
    {
        public string Type { get; set; }
        public string Name { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool AutoRenew { get; set; }
        public string Price { get; set; }
        public string Message { get; set; }
    }

}
