import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Tutorial3DScene from '../components/Tutorial3DScene';

// Tutorial Steps Data
const tutorialSteps = [
  {
    id: 'intro',
    title: 'Neurónová Sieť',
    description: 'Vitajte v priestore digitálnej mysle. Preskúmajte, ako AI vníma svet, vrstvu po vrstve.',
  },
  {
    id: 'input',
    title: 'Vstupná Vrstva',
    description: 'Všetko začína dátami. Obraz (napríklad číslica 4) sa rozloží na jednotlivé pixely. Každý bod aktivuje jeden vstupný senzor.',
  },
  {
    id: 'weights',
    title: 'Váhové Spojenia',
    description: 'Informácia prúdi cez sieť. Silné spojenia (vysoká váha) prenášajú signál ďalej, slabé ho utlmia. Takto sa sieť "učí" čo je dôležité.',
  },
  {
    id: 'hidden',
    title: 'Skryté Vrstvy',
    description: 'Hlboko v sieti sa hľadajú vzory. Krivky, hrany a slučky sa spájajú do komplexnejších tvarov. Toto je "myslenie" umelej inteligencie.',
  },
  {
    id: 'output',
    title: 'Výstup',
    description: 'Finálne rozhodnutie. Sieť vyhodnotí pravdepodobnosti a s istotou 92% určí: "Je to štvorka".',
  }
];

const NeuralTutorialPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-neuro-cyan">Načítavam 3D Svet...</div>}>
            <Tutorial3DScene step={currentStep} />
        </Suspense>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header / Nav */}
        <nav className="flex justify-between items-center pointer-events-auto">
             <button 
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white"
             >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Domov
             </button>

             {/* Progress Dots */}
             <div className="flex gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                {tutorialSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentStep ? 'bg-neuro-cyan scale-125 shadow-[0_0_10px_#00e5ff]' : 'bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>
        </nav>

        {/* Content Card (Bottom Left, smaller to not block output) */}
        <div className="flex items-end justify-start pointer-events-auto pb-10">
            <motion.div 
               key={currentStep}
               initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
               animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
               exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
               transition={{ duration: 0.6 }}
               className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neuro-cyan to-neuro-purple" />
               <div className="absolute -right-10 -top-10 w-32 h-32 bg-neuro-cyan/20 blur-3xl rounded-full pointer-events-none" />

               <h2 className="text-3xl md:text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {tutorialSteps[currentStep].title}
               </h2>
               <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                  {tutorialSteps[currentStep].description}
               </p>

               <div className="flex gap-3 mt-6">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`px-6 py-3 rounded-xl border border-white/10 transition-all ${currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                  >
                    Späť
                  </button>
                  
                  {currentStep < tutorialSteps.length - 1 ? (
                      <button
                        onClick={nextStep}
                        className="px-8 py-3 rounded-xl bg-neuro-cyan text-white font-bold hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center gap-2"
                      >
                        Ďalej <span className="text-xl text-white">→</span>
                      </button>
                  ) : (
                       <button
                         onClick={() => navigate('/simulation')}
                         className="px-8 py-3 rounded-xl bg-gradient-to-r from-neuro-purple to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                       >
                         Spustiť Simuláciu
                       </button>
                  )}
               </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
};

export default NeuralTutorialPage;
