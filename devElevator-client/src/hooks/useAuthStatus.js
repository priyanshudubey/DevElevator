import { useEffect, useState } from "react";
import api from "@/services/api";

const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");

        // Check for session cookie
        const hasSession =
          document.cookie.includes("develevator.sid") ||
          document.cookie.includes("connect.sid");

        console.log("Has session cookie:", hasSession);
        console.log("All cookies:", document.cookie);

        // Then verify with server
        const response = await api.get("/auth/status"); // ✅ Remove /api prefix
        console.log("Auth response:", response.data);

        const isAuthenticated =
          response.data.loggedIn || response.data.isAuthenticated;
        setIsLoggedIn(isAuthenticated);
        console.log("User is logged in:", isAuthenticated);
      } catch (error) {
        console.log("Auth check failed:", error.message);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
        console.log("Auth check completed");
      }
    };

    checkAuth();
  }, []);

  return { isLoggedIn, isLoading };
};

export default useAuthStatus;
