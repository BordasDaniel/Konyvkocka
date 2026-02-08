using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class UserTitle
{
    public int UserId { get; set; }

    public int TitleId { get; set; }

    public DateTime EarnedAt { get; set; }

    public bool IsActive { get; set; }

    public virtual Title Title { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
