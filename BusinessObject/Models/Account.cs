using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace BusinessObject.Models;

public partial class Account
{
    public string AccountId { get; set; } = null!;

    public string Username { get; set; } = null!;

    public int AuId { get; set; }

    public string Password { get; set; } = null!;

    public bool Status { get; set; }
    [JsonIgnore] // Tránh lỗi vòng lặp JSON khi trả về response
    public virtual Authentication? Authentication { get; set; } 
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<TourFeedback> TourFeedbacks { get; set; } = new List<TourFeedback>();

    public virtual ICollection<TourismCompany> TourismCompanies { get; set; } = new List<TourismCompany>();
}
