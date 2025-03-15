using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IUserRepository
    {
        List<AccountDetail> GetUsers();
        List<Authentication> GetRoles();
        void UpdateUser(AccountDetail user);
        AccountDetail GetUserById(string id);
    }
}
