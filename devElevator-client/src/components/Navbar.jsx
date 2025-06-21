import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import logo from "../assets/favicon.png";
import useAuthStatus from "@/hooks/useAuthStatus";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStatus();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      navigate("/"); // or trigger a refetch or reload
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  if (isLoggedIn === null) return null;

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800 shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Left: Logo + Brand */}
      <Link
        to="/"
        className="flex items-center gap-3">
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
      <div className="flex items-center gap-6">
        {isLoggedIn && (
          <Link
            to="/dashboard"
            className="group relative px-2 py-2 text-md font-medium text-slate-300 hover:text-white">
            Home
            <span className="absolute inset-0 rounded-md border-2 border-transparent group-hover:border-transparent z-0"></span>
            <span className="glow-border absolute inset-0 rounded-md z-10 pointer-events-none"></span>
          </Link>
        )}
        <Link
          to="/about"
          className="group relative px-2 py-2 text-md font-medium text-slate-300 hover:text-white">
          About
          <span className="absolute inset-0 rounded-md border-2 border-transparent group-hover:border-transparent z-0"></span>
          <span className="glow-border absolute inset-0 rounded-md z-10 pointer-events-none"></span>
        </Link>
        <Link
          to="/contact"
          className="group relative px-2 py-2 text-md font-medium text-slate-300 hover:text-white">
          Contact
          <span className="absolute inset-0 rounded-md border-2 border-transparent group-hover:border-transparent z-0"></span>
          <span className="glow-border absolute inset-0 rounded-md z-10 pointer-events-none"></span>
        </Link>

        {isLoggedIn && (
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-1.5 text-sm rounded-md shadow">
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
