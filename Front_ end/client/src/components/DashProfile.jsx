import React, { useEffect, useState, useContext } from 'react';

import { FaCloudArrowUp } from 'react-icons/fa6';
import { MdOutlineSell } from 'react-icons/md';
import { Spinner } from "flowbite-react";
import { useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function DashProfile() {
  // Khởi tạo state `user`, `error` và `loading` 
  const [user, setUserData] = useState({});
  const [role, setURoles] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [LimitPasswordError, setLimitPasswordError] = useState('');
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [successMessage, setSuccessMessage] = useState('');
  const [successMessagep, setSuccessMessageP] = useState('');
  const [otp, setOtp] = useState('');
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  // Hàm lấy dữ liệu người dùng từ API
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      const storedRoles = localStorage.getItem("role");
      setURoles(storedRoles);
      if (!userId || userId === "undefined") {
        console.error("User is not logged in or userId is invalid.");
        setError("User is not logged in or userId is invalid.");
        setLoading(false);
        return;
      }
      try {
        const userResponse = await fetch(`https://localhost:7083/api/UserAPI/getUserById?userId=${userId}`);
        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        if (userData.message === "No user available currently.") {
          setError("No user available currently.");
          setUserData({});  // Xóa dữ liệu người dùng nếu không có
        } else {
          setUserData(userData);  // Cập nhật state với dữ liệu người dùng
        }
        setLoading(false);  // Kết thúc trạng thái loading
      } catch (err) {
        setError(err.message);  // Hiển thị thông báo lỗi nếu có
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);
  // chuyển tiếp các bước khi yêu cầu lên seller




  // Hàm xử lý khi submit form cho thông tin người dùng
  const handleUserSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    // Các trường cơ bản
    formData.append("UserId", user.accountId);
    formData.append("Username", user.username);
    formData.append("Password", user.password || "");
    formData.append("Email", user.accountDetail?.email || "");
    formData.append("PhoneNumber", user.accountDetail?.phoneNumber || "");
    formData.append("Name", user.accountDetail?.name || "");
    formData.append("Address", user.accountDetail?.address || "");

    // 🔁 Format ngày sinh (DateOfBirth) về đúng kiểu datetime cho SQL Server
    if (user.accountDetail?.dateOfBirth) {
      const dateOnly = new Date(user.accountDetail.dateOfBirth);
      const isoDate = dateOnly.toISOString().split("T")[0]; // "yyyy-MM-dd"
      const formatted = `${isoDate}T00:00:00`; // chuẩn SQL datetime
      formData.append("DateOfBirth", formatted);
    } else {
      formData.append("DateOfBirth", "");
    }

    // Nếu có hình ảnh được upload
    if (user.uploadedImage) {
      formData.append("uploadedImage", user.uploadedImage);
    }

    try {
      const response = await fetch("https://localhost:7083/api/UserAPI/updateUser", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();

        if (response.status === 400) {
          switch (data.message) {
            case "Username already exists":
              setUsernameError("Tên người dùng đã tồn tại.");
              break;
            case "Email already exists":
              setEmailError("Email đã tồn tại.");
              break;
            case "Phone number already exists":
              setPhoneError("Số điện thoại đã được đăng kí.");
              break;
            default:
              setError("Dữ liệu không hợp lệ.");
              break;
          }
        } else {
          setError(`API Error: ${response.status}`);
        }
        return;
      }

      // ✅ Thành công
      setSuccessMessageP("Thông tin người dùng được cập nhật!");
      setPhoneError("");
      setEmailError("");
      setUsernameError("");
      setTimeout(() => setSuccessMessageP(""), 2000);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Lỗi khi cập nhật người dùng.");
    }
  };

  // Hàm xử lý khi submit form cho mật khẩu
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setConfirmPasswordError('');
    setLimitPasswordError('');

    try {
      if (newPassword.length < 7) {
        setLimitPasswordError("Mật khẩu mới phải từ 7 chữ trở lên.");
        return;
      }

      const validatePassword = (password) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
        return passwordRegex.test(password);
      };

      if (!validatePassword(newPassword)) {
        setLimitPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
        return;
      }



      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Mật khẩu xác nhận phải giống với mật khẩu mới.");
        return;
      }
      // gọi api để đổi mật
      const response = await fetch('https://opms1.runasp.net/api/UserAPI/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          id: user.userId  // Gửi ID người dùng
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          setPasswordError("Mật khẩu hiện tại không đúng.");
        } else {
          throw new Error('Lỗi cập nhật mật khẩu');
        }
        return;
      }

      setSuccessMessageP("Mật khẩu thay đổi thành công!");
      setTimeout(() => setSuccessMessageP(''), 2000);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Lỗi khi cập nhật mật khẩu:", error);
    }
  };

  // Hàm xử lý khi thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nếu trường nằm trong accountDetail
    if (["name", "email", "phoneNumber", "address", "dateOfBirth"].includes(name)) {
      setUserData((prevUser) => ({
        ...prevUser,
        accountDetail: {
          ...prevUser.accountDetail,
          [name]: value
        }
      }));
    } else {
      // Còn lại là trường ngoài cùng (ví dụ: username)
      setUserData((prevUser) => ({
        ...prevUser,
        [name]: value
      }));
    }
  };


  // đổi avatar
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  // hàm api 
  const handleFileChange = async (event) => {
    const userId = localStorage.getItem("userId");
    const file = event.target.files[0];
    if (!file || !userId) {
      setSuccessMessageP("ID người dùng bị thiếu hoặc chưa chọn tệp.");
      setTimeout(() => setSuccessMessageP(''), 2000);
      return;
    }

    const formData = new FormData();
    formData.append("newImage", file);

    try {
      const response = await fetch(`https://localhost:7083/api/UserAPI/updateUserImage?userId=${userId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessageP("Ảnh đc thêm thành công!");
        setTimeout(() => setSuccessMessageP(''), 2000);
        console.log("Updated image URL:", data.imageUrl);
        setUserData((prevUser) => ({
          ...prevUser,
          userImage: data.imageUrl, // Assuming `data.imageUrl` is the new image URL
        }));
        localStorage.setItem("userImage", data.imageUrl);
        window.dispatchEvent(new Event('storage'));
        const updated = await fetch(`https://localhost:7083/api/UserAPI/getUserById?userId=${userId}`);
        const newUser = await updated.json();
        setUserData(newUser);
      } else {
        const errorData = await response.json();
        setSuccessMessageP("Ảnh cập nhật không thành công: " + errorData.message);
        setTimeout(() => setSuccessMessageP(''), 2000);
        return;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setSuccessMessageP("Lỗi Cập nhật ảnh");
      setTimeout(() => setSuccessMessageP(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center">
          <Spinner aria-label="Loading spinner" size="xl" />
          <span className="mt-3 text-lg font-semibold">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;  // Hiển thị lỗi nếu có
  }

  return (
    <div className="flex flex-col xl:flex-row overflow-hidden bg-white pt-16 w-full">
      {/* Sidebar */}
      <aside className="w-full xl:w-1/4 bg-gray-100 px-6 py-8 shadow-md rounded-2xl mx-4 mb-8 xl:mb-0">
        <div className="flex flex-col items-center text-center">
          <img
            className="mb-4 w-28 h-28 rounded-full object-cover shadow-lg"
            src={user.accountDetail?.avatar || "https://via.placeholder.com/150"}
            alt="User Avatar"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg shadow-md shadow-gray-300 hover:scale-[1.02] transition-transform mb-4"
          >
            <FaCloudArrowUp className="mr-2 -ml-1 w-4 h-4" />
            Thay đổi ảnh
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
           <div className="my-4 text-left w-full">
            <h3 className="text-gray-900 font-semibold text-base mb-2">✅ Xác minh danh tính</h3>
            <p className="text-gray-500 text-sm">Thông tin này sẽ được sử dụng để xác minh danh tính của bạn và đảm bảo an toàn tài khoản.</p>
          </div>
          <div className="text-left w-full">
            <h4 className="text-gray-900 font-bold text-lg">{user.accountDetail?.name || 'John Doe'}</h4>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Email đã xác nhận
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Số điện thoại đã xác nhận
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-full xl:w-3/4 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-800 mt-2">Hello, {user.accountDetail?.name || 'John Doe'}</h1>
          <div className="flex gap-4 mt-4">
            <Link
              to="/dashboard?tab=edit"
              className="border border-gray-400 text-gray-900 rounded-md px-4 py-2 inline-block text-center"
            >
              Sửa
            </Link>
            <Link
            to="/change-password" 
            className="border border-gray-400 text-gray-900 rounded-md px-4 py-2"
            >
              Đổi mật khẩu
              </Link>
            <button className="bg-red-600 text-white rounded-md px-4 py-2">Xóa tài khoản</button>
          </div>
        </div>

        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-2">⭐ 0 Reviews</p>
          <a href="#" className="text-blue-600 underline">Đánh giá bởi bạn</a>
        </div>

        <div className="bg-white shadow-lg shadow-gray-200 rounded-2xl p-6 mt-8">
          <h3 className="mb-4 text-2xl font-bold text-gray-900">Thông Tin Chung</h3>
          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên Người Dùng</label>
              <input
                type="text"
                name="username"
                value={user.username || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2.5"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input
                type="text"
                name="name"
                value={user.accountDetail?.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2.5"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={user.accountDetail?.email || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2.5"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số Điện Thoại</label>
              <input
                type="tel"
                name="phoneNumber"
                value={user.accountDetail?.phoneNumber || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2.5"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa Chỉ</label>
              <input
                type="text"
                name="address"
                value={user.accountDetail?.address || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2.5"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày Sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={user.accountDetail?.dateOfBirth ? user.accountDetail?.dateOfBirth.split("T")[0] : ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2.5"
              />
            </div>           
          </form>
        </div>
      </main>
    </div>
  );
}
