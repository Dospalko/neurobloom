import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SimulationPage from "./pages/SimulationPage";
import "./styles/global.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
      </Routes>
    </Router>
  );
};

export default App;
