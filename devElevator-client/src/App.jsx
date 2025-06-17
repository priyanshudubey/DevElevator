import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ReadmeGenerator from "./pages/ReadmeGenerator";
import StructureViewer from "./pages/StructureViewer";
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
        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/contact"
          element={<Contact />}
        />
        {/* Dashboard, Portfolio, etc. later */}
      </Routes>
    </Router>
  );
}

export default App;
