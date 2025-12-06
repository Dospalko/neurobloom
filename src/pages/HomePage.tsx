import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import InfoSection from "../components/InfoSection";
import NetworkStats from "../components/NetworkStats";
import Footer from "../components/Footer";
import NeuroBloomScene from "../components/NeuroBloomScene";
import LoadingScreen from "../components/LoadingScreen";
import FeatureCard from "../components/FeatureCard";

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleStartSimulation = () => {
    navigate("/simulation");
  };

  return (
    <>
      <LoadingScreen onFinished={() => setLoading(false)} />
      
      <div className={`relative min-h-screen overflow-x-hidden bg-neuro-dark transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Hero Section with 3D Background */}
        <header className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden">
          {/* 3D Scene Background */}
          <div className="absolute inset-0 z-0 opacity-60">
             <NeuroBloomScene />
          </div>
          
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-neuro-dark/30 via-transparent to-neuro-dark pointer-events-none" />

          <div className="relative z-20 max-w-5xl mx-auto px-6 mt-[-10vh]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-mono tracking-[0.2em] uppercase glass-effect border border-white/10 rounded-full animate-fade-in-up">
              <div className="w-1.5 h-1.5 bg-neuro-cyan rounded-full animate-pulse" />
              <span className="text-white font-bold">NeuroBloom</span>
              <div className="w-px h-3 bg-white/30" />
              <span className="text-gray-400">Interactive AI</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight animate-fade-in-up delay-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Neural Networks
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neuro-cyan to-neuro-blue">
                Alive & Breathing
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
              Experience the beauty of artificial intelligence. Watch neurons learn, adapt, and evolve in a real-time 3D simulation.
            </p>
            
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-300">
              <FeatureCard 
                title="Simulation"
                description="Watch a neural network learn patterns in real-time with Hebbian learning."
                icon={<span className="text-2xl">🧠</span>}
                path="/simulation"
                color="cyan"
                delay={0}
              />
              <FeatureCard 
                title="Playground"
                description="Interactive 3D visualization of neural network training and weights."
                icon={<span className="text-2xl">🎮</span>}
                path="/playground"
                color="purple"
                delay={100}
              />
              <FeatureCard 
                title="Particles"
                description="Interactive particle system controlled by hand tracking."
                icon={<span className="text-2xl">✨</span>}
                path="/particles"
                color="orange"
                delay={200}
              />
            </div>
          </div>
        </header>

        {/* Network Statistics */}
        <div className="relative z-20 -mt-20 mb-20">
           <NetworkStats />
        </div>

        {/* Info Sections */}
        <div id="about" className="relative z-20 space-y-0 bg-neuro-dark/50 backdrop-blur-lg">
          <InfoSection
            title="Simulácia rastu"
            description="Sieť vzniká z náhodných semien a postupne nadobúda štruktúru a rytmus. Každý neurón zvyšuje svoju amplitúdu podľa toho, ako sa spracúvajú vstupy z prostredia."
            align="left"
          />
          
          <InfoSection
            title="Aktivácia a útlm"
            description="Spojenia medzi neurónmi pulzujú podľa aktivácie a synapsie zosilňujú tam, kde tok dát prináša nové poznanie. Staršie časti postupne menia farbu a ustupujú ďalšiemu rastu."
            align="right"
          />
          
          <InfoSection
            title="Budúcnosť neurónov"
            description="NeuroBloom je poetická predstava toho, ako by mohli vyzerať živé neurónové siete. Možno sa raz dočkáme AI, ktorá nielen počíta, ale aj žije."
            align="left"
          />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default HomePage;

