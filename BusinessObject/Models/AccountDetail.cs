using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models;

public partial class AccountDetail
{
    [Key]
    public string AccountId { get; set; } = null!;

    public string? Email { get; set; }

    public string? Avatar { get; set; }

    public string? Name { get; set; }

    public virtual Account Account { get; set; } = null!;
}
