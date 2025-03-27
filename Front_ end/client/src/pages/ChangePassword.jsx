import { useState } from "react";
import { Alert } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Needed for redirec

  const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\S{8,50}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setNewPasswordError("");
    setConfirmError("");
    setSubmitSuccess("");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setPasswordError("Không tìm thấy ID người dùng.");
      return;
    }

    if (!oldPassword.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu cũ.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setNewPasswordError(
        "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và không khoảng trắng."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://localhost:7083/api/UserAPI/changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          currentPassword: oldPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        if (res.status === 400) {
          setPasswordError("Mật khẩu hiện tại không đúng.");
        } else {
          setPasswordError("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
        return;
      }

      setSubmitSuccess("✅ Mật khẩu đã được thay đổi thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/dashboard?tab=profile");
      }, 2000);
    } catch (err) {
      setPasswordError("Lỗi kết nối đến máy chủ.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-gray-300 px-10 py-8 rounded shadow-md w-full max-w-xl text-center space-y-6">
        <h2 className="font-semibold text-black text-2xl">LOGO</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OLD PASSWORD */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Mật khẩu cũ"
              className="w-full p-3 pr-10 font-semibold border rounded text-black"
              required
            />
            <span className="absolute right-3 top-3.5 cursor-pointer text-gray-600" onClick={() => setShowOld(!showOld)}>
              {showOld ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </span>
          </div>
          {passwordError && <Alert color="failure">{passwordError}</Alert>}

          {/* NEW PASSWORD */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => {
                if (newPassword && !validatePassword(newPassword)) {
                  setNewPasswordError(
                    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm một chữ cái viết hoa, một chữ cái viết thường, một số và không có khoảng trắng."
                  );
                } else {
                  setNewPasswordError("");
                }
              }}
              placeholder="Mật khẩu mới"
              className="w-full p-3 pr-10 font-semibold border rounded text-black"
              required
            />
            <span className="absolute right-3 top-3.5 cursor-pointer text-gray-600" onClick={() => setShowNew(!showNew)}>
              {showNew ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </span>
          </div>
          {newPasswordError && <Alert color="failure">{newPasswordError}</Alert>}

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => {
                if (confirmPassword && confirmPassword !== newPassword) {
                  setConfirmError("Mật khẩu xác nhận không khớp.");
                } else {
                  setConfirmError("");
                }
              }}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full p-3 pr-10 font-semibold border rounded text-black"
              required
            />
            <span className="absolute right-3 top-3.5 cursor-pointer text-gray-600" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </span>
          </div>
          {confirmError && <Alert color="failure">{confirmError}</Alert>}
          {submitSuccess && <Alert color="success">{submitSuccess}</Alert>}

          {/* BUTTONS */}
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-1/2 py-3 bg-gray-400 text-white font-bold rounded hover:bg-gray-500 transition-all"
            >
              Trở về
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 bg-cyan-500 text-white font-bold rounded hover:bg-cyan-600 transition-all"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}