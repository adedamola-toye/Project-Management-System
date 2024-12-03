import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../store/modal/modalSlice";
import { RootState, AppDispatch } from "../../store/store";
import { createUser } from "../../store/user/userSlice";
import "../Page Styles/SignUp.css";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { openModal } from "../../store/modal/modalSlice";

const SignUpModal = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Access Redux state
  const { isOpen, modalType } = useSelector((state: RootState) => state.modal);
  const { loading, error } = useSelector((state: RootState) => state.user);

  // Only render the modal if it is open and the modal type is 'signup'
  if (!isOpen || modalType !== "signup") return null;

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

    // Password confirmation validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    //exclude confirmPassword
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {confirmPassword, ...userData} = formData

    // Dispatch the createUser thunk
    dispatch(createUser(userData))
      .unwrap()
      .then(() => {
        alert("Account successfully created!");
        dispatch(closeModal()); // Close modal on successful account creation
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        
      });
  };

  // Close the modal
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  //Switch to login modal
  const switchToLoginModal = () => {
    dispatch(closeModal());
    dispatch(openModal('login'))
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={handleCloseModal} className="close-btn">
          <FaTimes size={30} color="#5a189a" />
        </button>
        <h3>Sign Up To Join ProFlow</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
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
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="login-cta">Already have an account with us? {" "} 
          <Link to="#" onClick={switchToLoginModal}>Log in</Link></p>
      </div>
    </div>
  );
};

export default SignUpModal;
