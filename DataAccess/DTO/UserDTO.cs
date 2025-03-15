using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DTO
{
    public class UserDTO
    {
        public string? UserId { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Name { get; set; }

        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }

}
