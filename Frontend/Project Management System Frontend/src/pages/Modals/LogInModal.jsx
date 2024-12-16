import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/modal/modalSlice";
import { loginUser } from "../../store/auth/authSlice";
import { FaTimes } from "react-icons/fa";
import "../Page Styles/Modals.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LoginModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Access Redux state
  const { isOpen, modalType } = useSelector((state) => state.modal);
  const { loading, error } = useSelector((state) => ({
    loading: state.auth.loading.login,
    error: state.auth.error.login,
  }));

  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  // Only render the modal if it is open and the modal type is 'login'
  if (!isOpen || modalType !== "login") return null;

  
   
  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

    try {
      // Dispatch the loginUser thunk
      await dispatch(loginUser(formData)).unwrap();
      alert("Login successful!");
      dispatch(closeModal());
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  // Switch to sign-up modal
  const switchToSignUpModal = () => {
    dispatch(closeModal());
    dispatch(openModal("signup"));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={handleCloseModal} className="close-btn">
          <FaTimes size={30} color="#5a189a" />
        </button>
        <h3>Log In to Your Account</h3>
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
        <p className="login-cta">
          Already have an account with us?{" "}
          <Link className="link" to="#" onClick={switchToSignUpModal}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
