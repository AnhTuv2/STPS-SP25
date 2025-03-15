using BusinessObject.Models;
using DataAccess.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repositories.Implements;
using Repositories.Service;
using System.Security.Cryptography;
using System.Text;

namespace STPS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAPI : ControllerBase
    {
        private readonly StpsContext _context;
        private readonly IConfiguration _configuration;
        private UserRepository UserRepository = new UserRepository();
        public UserAPI(StpsContext context, MailService mailService, IConfiguration configuration)
        {
            _context = context;          
            _configuration = configuration;
        }
        //Lấy danh sách user
        [HttpGet("getRole")]
        public ActionResult<IEnumerable<BusinessObject.Models.Authentication>> getRoles()
        {
            return UserRepository.GetRoles();
        }
        [HttpGet("getUser")]
        public ActionResult<IEnumerable<AccountDetail>> getUser()
        {
            return UserRepository.GetUsers();
        }
        // Chỉnh sửa user đã tạo
        [HttpPost("updateUser")]
        public async Task<IActionResult> UpdateUserAsync([FromForm] UserDTO u, IFormFile uploadedImage = null)
        {
            if (u == null || string.IsNullOrEmpty(u.Name))
            {
                return BadRequest("Invalid user data");
            }

            try
            {
                // Find the existing user
                var existingUser = UserRepository.GetUserById(u.UserId);
                if (existingUser == null)
                {
                    return NotFound($"User with username {u.Name} not found.");
                }
                                            

                // Kiểm tra trùng PhoneNumber
                var isPhoneDuplicate = await _context.AccountDetails.AnyAsync(us =>
                    us.AccountId != u.UserId && // Đảm bảo không phải người dùng hiện tại
                    us.PhoneNumber == u.PhoneNumber
                );
                if (isPhoneDuplicate)
                {
                    return BadRequest(new { message = "Phone number already exists" });
                }
                // Update user properties
                
                existingUser.PhoneNumber = u.PhoneNumber;
                existingUser.DateOfBirth = u.DateOfBirth;
                existingUser.Name = u.Name;
                existingUser.Address = u.Address;                
               
                UserRepository.UpdateUser(existingUser);

                return Ok(new { message = "User updated successfully", updatedUser = existingUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("changePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDto)
        {
            if (changePasswordDto.Id == null)
            {
                return BadRequest(new { message = "Id is required" });
            }

            var user = await _context.Accounts.FirstOrDefaultAsync(u => u.AccountId == changePasswordDto.Id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            string currentHashedPassword = HashPassword(changePasswordDto.CurrentPassword);
            if (user.Password != currentHashedPassword)
            {
                return BadRequest(new { message = "Current password is incorrect" });
            }

            string newHashedPassword = HashPassword(changePasswordDto.NewPassword);
            if (newHashedPassword == user.Password)
            {
                return BadRequest(new { message = "New password cannot be the same as the old password" });
            }

            user.Password = newHashedPassword;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }
        [HttpGet("getUserById")]
        public ActionResult<object> GetUserById(string userId)
        {
            var user = _context.Accounts
                .Where(a => a.AccountId == userId)
                .Include(a => a.AccountDetail)  // Load thông tin từ bảng AccountDetail
                .FirstOrDefault();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
        [HttpPost("updateUserImage")]
        public async Task<IActionResult> UpdateUserImage(string userId, IFormFile newImage)
        {
            if (newImage == null || newImage.Length == 0)
            {
                return BadRequest("No image file provided.");
            }

            try
            {
                // Find the existing user by their ID
                var existingUser = UserRepository.GetUserById(userId);
                if (existingUser == null)
                {
                    return NotFound($"User with ID {userId} not found.");
                }

                // Upload the new image to imgbb
                string newImageUrl = await UploadImageToImgbb(newImage);
                if (string.IsNullOrEmpty(newImageUrl))
                {
                    return BadRequest("Image upload failed.");
                }

                // Optionally: Delete the existing image from imgbb if it has been replaced
                if (!string.IsNullOrEmpty(existingUser.Avatar))
                {
                    await DeleteImageFromImgbb(existingUser.Avatar);
                }

                // Update the UserImage property with the new URL
                existingUser.Avatar = newImageUrl;

                // Save changes to the repository
                UserRepository.UpdateUser(existingUser);

                return Ok(new { message = "User image updated successfully", imageUrl = newImageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
        private async Task<string> UploadImageToImgbb(IFormFile image)
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    // Convert IFormFile to byte array
                    byte[] imageBytes;
                    using (var memoryStream = new MemoryStream())
                    {
                        await image.CopyToAsync(memoryStream);
                        imageBytes = memoryStream.ToArray();
                    }

                    // Prepare the content for the request
                    var formData = new MultipartFormDataContent();
                    formData.Add(new ByteArrayContent(imageBytes), "image", image.FileName);

                    // Get imgbb API key from appsettings
                    string imgbbApiKey = _configuration["Imgbb:ApiKey"];
                    string imgbbApiUrl = $"https://api.imgbb.com/1/upload?key={imgbbApiKey}";

                    // Send the request to imgbb
                    HttpResponseMessage response = await httpClient.PostAsync(imgbbApiUrl, formData);
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
                        dynamic jsonResponse = Newtonsoft.Json.JsonConvert.DeserializeObject(responseContent);
                        return jsonResponse?.data?.url;
                    }
                    else
                    {
                        return null;
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        private async Task DeleteImageFromImgbb(string imageUrl)
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    // Extract the image delete hash from the imageUrl if available
                    string deleteHash = GetImgbbDeleteHash(imageUrl);
                    if (string.IsNullOrEmpty(deleteHash)) return;

                    // Get imgbb API key from appsettings
                    string imgbbApiKey = _configuration["Imgbb:ApiKey"];
                    string imgbbDeleteUrl = $"https://api.imgbb.com/1/image/{deleteHash}?key={imgbbApiKey}";

                    // Send DELETE request to imgbb
                    await httpClient.DeleteAsync(imgbbDeleteUrl);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to delete image from imgbb: {ex.Message}");
            }
        }

        private string GetImgbbDeleteHash(string imageUrl)
        {
            try
            {
                var uri = new Uri(imageUrl);
                var query = uri.Query;
                var queryDictionary = System.Web.HttpUtility.ParseQueryString(query);
                return queryDictionary["delete"];
            }
            catch
            {
                return null;
            }
        }
    }
}
