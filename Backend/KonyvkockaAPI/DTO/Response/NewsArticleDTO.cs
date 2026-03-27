namespace KonyvkockaAPI.DTO.Response
{
    public class NewsArticleDTO
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Date { get; set; }
        public string Tags { get; set; }
        public string Excerpt { get; set; }
        public string Link { get; set; }
        public string LinkText { get; set; }
    }
}
