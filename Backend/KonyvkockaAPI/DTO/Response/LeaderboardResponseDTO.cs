namespace KonyvkockaAPI.DTO.Response
{
    public class LeaderboardResponseDTO
    {
        public LeaderboardEntryDTO Me { get; set; } = null!;
        public List<LeaderboardEntryDTO> Entries { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}