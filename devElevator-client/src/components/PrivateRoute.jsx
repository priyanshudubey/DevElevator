import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/github/user");
        console.log("✅ Authenticated:", res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error(
          "❌ Auth check failed:",
          err.response?.data || err.message
        );
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

export default PrivateRoute;
