using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class AccountDetailDAO
    {
        readonly StpsContext _context = new StpsContext();

        public AccountDetailDAO()
        {
        }

        public AccountDetailDAO(StpsContext context)
        {
            _context = context;
        }
        public List<Authentication> GetRoles()
        {
            return _context.Authentications.ToList(); // Trả về danh sách tất cả Users.
        }
        public List<AccountDetail> GetUsers()
        {
            return _context.AccountDetails.ToList(); // Trả về danh sách tất cả Users.
        }
        public void UpdateUser(AccountDetail u)
        {
            var user = _context.AccountDetails.FirstOrDefault(x => x.AccountId == u.AccountId); // Tìm User theo ID.
            if (user != null)
            {               
                user.PhoneNumber = u.PhoneNumber;              
                user.Name = u.Name;
                user.Address = u.Address;               

                user.DateOfBirth = u.DateOfBirth;               
                _context.AccountDetails.Update(user); // Cập nhật User trong cơ sở dữ liệu.
                _context.SaveChanges(); // Lưu thay đổi vào cơ sở dữ liệu.
            }
        }
        public AccountDetail GetUserById(string id)
        {
            return _context.AccountDetails.FirstOrDefault(x => x.AccountId == id); // Trả về User có ID tương ứng.
        }
    }
}
