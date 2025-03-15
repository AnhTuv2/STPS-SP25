using BusinessObject.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.Google;
using System.Globalization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Identity.Client;
using DataAccess.DTO;

namespace STPS_API.Controllers.Authentication
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthAPI : ControllerBase
    {
        private readonly StpsContext _context;
        private readonly IConfiguration _configuration;
        private string username;
        public AuthAPI(StpsContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Kiểm tra dữ liệu đầu vào
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra Username đã tồn tại chưa
            if (await _context.Accounts.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            // Kiểm tra Authentication ID (AuId) có tồn tại không
            var auth = await _context.Authentications.FindAsync(dto.AuId);
            if (auth == null)
            {
                return BadRequest(new { message = "Invalid Authentication ID" });
            }

            // Tạo AccountId mới
            var accountId = Guid.NewGuid().ToString("N");

            // Hash mật khẩu
            var hashedPassword = HashPassword(dto.Password);

            // Thêm vào bảng Account
            var account = new Account
            {
                AccountId = accountId,
                Username = dto.Username,
                AuId = dto.AuId,
                Password = hashedPassword,
                Status = true
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            // Thêm vào bảng AccountDetail
            var accountDetail = new AccountDetail
            {
                AccountId = accountId,
                Email = dto.Email // Lấy Email từ DTO
            };

            _context.AccountDetails.Add(accountDetail);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully" });
        }
        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Tìm tài khoản theo Username
            var user = await _context.Accounts.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Hash mật khẩu nhập vào để so sánh với database
            string hashedPassword = HashPassword(request.Password);
            if (user.Password != hashedPassword)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            return Ok(new
            {
                message = "Login successful",
                accountId = user.AccountId,
                username = user.Username,
                authId = user.AuId
            });
        }
        // login with google
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleResponse") // Where to redirect after Google login
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);  // This initiates the Google login process
        }

        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse()
        {
            ///add
            var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!authenticateResult.Succeeded)
            {
                return BadRequest("Google authentication failed.");
            }

            // Retrieve user info from the claims
            var email = authenticateResult.Principal.FindFirstValue(ClaimTypes.Email);
            var name = authenticateResult.Principal.FindFirstValue(ClaimTypes.Name);
            var avatarUrl = authenticateResult.Principal.FindFirstValue("picture"); // Use "picture" directly

            // If "picture" claim is not available, call Google API to fetch it
            if (string.IsNullOrEmpty(avatarUrl))
            {
                var accessToken = authenticateResult.Properties.GetTokenValue("access_token");
                avatarUrl = await GetGoogleProfilePicture(accessToken);
            }
            // Process the name to get 1 character from each word (except the last word) and combine with the last word
            if (!string.IsNullOrWhiteSpace(name))
            {
                var nameWithoutDiacritics = RemoveDiacritics(name); // Remove diacritics
                var nameParts = nameWithoutDiacritics.Trim().Split(' '); // Split the name into parts


                if (nameParts.Length > 1)
                {
                    var lastWord = nameParts.LastOrDefault()?.ToLower(); // Get the last word
                    var initials = string.Concat(nameParts.Take(nameParts.Length - 1)
                        .Select(part => part[0].ToString().ToLower())); // Get the first letter of each word (except last)
                    username = $"{lastWord}{initials}"; // Combine last word and initials
                }
                else
                {
                    username = nameWithoutDiacritics.ToLower(); // If only one word, use it as username
                }
            }
            
            // Check if user already exists in your database
            var user = await _context.AccountDetails.FirstOrDefaultAsync(u => u.Email == email);
            Account account = null;
            if (user == null)
            {
                string uploadedImageUrl = null;
                if (!string.IsNullOrEmpty(avatarUrl))
                {
                    uploadedImageUrl = await UploadImageToImgbbFromUrl(avatarUrl);
                }

                // Tạo Account mới
                 account = new Account
                {
                    AccountId = Guid.NewGuid().ToString("N"),
                    Username = username,
                    AuId = 1, // Giá trị AuId cố định hoặc lấy từ nguồn nào đó
                    Password = HashPassword(GenerateRandomPassword(12)), // Tạo mật khẩu ngẫu nhiên
                    Status = true
                };

                // Tạo AccountDetail liên kết với Account
                user = new AccountDetail
                {
                    AccountId = account.AccountId,
                    Email = email,
                    Avatar = uploadedImageUrl,
                    Name = name
                };

                // Thêm vào database
                _context.Accounts.Add(account);
                _context.AccountDetails.Add(user);
                await _context.SaveChangesAsync();
               
            }

            // Sign in the user by issuing a cookie
            else
            {
                account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == user.AccountId);
            }

            if (account == null)
            {
                return BadRequest("Account not found.");
            }

            // Sign in the user by issuing a token and saving session data
            var token = GenerateJwtToken(user.AccountId);
            HttpContext.Session.SetString("UserId", user.AccountId);
            HttpContext.Session.SetInt32("UserRole", account.AuId);

            return Redirect($"http://localhost:3000/product?userId={user.AccountId}&role={account.AuId}&token={token}&username={account.Username}&email={user.Email}&status={account.Status}");
        }
        private async Task<string> UploadImageToImgbbFromUrl(string imageUrl)
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    // Download the image from the URL
                    byte[] imageBytes = await httpClient.GetByteArrayAsync(imageUrl);

                    // Prepare the content for the request
                    var formData = new MultipartFormDataContent();
                    formData.Add(new ByteArrayContent(imageBytes), "image", "avatar.jpg");

                    // Get Imgbb API key from appsettings
                    string imgbbApiKey = _configuration["Imgbb:ApiKey"];
                    string imgbbApiUrl = $"https://api.imgbb.com/1/upload?key={imgbbApiKey}";

                    // Send the request to Imgbb
                    HttpResponseMessage response = await httpClient.PostAsync(imgbbApiUrl, formData);
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
                        dynamic jsonResponse = Newtonsoft.Json.JsonConvert.DeserializeObject(responseContent);
                        return jsonResponse?.data?.url; // Return the image URL from Imgbb
                    }
                    else
                    {
                        return null; // Return null if upload fails
                    }
                }
            }
            catch
            {
                return null; // Return null if any exception occurs
            }
        }
        private string GenerateRandomPassword(int length)
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
            StringBuilder password = new StringBuilder();
            Random random = new Random();

            for (int i = 0; i < length; i++)
            {
                password.Append(validChars[random.Next(validChars.Length)]);
            }

            return password.ToString();
        }
        private string GenerateJwtToken(string accountId)
        {
            var account = _context.Accounts.FirstOrDefault(a => a.AccountId == accountId);
            if (account == null)
            {
                throw new Exception("Account not found.");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtConfig:Secret"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
            new Claim(ClaimTypes.Name, account.AccountId),
            new Claim(ClaimTypes.Role, account.AuId.ToString()) // Dùng account.AuId
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        private string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }
        private async Task<string> GetGoogleProfilePicture(string accessToken)
        {
            using (var httpClient = new HttpClient())
            {
                // Đặt token xác thực Bearer trong Header
                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

                // Gửi yêu cầu đến Google UserInfo API
                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = await response.Content.ReadAsStringAsync();

                    // Parse JSON response để lấy thông tin ảnh đại diện
                    dynamic userInfo = Newtonsoft.Json.JsonConvert.DeserializeObject(jsonResponse);
                    return userInfo?.picture; // Trả về URL ảnh đại diện
                }

                // Trường hợp lỗi
                return null;
            }
        }
        // Hàm hash mật khẩu
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
        // Class để nhận request đăng nhập
        public class LoginRequest
        {
            public string Username { get; set; } = null!;
            public string Password { get; set; } = null!;
        }
    }
}
