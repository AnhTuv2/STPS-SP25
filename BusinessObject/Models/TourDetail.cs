using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TourDetail
{
    public string TourId { get; set; } = null!;

    public string LocationId { get; set; } = null!;

    public int Rollno { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public virtual Location Location { get; set; } = null!;

    public virtual Tour Tour { get; set; } = null!;
}
