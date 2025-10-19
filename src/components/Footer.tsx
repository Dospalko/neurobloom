const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative px-6 py-16 bg-gradient-to-t from-black via-neuro-dark to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand section */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold gradient-text">NeuroBloom</h3>
            <p className="text-gray-400 leading-relaxed">
              Experimentálna vizualizácia umelej neurónovej siete postavená na React a Three.js
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-neuro-cyan rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-neuro-purple rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-neuro-pink rounded-full animate-pulse delay-150" />
            </div>
          </div>
          
          {/* Technologies */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neuro-cyan uppercase tracking-wide">Technológie</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-neuro-cyan transition-colors cursor-pointer">→ React 18</li>
              <li className="hover:text-neuro-cyan transition-colors cursor-pointer">→ Three.js</li>
              <li className="hover:text-neuro-cyan transition-colors cursor-pointer">→ React Three Fiber</li>
              <li className="hover:text-neuro-cyan transition-colors cursor-pointer">→ TypeScript</li>
              <li className="hover:text-neuro-cyan transition-colors cursor-pointer">→ Tailwind CSS</li>
            </ul>
          </div>
          
          {/* Principles */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neuro-purple uppercase tracking-wide">Princípy</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">→ Organický rast</li>
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">→ Synaptická plastickosť</li>
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">→ Adaptívna aktivácia</li>
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">→ Živá simulácia</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} NeuroBloom · vytvorené pre vizuálny experiment a vzdelávanie
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gradient-to-r from-neuro-cyan via-neuro-purple to-neuro-pink rounded-full animate-pulse-slow" />
            <span className="text-xs text-gray-600 font-mono">živá AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
