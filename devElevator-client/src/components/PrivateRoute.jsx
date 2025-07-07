import { Navigate } from "react-router-dom";
import useAuthStatus from "@/hooks/useAuthStatus";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuthStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
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
