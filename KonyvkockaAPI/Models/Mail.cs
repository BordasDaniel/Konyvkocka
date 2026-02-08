using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Mail
{
    public int Id { get; set; }

    public int ReceiverId { get; set; }

    public int SenderId { get; set; }

    public string Type { get; set; } = null!;

    public string Subject { get; set; } = null!;

    public string Message { get; set; } = null!;

    public bool? IsRead { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User Receiver { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
