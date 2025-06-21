import { useEffect, useState } from "react";
import api from "@/services/api";

const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log("Checking authentication status...");
        const res = await api.get("/auth/status", {
          withCredentials: true,
        });
        setIsLoggedIn(res.data.loggedIn);
        console.log(
          "Auth status:",
          res.data.loggedIn ? "Logged in" : "Not logged in"
        );
      } catch (err) {
        console.error("Auth check failed:", err.message);
        setIsLoggedIn(false);
      }
    };

    checkStatus();
  }, []);

  return isLoggedIn;
};

export default useAuthStatus;
