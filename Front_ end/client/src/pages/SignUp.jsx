import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AiFillGoogleCircle } from "react-icons/ai";
import { useState, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [auId, setAuId] = useState(""); // dùng thay cho role
  const [rolesList, setRolesList] = useState([]);
  //Regex Password
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\S{8,50}$/;
    return passwordRegex.test(password);
  };
  //Regex Username
  const validateUsername = (username) => {
    const usernameRegex = /^[a-z0-9]{1,50}$/;
    return usernameRegex.test(username);
  };
  // Regex Email
  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };
  //kiểm tra password
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    console.log(newPassword);
    // Kiểm tra mật khẩu có hợp lệ hay không
    if (newPassword.length === 0) {
      setPasswordError('');
    }
    // Kiểm tra mật khẩu có hợp lệ hay không
    else if (!validatePassword(newPassword)) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm một chữ cái viết hoa, một chữ cái viết thường, một số và không có khoảng trắng.');
    }
    else {
      setPasswordError(''); // Nếu hợp lệ, xóa thông báo lỗi
    }
  };
  //kiểm tra username
  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    console.log(newUsername);
    // Kiểm tra username có hợp lệ hay không
    if (newUsername.length === 0) {
      setUsernameError('');
    }
    // Kiểm tra username có hợp lệ hay không
    else if (!validateUsername(newUsername)) {
      setUsernameError('Tên người dùng phải có từ 1-50 ký tự và chỉ chứa các chữ cái thường và số.');
    }
    else {
      setUsernameError(''); // Nếu hợp lệ, xóa thông báo lỗi
    }
  };
  //kiểm tra email
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    console.log(newEmail);
    // Kiểm tra username có hợp lệ hay không
    if (newEmail.length === 0) {
      setEmailError('');
    }
    // Kiểm tra mật khẩu có hợp lệ hay không
    else if (!validateEmail(newEmail)) {
      setEmailError('Email phải có định dạng hợp lệ, ví dụ: example@domain.com.');
    }
    else {
      setEmailError(''); // Nếu hợp lệ, xóa thông báo lỗi
    }
  };


  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("https://localhost:7083/api/UserAPI/getRole");
        const data = await response.json();
        setRolesList(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách vai trò:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const role = params.get("role");
    const token = params.get("token");

    // Chỉ lưu vào localStorage nếu các giá trị tồn tại
    if (userId && role && token) {
      setUserId(userId);
      setRole(role);
      setToken(token);

      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      localStorage.setItem("token", token);
    }
  }, [location]);
  // Check API Connection when component mounts
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Thực hiện gọi API Google login và điều hướng người dùng tới trang Google để đăng nhập
      window.location.href = "https://localhost:7083/api/AuthAPI/google-login";
      // Sau đó, trình duyệt sẽ điều hướng tới trang đăng nhập Google, 
      // bạn không cần gọi hàm `checkGoogleLogin()` ngay tại đây nữa.
    } catch (error) {
      console.error("Error initiating Google login:", error);
      setError("Khởi tạo đăng nhập Google không thành công. Vui lòng thử lại.");
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn không cho form reload lại trang
    // Kiểm tra mật khẩu trước khi gửi
    if (!validatePassword(password)) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm một chữ cái viết hoa, một chữ cái viết thường, một số và không có khoảng trắng.');
      return;
    }
    //kiểm tra username trước khi gửi
    if (!validateUsername(username)) {
      setUsernameError('Tên người dùng phải có từ 1-50 ký tự và chỉ chứa các chữ cái thường và số.');
      return;
    }
    //kiểm tra email trước khi gửi
    if (!validateEmail(email)) {
      setEmailError('Email phải có định dạng hợp lệ, ví dụ: example@domain.com.');
      return;
    }
    setLoading(true); // Bắt đầu hiển thị spinner hoặc trạng thái loading
    setError(null); // Reset lỗi trước khi gửi

    try {
      const response = await fetch("https://localhost:7083/api/AuthAPI/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          auId: parseInt(auId), // Lấy từ dropdown
          name: fullName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        switch (data.message) {
          case "Username already exists":
            setUsernameError("Tên người dùng đã tồn tại.");
            break;
          case "Email already exists":
            setEmailError("Email đã tồn tại.");
            break;
          case "Name already exists":
            setNameError("Tên đã tồn tại.");
            break;
          default:
            setError("Dữ liệu không hợp lệ.");
        }
        console.log(response.status, data.message);
        return;
      }

      // Nếu đăng ký thành công

      console.log("Đăng ký thành công:", data);
      // Điều hướng người dùng tới trang khác, ví dụ trang đăng nhập     
      if (data.message === "User registered successfully") {
        navigate("/sign-in");
      }
    } catch (error) {
      setError("Kết nối API không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center pt-8 pb-16 bg-white">
      <div className="bg-[#B7F4E0] w-full max-w-2xl p-8 rounded-xl shadow-md">
        <h2 className="text-center text-2xl font-bold text-white uppercase mb-6">
          Đăng ký
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên đăng nhập */}
          <div>
            <Label value="Tên đăng nhập" />
            <TextInput
              type="text"
              placeholder="Tên đăng nhập"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
          </div>

          {/* Email */}
          <div>
            <Label value="Email" />
            <TextInput
              type="email"
              placeholder="Email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>

          {/* Mật khẩu */}
          <div className="relative">
            <Label value="Mật khẩu" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="**********"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-600"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>

          {/* Họ và tên */}
          <div>
            <Label value="Họ và Tên" />
            <TextInput
              type="text"
              placeholder="Họ và tên"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>

          {/* Vai trò */}
          <div>
            <Label value="Vai trò" />
            <select
              id="auId"
              value={auId}
              onChange={(e) => setAuId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border focus:outline-none"
            >
              <option value="">-- Chọn vai trò --</option>
              {rolesList.map((r) => (
                <option key={r.authenticationId} value={r.authenticationId}>
                  {r.authenticationName}
                </option>
              ))}
            </select>
          </div>


          {error && <Alert color="failure" withBorderAccent className="mt-4">{error}</Alert>}

          {/* Nút đăng ký - full width */}
          <div className="md:col-span-2 flex justify-center mt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full max-w-xs bg-[#00695C] hover:bg-[#004D40] text-white font-semibold py-2 rounded-md transition"
            >
              {loading ? <Spinner size="sm" /> : "Đăng ký"}
            </Button>
          </div>

          {error && (
            <div className="md:col-span-2">
              <Alert color="failure" withBorderAccent>{error}</Alert>
            </div>
          )}
        </form>

        {/* Google login */}
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full max-w-xs flex items-center justify-center text-[#EA4335] bg-[#E6F4EA] enabled:hover:bg-[#E6F4EA] font-semibold py-2 rounded-md transition-none"
          >
            <AiFillGoogleCircle className="w-6 h-6 mr-2" />
            Đăng nhập với Google
          </Button>
        </div>

        {/* Link đăng nhập */}
        <div className="text-center mt-4 text-sm">
          Đã có tài khoản?{" "}
          <Link to="/sign-in" className="text-black font-medium hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
