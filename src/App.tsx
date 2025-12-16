import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import PageTransition from "./components/PageTransition";
import "./styles/global.css";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const SimulationPage = lazy(() => import("./pages/SimulationPage"));
const PlaygroundPage = lazy(() => import("./pages/PlaygroundPage"));
const ParticleSystemPage = lazy(() => import("./pages/ParticleSystemPage"));
const NeuralTutorialPage = lazy(() => import("./pages/NeuralTutorialPage"));

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/simulation" element={<PageTransition><SimulationPage /></PageTransition>} />
        <Route path="/playground" element={<PageTransition><PlaygroundPage /></PageTransition>} />
        <Route path="/particles" element={<PageTransition><ParticleSystemPage /></PageTransition>} />
        <Route path="/tutorial" element={<PageTransition><NeuralTutorialPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen onFinished={() => {}} />}>
        <AnimatedRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
