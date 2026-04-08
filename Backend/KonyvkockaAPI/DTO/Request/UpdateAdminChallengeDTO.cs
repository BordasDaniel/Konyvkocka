namespace KonyvkockaAPI.DTO.Request
{
    public class UpdateAdminChallengeDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int TargetValue { get; set; }
        public int RewardXP { get; set; }
        public int? RewardBadgeId { get; set; }
        public int? RewardTitleId { get; set; }
        public string Difficulty { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsRepeatable { get; set; }
    }
}
