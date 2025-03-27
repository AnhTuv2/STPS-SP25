import { useEffect, useState } from "react";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AiFillGoogleCircle } from "react-icons/ai";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function SignIn() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [name, setName] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  // Check API Connection when component mounts

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const role = params.get("role");
    const token = params.get("token");
    const name = params.get("name");

    // Chỉ lưu vào localStorage nếu các giá trị tồn tại
    if (userId && role && token) {
      setUserId(userId);
      setRole(role);
      setToken(token);
      setName(name);

      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
    }
  }, [location]);
  // Check API Connection when component mounts
  const handleGoogleLogin = async () => {
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
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch("https://localhost:7083/api/AuthAPI/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: account, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 401 && data.message === "Your account has been locked ") {
          setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.");
        } else if (response.status === 401) {
          setError("Email, số điện thoại hoặc mật khẩu không hợp lệ.");
        } else {
          setError(`Lỗi API:  ${response.status}`);
        }
        return;
      }
  
      if (data.message === "Login successful") {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.accountId);
        localStorage.setItem("role", data.authId);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        localStorage.setItem("status", data.status);
        localStorage.setItem("name", data.name);
        window.dispatchEvent(new Event("storage"));
  
        if (data.authId === 1 || data.authId === 3) {
          navigate("/dashboard?tab=dash");
        } else if (data.authId === 2) {
          navigate("/product");
        } else {
          setError("Vai trò không xác định. Vui lòng liên hệ bộ phận hỗ trợ.");
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setError("Kết nối API không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAccount(value);

    if (!value) {
      setError("");
      return;
    }
    
  };
  return (
    <div className="flex justify-center pt-8 pb-16 bg-white">
      <div className="bg-[#B7F4E0] w-full max-w-md p-8 rounded-xl shadow-md">
        <h2 className="text-center text-2xl font-bold text-white uppercase mb-6">
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email or Phone */}
          <div>
            <Label value="Tên đăng nhập" />
            <TextInput
              type="text"
              placeholder="Tên đăng nhập của bạn"
              id="email"
              value={account}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label value="Mật khẩu của bạn" />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="**********"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>

          {/* Đăng nhập */}
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#00695C] hover:bg-[#004D40] text-white font-semibold py-2 rounded-md transition"
          >
            {loading ? <Spinner size="sm" /> : "Đăng nhập"}
          </Button>

          {/* Lỗi */}
          {error && <Alert color="failure">{error}</Alert>}

          {/* Quên mật khẩu */}
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-[#004D40] hover:underline font-medium">
              Quên mật khẩu
            </Link>
          </div>

          {/* Google login */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center text-[#EA4335] bg-[#E6F4EA] enabled:hover:bg-[#E6F4EA] font-semibold py-2 rounded-md transition-none"
          >
            <AiFillGoogleCircle className="w-6 h-6 mr-2" />
            Đăng nhập với Google
          </Button>
        </form>

        {/* Đăng ký */}
        <div className="flex justify-center text-sm mt-6 gap-1">
          <span>Chưa có tài khoản?</span>
          <Link to="/sign-up" className="text-black font-medium hover:underline">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
