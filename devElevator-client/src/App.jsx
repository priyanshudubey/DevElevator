import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ReadmeGenerator from "./pages/ReadmeGenerator";
import StructureViewer from "./pages/StructureViewer";

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
          element={<ReadmeGenerator />}
        />
        <Route
          path="/structure"
          element={<StructureViewer />}
        />
        {/* Dashboard, Portfolio, etc. later */}
      </Routes>
    </Router>
  );
}

export default App;
