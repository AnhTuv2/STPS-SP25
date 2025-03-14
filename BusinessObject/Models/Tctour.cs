using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Tctour
{
    public string TourId { get; set; } = null!;

    public string TcId { get; set; } = null!;

    public double Price { get; set; }

    public virtual TourismCompany Tc { get; set; } = null!;

    public virtual Tour Tour { get; set; } = null!;
}
