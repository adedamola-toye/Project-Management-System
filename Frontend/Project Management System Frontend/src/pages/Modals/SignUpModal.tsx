import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../store/modal/modalSlice";
import { RootState, AppDispatch } from "../../store/store";
import { createUser } from "../../store/user/userSlice";
import "../Page Styles/SignUp.css";
import { FaTimes } from "react-icons/fa";

const SignUpModal = () => {
  const dispatch = useDispatch<AppDispatch>();  // Properly type dispatch

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Loading state for handling the button text
  const [loading, setLoading] = useState(false);

  // Access the modal state from Redux
  const { isOpen, modalType } = useSelector(
    (state: RootState) => state.modal
  );
  const { error } = useSelector((state: RootState) => state.user);

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading state
  
    try {
      const resultAction = await dispatch(
        createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
      );
      if (createUser.fulfilled.match(resultAction)) {
        setLoading(false); // End loading state
        dispatch(closeModal()); // Close modal after successful sign-up
      } else {
        // Handle case where createUser did not succeed
        setLoading(false);
        console.error("Signup failed:", resultAction.payload); // Log the error
      }
    } catch (error) {
      setLoading(false); // End loading state
      console.error("Signup failed:", error); // Log the error
    }
  };
  

  // Close the modal
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={handleCloseModal} className="close-btn">
          <FaTimes size={30} color="#5a189a" />
        </button>
        <h3>Sign Up To Join ProFlow</h3>
        {error && <div className="error-message">{error}</div>}
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
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;
