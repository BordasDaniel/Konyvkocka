public class LibraryItemDTO
{
    public string Type { get; set; } // könyv, film, sorozat
    public int Id { get; set; }
    public string Title { get; set; }
    public string Img { get; set; }
    public int? Year { get; set; }
    public decimal? Rating { get; set; }
    public string Desc { get; set; }
    public int? Pages { get; set; }
    public int? Length { get; set; }
    public string BookType { get; set; }
    public string Reader { get; set; }
    public string Trailer { get; set; }
    public string Status { get; set; } // olvasás, befejezett, jelenleg nézett stb.
    public bool Favorite { get; set; }
    public decimal? UserRating { get; set; }
    public DateTime? AddedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? CurrentPage { get; set; }
    public int? CurrentPosition { get; set; }
    public int? CurrentSeason { get; set; }
    public int? CurrentEpisode { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
}
