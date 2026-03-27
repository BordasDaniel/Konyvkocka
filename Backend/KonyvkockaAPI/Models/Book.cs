using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Book
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public int Released { get; set; }

    public int PageNum { get; set; }

    public decimal Rating { get; set; }

    public string Description { get; set; } = null!;

    public string CoverApiName { get; set; } = null!;

    public int? AgeRatingId { get; set; }

    /// <summary>
    /// Könyv típusa: "BOOK" | "AUDIOBOOK" | "EBOOK"
    /// </summary>
    public string Type { get; set; } = null!;

    public string? PdfUrl { get; set; }

    public string? AudioUrl { get; set; }

    public string? EpubUrl { get; set; }

    public int? AudioLength { get; set; }

    public int RewardXp { get; set; }

    public int RewardPoints { get; set; }

    public string? NarratorName { get; set; }

    public bool IsOfflineAvailable { get; set; }

    public string? OriginalLanguage { get; set; }

    public virtual AgeRating? AgeRating { get; set; }

    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();

    public virtual ICollection<UserBook> UserBooks { get; set; } = new List<UserBook>();
}
