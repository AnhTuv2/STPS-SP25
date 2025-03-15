using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BusinessObject.Models;

public partial class AccountDetail
{
    [Key]
    public string AccountId { get; set; } = null!;

    public string? Email { get; set; }

    public string? Avatar { get; set; }

    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Address { get; set; }
    [ForeignKey("AccountID")]
    [JsonIgnore] // Bỏ qua thuộc tính này khi serialize
    
    public virtual Account Account { get; set; } = null!;
}
