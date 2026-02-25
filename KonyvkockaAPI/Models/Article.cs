using System;

namespace KonyvkockaAPI.Models;

public partial class Article
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string EventTag { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string? ImageUrl { get; set; }
}
