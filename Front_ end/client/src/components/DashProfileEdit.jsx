import React, { useEffect, useState, useContext } from 'react';

import { FaCloudArrowUp } from 'react-icons/fa6';
import { MdOutlineSell } from 'react-icons/md';
import { Spinner, Alert } from "flowbite-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
export default function DashProfileEdit() {
  const navigate = useNavigate();
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
      setTimeout(() => {
        setSuccessMessageP("");
        navigate("/dashboard?tab=profile");
      }, 2000);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Lỗi khi cập nhật người dùng.");
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

  const validatePhoneNumber = (phone) => {
    const vnPhoneRegex = /^(0|\+84)[3-9]\d{8}$/;
    return vnPhoneRegex.test(phone);
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
    return <div>{error}</div>;
  }

  return (
    <div className="flex flex-col xl:flex-row overflow-hidden bg-white pt-16 w-full">
      {/* Main Content */}
      <main className="w-full px-4 flex justify-center">
        <div className="bg-white shadow-lg shadow-gray-200 rounded-2xl p-6 mt-8 max-w-4xl w-full">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 text-center">Thay đổi thông Tin Chung</h1>
          {successMessagep && <Alert color="success" className="mb-4 text-sm text-center">{successMessagep}</Alert>}
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
                onChange={(e) => {
                  const phone = e.target.value;
                  setUserData((prev) => ({
                    ...prev,
                    accountDetail: {
                      ...prev.accountDetail,
                      phoneNumber: phone
                    }
                  }));
                  if (phone.length === 0) {
                    setPhoneError('');
                  } else if (!validatePhoneNumber(phone)) {
                    setPhoneError('Số điện thoại không hợp lệ (bắt đầu bằng 0 hoặc +84, và có 10 số).');
                  } else {
                    setPhoneError('');
                  }
                }}
                onBlur={(e) => {
                  const phone = e.target.value;
                  if (phone.length === 0) {
                    setPhoneError('');
                  } else if (!validatePhoneNumber(phone)) {
                    setPhoneError('Số điện thoại không hợp lệ (bắt đầu bằng 0 hoặc +84, và có 10 số).');
                  }
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2.5"
              />
              {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
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
            <div className="col-span-full flex justify-between items-center">
              <button
                type="button"
                onClick={() => window.history.back()} // hoặc dùng useNavigate nếu xài react-router-dom
                className="text-gray-700 border border-gray-400 rounded-lg px-5 py-2.5 text-sm hover:bg-gray-100 transition-transform"
              >
                Trở về
              </button>

              <button
                type="submit"
                className="text-white bg-gradient-to-br from-green-500 to-blue-500 rounded-lg shadow-md shadow-gray-300 hover:scale-[1.02] transition-transform font-medium text-sm px-5 py-2.5"
              >
                Lưu Tất Cả
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
