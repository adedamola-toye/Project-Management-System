import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../store/modal/modalSlice";
import { RootState, AppDispatch } from "../../store/store";
import { loginUser } from "../../store/auth/authSlice";  // Adjusted for login
import "../Page Styles/SignUp.css";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { openModal } from "../../store/modal/modalSlice";

const LoginModal = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Access Redux state
  const { isOpen, modalType } = useSelector((state: RootState) => state.modal);
  const { loading, error } = useSelector((state: RootState) => state.auth); // Adjusted to auth

  // Only render the modal if it is open and the modal type is 'login'
  if (!isOpen || modalType !== "login") return null;

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Dispatch the loginUser thunk
    dispatch(loginUser(formData))
      .unwrap()
      .then(() => {
        alert("Login successful!");
        dispatch(closeModal()); // Close modal on successful login
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  };

  // Close the modal
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  // Switch to sign up modal
  const switchToSignUpModal = () => {
    dispatch(closeModal());
    dispatch(openModal('signup'));
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={handleCloseModal} className="close-btn">
          <FaTimes size={30} color="#5a189a" />
        </button>
        <h3>Log In to Your Account</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
        <p className="signup-cta">Don't have an account?{" "}
          <Link to="#" onClick={switchToSignUpModal}>Sign up</Link></p>
      </div>
    </div>
  );
};

export default LoginModal;
