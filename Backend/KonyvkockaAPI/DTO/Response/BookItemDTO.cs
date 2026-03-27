namespace KonyvkockaAPI.DTO.Response
{
    public class BookItemDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Img { get; set; }
        public string Status { get; set; }
        public bool Favorite { get; set; }
        public decimal? Rating { get; set; }
        public DateTime? AddedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int CurrentPage { get; set; }
        public int Pages { get; set; }
        public string Type { get; set; }
    }
}
