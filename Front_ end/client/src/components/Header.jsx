import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";
import React, { useContext } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { MdOutlineShoppingCart } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import ConfirmationDialog from "../components/ConfirmationDialog";

export default function Header() {

  const path = useLocation().pathname;
  const [userId, setUserId] = useState(null);
  const [role, setURoles] = useState(null);
  const [email, setEmail] = useState(null);
  const [username, setUserName] = useState(null);
  const [name, setName] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userImage, setUserImage] = useState(localStorage.getItem('userImage') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      setUserImage(localStorage.getItem('userImage'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRoles = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");
    const storedUserName = localStorage.getItem("username");
    const storedName = localStorage.getItem("name");

    setUserId(storedUserId);
    setURoles(storedRoles);
    setEmail(storedEmail);
    setUserName(storedUserName);
    setName(storedName);

    const handleStorageChange = () => {
      const updatedUserId = localStorage.getItem("userId");
      const updatedRoles = localStorage.getItem("role");
      const updatedEmail = localStorage.getItem("email");
      const updatedUserName = localStorage.getItem("username");
      const updatedName = localStorage.getItem("name");
      const updatedAvata = localStorage.getItem("userImage");
      setUserId(updatedUserId);
      setURoles(updatedRoles);
      setEmail(updatedEmail);
      setUserName(updatedUserName);
      setName(updatedName);
      setUserImage(updatedAvata);
    };
    window.addEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleSignOutAcrossTabs = (event) => {
      if (event.key === "signOut") {
        // Clear state and navigate to home page
        setUserId(null);
        setURoles(null);
        setEmail(null);
        setUserName(null);
        setName(null);
        navigate("/");
      }
    };
    window.addEventListener("storage", handleSignOutAcrossTabs);
    return () => {
      window.removeEventListener("storage", handleSignOutAcrossTabs);
    };
  }, []);
  const handleSignOut = () => {
    // Xóa tất cả các mục trong localStorage
    localStorage.clear();
    // Phát sự kiện đăng xuất
    localStorage.setItem("signOut", Date.now());
    // Đặt lại trạng thái
    setUserId(null);
    setURoles(null);
    setEmail(null);
    setUserName(null);
    setName(null);
    navigate("/");
  };
  const openConfirmationDialog = () => {
    setShowConfirmation(true);
  };
  const closeConfirmationDialog = () => {
    setShowConfirmation(false);
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        if (!storedUserId) {
          console.error("No userId found in localStorage");
          return;
        }

        const response = await fetch(`https://localhost:7083/api/UserAPI/getUserById?userId=${storedUserId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();

        setUsers(userData);

        // ✅ Lưu avatar nếu có
        const avatar = userData.accountDetail?.avatar;
        if (avatar) {
          localStorage.setItem("userImage", avatar);
          window.dispatchEvent(new Event("storage"));
        }
        const name = userData.accountDetail?.name;
        if (name) {
          localStorage.setItem("name", name);
          setName(name);
          window.dispatchEvent(new Event("storage"));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);
  const handleAvatarUpdate = (newImageUrl) => {
    setUserImage(newImageUrl);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const storedUserImage = localStorage.getItem("userImage");
    if (storedUserImage) {
      setUsers((prevUser) => ({
        ...prevUser,
        userImage: storedUserImage,
      }));
    }
  }, []);
  const handleLogout = () => {
    // Clear localStorage và trạng thái
    localStorage.removeItem("status");
    localStorage.clear();
    localStorage.setItem("signOut", Date.now());

    // Đặt lại trạng thái
    setUserId(null);
    setURoles(null);
    setEmail(null);
    setUserName(null);
    setName(null);
    setShowModal(false);
    navigate("/sign-in");
    window.location.reload(true); // Reload trang sau đăng xuất

  };
  return (
    <Navbar className="border-b-2 sticky top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="flex gap-2 md:order-2">


        {userId ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={<Avatar alt="user" img={userImage} rounded />}
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium truncate">
                Tên : {name}
              </span>
              <span className="block text-sm font-medium truncate">
                Email : {email}
              </span>
              <span className="block text-sm font-medium truncate">
                Chức vụ: {" "}
                {role === "1" ? "Quản trị viên " : role === "2" ? "Người dùng" : role === "3" ? "Người bán" : "Không xác định"}
              </span>
            </Dropdown.Header>
            <Link
              to="/dashboard?tab=profile"
            >
              <Dropdown.Item>Hồ sơ</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={openConfirmationDialog}>Đăng Xuất</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="greenToBlue">Đăng nhập</Button>
          </Link>
        )}
        {/* Hiển thị hộp thoại xác nhận nếu `showConfirmation` là true */}
        {showConfirmation && (
          <ConfirmationDialog
            message="Bạn có chắc chắn muốn đăng xuất không?"
            onConfirm={() => {
              handleSignOut();
              closeConfirmationDialog();
            }}
            onCancel={closeConfirmationDialog}
          />
        )}

        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link
            to="/"

          >#</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}