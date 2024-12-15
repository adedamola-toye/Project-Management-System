
import Navbar from "../components/Navbar";
import SignUpModal from "./Modals/SignUpModal"; 
import LoginModal from "./Modals/LogInModal";
import "./Page Styles/LandingPage.css";
import { useDispatch } from "react-redux";
import { openModal } from "../store/modal/modalSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const LandingPage = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken && !!user;
  const navigate = useNavigate();

  const openModalHandler = () => {
    dispatch(openModal('signup'))
  }
  
  useEffect(() => {
    if(isAuthenticated){
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="container">
      <Navbar />
      <div className="content">
        <header className="header">
          <h1>Welcome to ProFlow</h1>
          <p>Your ultimate project management solution</p>
        </header>


        <section className="features">
          <p>
            Streamline your projects with ProFlow—a powerful, intuitive system
            that helps you organize tasks, collaborate in real-time, and stay on
            top of deadlines with ease. From Kanban boards to seamless task
            management, ProFlow makes project success effortless.
          </p>
        </section>


        <section className="cta">
          <p>
            Ready to take your projects to the next level? Join ProFlow now!
          </p>
  
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
