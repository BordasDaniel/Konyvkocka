using System;
using System.Collections.Generic;

namespace KonyvkockaAPI.Models;

public partial class Mail
{
    public int Id { get; set; }

    public int ReceiverId { get; set; }

    /// <summary>
    /// Küldő ID – alapértelmezetten 1 (rendszer) a DB-ben
    /// </summary>
    public int SenderId { get; set; }

    /// <summary>
    /// Típus: "SYSTEM" | "FRIEND" | "CHALLENGE" | "PURCHASE"
    /// </summary>
    public string Type { get; set; } = null!;

    public string Subject { get; set; } = null!;

    public string Message { get; set; } = null!;

    public bool? IsRead { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User Receiver { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
