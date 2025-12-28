const Hero = () => {
  return (
    <header className="relative px-6 py-20 md:py-32 text-center overflow-hidden">
      {/* Prekrytie gradientom pozadia */}
      <div className="absolute inset-0 bg-gradient-to-b from-neuro-purple/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="inline-block px-4 py-2 mb-6 text-sm font-mono tracking-wider uppercase glass-effect rounded-full glow-cyan">
          NeuroBloom · živý experiment
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          <span className="gradient-text">
            Rastúca neurónová sieť
          </span>
          <br />
          <span className="text-white/90">ako živý organizmus</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          Vizualizácia umelej inteligencie, ktorá dýcha, učí sa a reaguje na
          podnety. Sledujte, ako sa neuróny rozvetvujú, aktivujú a spájajú do
          živého ekosystému dát.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group px-8 py-4 bg-gradient-to-r from-neuro-cyan to-neuro-purple rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-neuro-cyan/50 flex items-center gap-2">
            <span className="text-xl group-hover:animate-pulse">▶</span>
            <span>Spustiť simuláciu</span>
          </button>
          
          <button className="px-8 py-4 glass-effect rounded-full font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 flex items-center gap-2">
            <span className="text-xl">?</span>
            <span>Ako to funguje</span>
          </button>
        </div>
      </div>
      
      {/* Dekoratívne prvky */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-neuro-cyan rounded-full animate-pulse-slow" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-neuro-purple rounded-full animate-pulse-slow delay-75" />
      <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-neuro-pink rounded-full animate-pulse-slow delay-150" />
    </header>
  );
};

export default Hero;

