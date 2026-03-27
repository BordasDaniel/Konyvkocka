namespace KonyvkockaAPI.DTO.Response
{
    /// <summary>
    /// Keresési válasz – egységes HomeCardDTO lista lapozással
    /// </summary>
    public class SearchResponseDTO
    {
        public int Total { get; set; }
        public int Limit { get; set; }
        public int Offset { get; set; }
        public List<HomeCardDTO> Items { get; set; } = new();
    }
}
