import { useState } from "react";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../store/modal/modalSlice"
import { logout } from "../store/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navigate = useNavigate();

  // Get auth state from Redux
  const { user, accessToken } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken && !!user;

  const toggleMenu = () => {
    setNavbarOpen(!navbarOpen);
  };

  const closeMenu = () => {
    setNavbarOpen(false);
  };

  const openSignUpModal = () => {
    dispatch(openModal('signup'));
    closeMenu();
  };

  const openLoginModal = () => {
    dispatch(openModal('login'));
    closeMenu();
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };
  

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>ProFlow</h1>
      </div>
      <div className={`hamburger ${navbarOpen ? "active" : ""}`} onClick={toggleMenu}>
        {navbarOpen ? (
          <FaTimes size={30} color="#5a189a" />
        ) : (
          <FaBars size={30} color="#5a189a" />
        )}
      </div>
      <ul className={`nav-links ${navbarOpen ? "open" : ""}`}>
        {isAuthenticated ? (
          // Show these links when the user is logged in
          <>
            <li onClick={handleDashboardClick}>Dashboard</li>
            <li onClick={handleLogout}>Log Out</li>
          </>
        ) : (
          // Show these links when the user is not logged in
          <>
            <li onClick={() => navigate('/')}>Home</li>
            <li onClick={openSignUpModal}>Sign Up</li>
            <li onClick={openLoginModal}>Log in</li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
