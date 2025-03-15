using BusinessObject.Models;
using DataAccess.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
//using Repositories.Implements;
using Repositories.Service;

namespace STPS_API.Controllers.Authentication
{
    [Route("api/[controller]")]
    [ApiController]
    public class SendMailAPI : ControllerBase
    {
        private readonly MailService _mailService;
        private readonly IConfiguration _configuration;
        private readonly StpsContext _context;
        // Giả sử bạn có một nơi lưu trữ mã OTP và thời gian hết hạn cho người dùng (có thể là DB hoặc bộ nhớ tạm)
        private static string storedOtp = "";
        private static DateTime otpExpiration;

        public SendMailAPI(MailService mailService, IConfiguration configuration, StpsContext context)
        {
            _mailService = mailService;
            _configuration = configuration;
            _context = context;
        }
        [HttpPost("sendOtpToEmail")]
        public async Task<IActionResult> SendOtpToEmail([FromBody] MailDto mail)
        {
            TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            DateTime utcNow = DateTime.UtcNow;
            DateTime vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, vietnamTimeZone);
            otpExpiration = vietnamTime.AddMinutes(3); // OTP hết hạn sau 3 phút

            if (string.IsNullOrEmpty(mail.RecipientEmail))
            {
                return BadRequest(new { message = "Email is required" });
            }

            var userDetail = await _context.AccountDetails.FirstOrDefaultAsync(u => u.Email == mail.RecipientEmail);
            if (userDetail == null)
            {
                return NotFound(new { message = "Email not registered" });
            }

            // Tìm tài khoản tương ứng trong bảng Account
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == userDetail.AccountId);
            if (account == null)
            {
                return NotFound(new { message = "Account not found" });
            }

            // Tạo mật khẩu ngẫu nhiên
            string newPassword = GenerateRandomPassword(8);

            // Mã hóa mật khẩu trước khi lưu vào DB
            string hashedPassword = HashPassword(newPassword)[..30];

            // Cập nhật mật khẩu trong DB
            account.Password = hashedPassword;
            await _context.SaveChangesAsync();

            // Gửi mật khẩu qua email
            string subject = "Mật khẩu mới của bạn";
            string body = $"Mật khẩu mới của bạn là: {newPassword}. Hãy đăng nhập và đổi mật khẩu ngay.";
            bool emailSent = await _mailService.SendMailAsync(mail.RecipientEmail, subject, body);

            if (emailSent)
            {
                return Ok(new { message = "New password sent successfully" });
            }

            return StatusCode(500, "Failed to send new password");
        }
        // Hàm tạo mật khẩu ngẫu nhiên gồm 8 ký tự
        private string GenerateRandomPassword(int length)
        {
            const string validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            Random random = new Random();
            return new string(Enumerable.Repeat(validChars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // Hàm mã hóa mật khẩu
        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

    }
}

