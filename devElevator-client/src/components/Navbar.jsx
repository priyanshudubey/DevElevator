import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import api from "@/services/api";
import logo from "../assets/favicon.png";
import useAuthStatus from "@/hooks/useAuthStatus";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isLoading } = useAuthStatus(); // ✅ Use destructured version
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout", {}, { withCredentials: true });

      // Clear any local storage/session data
      localStorage.clear();
      sessionStorage.clear();

      toast.success("Logged out successfully!");

      // Navigate to home and reload to clear auth state
      navigate("/");
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      console.error("Logout failed:", err.message);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Shows which page user is currently on
  const isActiveLink = (path) => location.pathname === path;

  // Different styles for active vs inactive links
  const activeStyles = "text-white bg-slate-800 border border-slate-700";
  const inactiveStyles =
    "text-slate-300 hover:text-white hover:bg-slate-800/50";

  // Common link styles
  const getLinkStyles = (path) => {
    const baseStyles =
      "px-3 py-2 text-md font-medium transition-colors duration-200 rounded-md";

    return `${baseStyles} ${
      isActiveLink(path) ? activeStyles : inactiveStyles
    }`;
  };

  // ✅ Always render navbar, handle loading state gracefully
  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800 shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Left: Logo + Brand */}
      <Link
        to="/"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
          <img
            src={logo}
            alt="DevElevator Logo"
            className="w-10 h-10"
          />
        </div>
        <span className="text-white text-xl font-semibold tracking-wide">
          DevElevator
        </span>
      </Link>

      {/* Right: Nav Links + Auth Button */}
      <div className="flex items-center gap-4">
        {/* Show auth-dependent links only when authenticated */}
        {isLoggedIn && (
          <>
            <Link
              to="/dashboard"
              className={getLinkStyles("/dashboard")}>
              Dashboard
            </Link>
            <Link
              to="/structure"
              className={getLinkStyles("/structure")}>
              Structure
            </Link>
            <Link
              to="/readme-generator"
              className={getLinkStyles("/readme-generator")}>
              README
            </Link>
            {/* ✅ Add LinkedIn Optimizer link */}
            <Link
              to="/linkedin-optimizer"
              className={getLinkStyles("/linkedin-optimizer")}>
              LinkedIn
            </Link>
          </>
        )}

        {/* Always show public links */}
        <Link
          to="/about"
          className={getLinkStyles("/about")}>
          About
        </Link>
        <Link
          to="/contact"
          className={getLinkStyles("/contact")}>
          Contact
        </Link>

        {/* Auth button with loading state */}
        {isLoading ? (
          <div className="bg-slate-700 px-4 py-1.5 text-sm rounded-md animate-pulse">
            <span className="text-slate-400">...</span>
          </div>
        ) : isLoggedIn ? (
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-1.5 text-sm rounded-md shadow disabled:opacity-50">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        ) : (
          // ✅ Fix the login button here too
          <Button
            onClick={() => {
              window.location.href = "/api/auth/github";
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-1.5 text-sm rounded-md shadow">
            Login
          </Button>
        )}
      </div>

      {/* Add hamburger menu for mobile */}
      <div className="md:hidden">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white">
          ☰
        </Button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-800 md:hidden">
          {/* Mobile navigation links */}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
