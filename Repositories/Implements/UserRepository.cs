using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implements
{
    public class UserRepository : IUserRepository
    {
        private AccountDetailDAO userDAO = new AccountDetailDAO();
        public List<Authentication> GetRoles()
        {
            return userDAO.GetRoles(); // Lấy danh sách tất cả User từ DAO.
        }
        public List<AccountDetail> GetUsers()
        {
            return userDAO.GetUsers(); // Lấy danh sách tất cả User từ DAO.
        }
        public void UpdateUser(AccountDetail user)
        {
            userDAO.UpdateUser(user);
        }
        public AccountDetail GetUserById(string id)
        {
            return userDAO.GetUserById(id); // Trả về User có ID tương ứng.
        }
    }
}
