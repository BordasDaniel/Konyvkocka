using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Purchase
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? Price { get; set; }

    public string Tier { get; set; } = null!;

    public string? PurchaseStatus { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
