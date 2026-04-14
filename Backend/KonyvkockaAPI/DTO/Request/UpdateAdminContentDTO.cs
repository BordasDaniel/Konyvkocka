namespace KonyvkockaAPI.DTO.Request
{
    public class UpdateAdminContentDTO
    {
        public string Title { get; set; } = string.Empty;
        public int Released { get; set; }
        public decimal Rating { get; set; }
        public string Description { get; set; } = string.Empty;
        public int? AgeRatingId { get; set; }
        public string? TrailerUrl { get; set; }
        public int RewardXP { get; set; }
        public int RewardPoints { get; set; }
        public bool HasSubtitles { get; set; }
        public bool IsOriginalLanguage { get; set; }
        public bool IsOfflineAvailable { get; set; }
        public string CoverOrPosterApiName { get; set; } = string.Empty;
        public int? PageNum { get; set; }
        public string? BookType { get; set; }
        public string? PdfUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? EpubUrl { get; set; }
        public int? AudioLength { get; set; }
        public string? NarratorName { get; set; }
        public string? OriginalLanguage { get; set; }
        public string? StreamUrl { get; set; }
        public int? Length { get; set; }
        public List<int> TagIds { get; set; } = new();
    }
}
