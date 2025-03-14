using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Location
{
    public string LocationId { get; set; } = null!;

    public string TypeId { get; set; } = null!;

    public string LocationName { get; set; } = null!;

    public double? Price { get; set; }

    public virtual LocationType Type { get; set; } = null!;
}
