using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TourFeedback
{
    public string FeedbackId { get; set; } = null!;

    public string AccountId { get; set; } = null!;

    public string TourId { get; set; } = null!;

    public int? Rating { get; set; }

    public string? FeedbackDetail { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Tour Tour { get; set; } = null!;
}
