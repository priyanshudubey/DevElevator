import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/favicon.png";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear cookies or session if needed
    document.cookie =
      "github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800 shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-3">
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
      </div>

      {/* Right: Nav Links + Logout */}
      <div className="flex items-center gap-6">
        <Link
          to="/dashboard"
          className="text-slate-300 hover:text-white transition duration-200 text-sm font-medium">
          Home
        </Link>
        <Link
          to="#about"
          className="text-slate-300 hover:text-white transition duration-200 text-sm font-medium">
          About
        </Link>
        <Link
          to="#contact"
          className="text-slate-300 hover:text-white transition duration-200 text-sm font-medium">
          Contact
        </Link>
        <Button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-1.5 text-sm rounded-md shadow">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
