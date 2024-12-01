import { useState } from "react";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";


const Navbar: React.FC = () => {
  //const isAuthenticated = true; // Replace with actual authentication logic
//  const userName = "John Doe"; // Replace with actual user data
    const [navbarOpen, setNavbarOpen] = useState(false);
    const toggleMenu = () => {
        setNavbarOpen(!navbarOpen)
    }

    const closeMenu = () => {
        setNavbarOpen(false);
    }

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>ProFlow</h1>
      </div>
      <div className={`hamburger ${navbarOpen ? "active":""}`} onClick={toggleMenu}>
        {navbarOpen ? (
            <FaTimes size={30} color="#5a189a"/>
        ): (
            <FaBars size={30} color="#5a189a"/>
        )}
        
      </div>
      <ul className={`nav-links ${navbarOpen? "open":""}`}>
        <li onClick={closeMenu}>Home</li>
        <li onClick={closeMenu}>Sign Up</li>
        <li onClick={closeMenu}>Log in</li>
      </ul>
      
    </nav>
  );
};

export default Navbar;
