
import Navbar from "../components/Navbar";
import SignUpModal from "./Modals/SignUpModal"; // Import the SignUpModal component
import LoginModal from "./Modals/LogInModal";
import "./Page Styles/LandingPage.css";
import { useDispatch } from "react-redux";
import { openModal } from "../store/modal/modalSlice";

const LandingPage = () => {
  const dispatch = useDispatch();

  const openModalHandler = () => {
    dispatch(openModal('signup'))
  }
  
  return (
    <div className="container">
      <Navbar />
      <div className="content">
        <header className="header">
          <h1>Welcome to ProFlow</h1>
          <p>Your ultimate project management solution</p>
        </header>

        {/* Features Section */}
        <section className="features">
          <p>
            Streamline your projects with ProFlow—a powerful, intuitive system
            that helps you organize tasks, collaborate in real-time, and stay on
            top of deadlines with ease. From Kanban boards to seamless task
            management, ProFlow makes project success effortless.
          </p>
        </section>

        {/* Call-to-Action Section */}
        <section className="cta">
          <p>
            Ready to take your projects to the next level? Join ProFlow now!
          </p>
          {/* Open the modal on button click */}
          <button onClick={openModalHandler}>Get Started</button>
        </section>
      </div>

      {/* SignUp Modal */}
      <SignUpModal />
      <LoginModal />
    </div>
  );
};

export default LandingPage;
