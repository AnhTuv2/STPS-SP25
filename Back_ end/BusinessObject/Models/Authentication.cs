using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Authentication
{
    public int AuthenticationId { get; set; }

    public string AuthenticationName { get; set; } = null!;

    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
}
