using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Title
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string Rarity { get; set; } = null!;

    public virtual ICollection<Challenge> Challenges { get; set; } = new List<Challenge>();

    public virtual ICollection<UserTitle> UserTitles { get; set; } = new List<UserTitle>();
}
