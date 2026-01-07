using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class UserBook
{
    public int UserId { get; set; }

    public int BookId { get; set; }

    public string? Status { get; set; }

    public bool Favorite { get; set; }

    public bool IsRead { get; set; }

    public decimal? Rating { get; set; }

    public DateTime? AddedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? LastSeen { get; set; }

    public int? CurrentPage { get; set; }

    public int? CurrentAudioPosition { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
