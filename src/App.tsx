import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SimulationPage from "./pages/SimulationPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import "./styles/global.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
