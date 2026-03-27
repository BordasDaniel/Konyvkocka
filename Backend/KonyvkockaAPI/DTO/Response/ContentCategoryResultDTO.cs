namespace KonyvkockaAPI.DTO.Response
{
    public class ContentCategoryResultDTO
    {
        public string Category { get; set; }
        public List<object> Items { get; set; }
        public int Total { get; set; }
    }
}
