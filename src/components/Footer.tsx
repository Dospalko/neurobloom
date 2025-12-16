const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative px-6 py-12 border-t border-white/10 bg-black/20">
      <div className="max-w-7xl mx-auto">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-neuro-blue rounded-full animate-pulse" />
              <h3 className="text-xl font-bold text-white">NeuroBloom</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Experimentálna vizualizácia živej neurónovej siete v reálnom čase
            </p>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-neuro-blue rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-neuro-purple rounded-full animate-pulse delay-75" />
              <div className="w-1.5 h-1.5 bg-neuro-green rounded-full animate-pulse delay-150" />
            </div>
          </div>
          
          {/* Technologies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Technológie</h4>
            <ul className="space-y-1.5 text-xs text-gray-500 font-mono">
              <li className="hover:text-neuro-blue transition-colors cursor-pointer">• React 18</li>
              <li className="hover:text-neuro-blue transition-colors cursor-pointer">• Three.js + R3F</li>
              <li className="hover:text-neuro-blue transition-colors cursor-pointer">• TypeScript</li>
              <li className="hover:text-neuro-blue transition-colors cursor-pointer">• Tailwind CSS</li>
              <li className="hover:text-neuro-blue transition-colors cursor-pointer">• Vite</li>
            </ul>
          </div>
          
          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Funkcie</h4>
            <ul className="space-y-1.5 text-xs text-gray-500 font-mono">
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">• Rast v reálnom čase</li>
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">• Adaptívne učenie</li>
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">• Neurálna plasticita</li>
              <li className="hover:text-neuro-purple transition-colors cursor-pointer">• Živá simulácia</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600 font-mono">
            © {currentYear} NeuroBloom · <span className="text-gray-500">Vzdelávací projekt</span>
          </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-neuro-blue" />
              <div className="w-1 h-3 bg-neuro-purple" />
              <div className="w-1 h-3 bg-neuro-green" />
            </div>
            <span className="text-xs text-gray-600 font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
