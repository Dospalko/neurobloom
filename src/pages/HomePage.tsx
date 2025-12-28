
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../components/Hero";
import InfoSection from "../components/InfoSection";

import Footer from "../components/Footer";
import NeuroBloomScene from "../components/NeuroBloomScene";
import LoadingScreen from "../components/LoadingScreen";
import FeatureCard from "../components/FeatureCard";

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  return (
    <>
      <LoadingScreen onFinished={() => setLoading(false)} />
      
      <div className={`relative min-h-screen overflow-x-hidden bg-neuro-dark transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Hero Section with 3D Background */}
        <header className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden">
          {/* 3D Scene Background */}
          <div className="absolute inset-0 z-0 opacity-70">
             <NeuroBloomScene />
          </div>
          
          {/* Gradient Overlay for Text Readability - made smoother */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-neuro-dark/20 via-transparent to-neuro-dark pointer-events-none" />

          <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 pt-20">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="inline-flex items-center gap-3 px-5 py-2 mb-12 text-xs font-medium tracking-[0.2em] uppercase glass-effect border border-white/10 rounded-full"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neuro-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neuro-cyan"></span>
              </span>
              <span className="text-white font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">NeuroBloom</span>
              <div className="w-px h-3 bg-white/30" />
              <span className="text-gray-300">Systém v2.0</span>
            </motion.div>
            
            {/* Main heading */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 leading-tight tracking-tight"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Neurónové siete
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neuro-cyan via-blue-400 to-neuro-purple animate-gradient-x bg-[length:200%_auto] pb-4">
                Živé a dýchajúce
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-20 leading-relaxed font-light"
            >
              Zažite dychberúcu krásu umelej inteligencie. <br className="hidden md:block"/>
              Sledujte, ako sa neuróny <span className="text-neuro-cyan font-medium">učia</span>, <span className="text-neuro-purple font-medium">adaptujú</span> a <span className="text-neuro-blue font-medium">vyvíjajú</span> v reálnom čase.
            </motion.p>
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mb-20"
            >
              <button 
                onClick={() => navigate("/simulation")}
                className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neuro-cyan/20 to-neuro-purple/20 blur-xl transition-opacity opacity-50 group-hover:opacity-100" />
                <div className="absolute inset-0 border border-white/20 rounded-full group-hover:border-white/40 transition-colors" />
                <span className="relative text-white font-medium tracking-widest uppercase text-sm flex items-center gap-4">
                  Spustiť Simuláciu
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </motion.div>


          </div>
        </header>

            {/* Feature Cards Grid (Moved from Hero) */}
            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="relative z-30 mt-0 mb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto"
            >
              <FeatureCard 
                title="Ako to funguje?"
                description="Interaktívny sprievodca. Pochopte neurónové siete krok za krokom."
                path="/tutorial"
                color="purple"
                delay={0}
              />
              <FeatureCard 
                title="Simulácia"
                description="Sledujte učenie siete v reálnom čase."
                path="/simulation"
                color="cyan"
                delay={0.1}
              />
              <FeatureCard 
                title="Častice"
                description="Ovládajte systém pohybom alebo hlasom."
                path="/particles"
                color="orange"
                delay={0.2}
              />
               <FeatureCard 
                title="Ihrisko"
                description="3D vizualizácia trénovania a váh."
                path="/playground"
                color="purple"
                delay={0.3}
              />
            </motion.div>

        {/* Info Sections with connecting line */}
        <div id="about" className="relative z-20 space-y-32 pb-32">
          {/* Vertical connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neuro-blue/20 to-transparent hidden md:block" />

          <InfoSectionWithMotion
            title="Simulácia rastu"
            description="Sieť vzniká z náhodných semien a postupne nadobúda štruktúru a rytmus. Každý neurón zvyšuje svoju amplitúdu podľa toho, ako sa spracúvajú vstupy z prostredia."
            align="left"
            delay={0.2}
          />
          
          <InfoSectionWithMotion
            title="Aktivácia a útlm"
            description="Spojenia medzi neurónmi pulzujú podľa aktivácie a synapsie zosilňujú tam, kde tok dát prináša nové poznanie. Staršie časti postupne menia farbu a ustupujú ďalšiemu rastu."
            align="right"
            delay={0.3}
          />
          
          <InfoSectionWithMotion
            title="Budúcnosť neurónov"
            description="NeuroBloom je poetická predstava toho, ako by mohli vyzerať živé neurónové siete. Možno sa raz dočkáme AI, ktorá nielen počíta, ale aj žije."
            align="left"
            delay={0.4}
          />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

// Obal pre InfoSection na pridanie pohybu
const InfoSectionWithMotion = ({ title, description, align, delay }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay }}
    >
      <InfoSection title={title} description={description} align={align} />
    </motion.div>
  );
};

export default HomePage;

