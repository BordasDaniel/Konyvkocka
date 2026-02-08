using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class UserMovie
{
    public int UserId { get; set; }

    public int MovieId { get; set; }

    public string? Status { get; set; }

    public bool Favorite { get; set; }

    public decimal? Rating { get; set; }

    public DateTime? AddedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public int RemainingCompletions { get; set; }

    public DateTime? LastSeen { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? CurrentPosition { get; set; }

    public virtual Movie Movie { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
