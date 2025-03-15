using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DTO
{
    public class RegisterDto
    {
        public string Username { get; set; } = null!;
        public int AuId { get; set; }
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!; // Thêm Email vào DTO
    }
}

