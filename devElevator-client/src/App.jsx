import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ReadmeGenerator from "./pages/ReadmeGenerator";
import StructureViewer from "./pages/StructureViewer";
import LinkedInProfileOptimizer from "./pages/LinkedInProfileOptimizer"; // ✅ Add import
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        {/* Private routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/readme-generator"
          element={
            <PrivateRoute>
              <ReadmeGenerator />
            </PrivateRoute>
          }
        />
        <Route
          path="/structure"
          element={
            <PrivateRoute>
              <StructureViewer />
            </PrivateRoute>
          }
        />
        {/* ✅ Add LinkedIn Optimizer route */}
        <Route
          path="/linkedin-optimizer"
          element={
            <PrivateRoute>
              <LinkedInProfileOptimizer />
            </PrivateRoute>
          }
        />

        {/* Public pages */}
        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                  404 - Page Not Found
                </h1>
                <p className="text-slate-400">
                  The page you're looking for doesn't exist.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
