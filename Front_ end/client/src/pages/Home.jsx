
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
export default function Home() {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [status, setStatus] = useState(null);
  const [username, setUserName] = useState(null);
  const [name, setName] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    
    const params = new URLSearchParams(location.search);

    const userIdFromUrl = params.get("userId");
    const roleFromUrl = params.get("role");
    const tokenFromUrl = params.get("token");
    const emailFromUrl = params.get("email");
    const usernameFromUrl = params.get("username");
    const statusFromUrl = params.get("status");
    const nameFromUrl = params.get("name");
    // Ưu tiên lấy từ URL nếu có, sau đó từ localStorage
    const userId = userIdFromUrl || localStorage.getItem("userId");
    const role = roleFromUrl || localStorage.getItem("role");
    const token = tokenFromUrl || localStorage.getItem("token");
    const email = emailFromUrl || localStorage.getItem("email");
    const username = usernameFromUrl || localStorage.getItem("username");
    const status = statusFromUrl || localStorage.getItem("status");
    const name = nameFromUrl || localStorage.getItem("name");


    // Nếu lấy từ URL, lưu vào localStorage
    if (userIdFromUrl && roleFromUrl && tokenFromUrl) {
      localStorage.setItem("userId", userIdFromUrl);
      localStorage.setItem("role", roleFromUrl);
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("email", emailFromUrl);
      localStorage.setItem("username", usernameFromUrl);
      localStorage.setItem("status", statusFromUrl);
      localStorage.setItem("name", nameFromUrl);
    }

    // Cập nhật React state
    setUserId(userId);
    setRole(role);
    setToken(token);
    setEmail(email);
    setUserName(username);
    setStatus(status);
    setName(name);

    // Điều hướng xóa query parameters sau khi xử lý
    if (userIdFromUrl && roleFromUrl && tokenFromUrl) {
      navigate("/product", { replace: true });// Điều hướng tới URL sạch
      setTimeout(() => {
        window.location.reload(); // Buộc tải lại trang sau điều hướng
      }, 100);
    }

  }, [location, navigate]);
  return (
    <div className="overflow-x-hidden">     
      {/* Plant Item*/}
      <div className="max-w-5xl mx-auto p- flex flex-col gap-8 my-10">
        <div>
          <div className="my-3">
            <h2 className="text-2xl font-semibold text-slate-600">
            Bán chạy nhất
            </h2>
                      
          </div>                      

        </div>
      </div>
      
    </div>
  );
}
