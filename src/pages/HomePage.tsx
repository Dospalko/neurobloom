import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import InfoSection from "../components/InfoSection";
import NetworkStats from "../components/NetworkStats";
import Footer from "../components/Footer";
import NeuroBloomScene from "../components/NeuroBloomScene";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartSimulation = () => {
    navigate("/simulation");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-neuro-dark">
      {/* Hero Section */}
      <header className="relative px-6 py-16 md:py-24 text-center overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(75, 158, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-mono tracking-wider uppercase glass-effect border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 bg-neuro-blue rounded-full animate-pulse" />
            <span className="text-white font-bold">NeuroBloom</span>
            <div className="w-px h-3 bg-white/30" />
            <span className="text-gray-500">v1.0</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
            <span className="text-white">
              Živá neurónová sieť
            </span>
            <br />
            <span className="text-gray-500">v reálnom čase</span>
          </h1>
          
          {/* Description */}
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Interaktívna vizualizácia AI, ktorá dýcha, učí sa a reaguje. 
            Sleduj neuróny, ako sa rozvetvujú a vytvárajú živý ekosystém.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button 
              onClick={handleStartSimulation}
              className="group relative px-6 py-2.5 bg-neuro-blue/20 border-2 border-neuro-blue rounded-lg font-semibold text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-neuro-blue/40 hover:bg-neuro-blue/30 flex items-center gap-2 overflow-hidden"
            >
              <div className="relative flex items-center gap-2">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent" />
                <span>Start Simulation</span>
              </div>
            </button>
            
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-6 py-2.5 glass-effect border border-white/30 rounded-lg font-semibold text-gray-300 text-sm transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/50 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5.5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Documentation</span>
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-16 left-8 w-2 h-2 border border-neuro-blue/60 rounded-full animate-pulse-slow" />
        <div className="absolute top-32 right-16 w-2.5 h-2.5 border border-neuro-purple/60 rounded-sm animate-pulse-slow delay-75 rotate-45" />
        <div className="absolute bottom-16 left-1/4 w-2 h-2 border border-neuro-green/60 rounded-full animate-pulse-slow delay-150" />
      </header>

      {/* 3D Preview Scene */}
      <section className="relative h-screen w-full">
        <NeuroBloomScene />
      </section>

      {/* Network Statistics */}
      <NetworkStats />

      {/* Info Sections */}
      <div id="about" className="space-y-0">
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
  );
};

export default HomePage;
