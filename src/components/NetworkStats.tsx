const NetworkStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 py-12 max-w-6xl mx-auto">
      <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-gray-400 uppercase tracking-wider">stav</span>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
        <span className="text-2xl font-bold text-white group-hover:gradient-text transition-all">
          adaptívna aktivácia
        </span>
      </div>
      
      <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-gray-400 uppercase tracking-wider">neuróny</span>
          <div className="w-3 h-3 bg-neuro-cyan rounded-full animate-pulse delay-75" />
        </div>
        <span className="text-2xl font-bold text-white group-hover:text-neuro-cyan transition-all">
          420+
        </span>
      </div>
      
      <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-gray-400 uppercase tracking-wider">spojenia</span>
          <div className="w-3 h-3 bg-neuro-purple rounded-full animate-pulse delay-100" />
        </div>
        <span className="text-2xl font-bold text-white group-hover:text-neuro-purple transition-all">
          260+
        </span>
      </div>
      
      <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-gray-400 uppercase tracking-wider">aktivita</span>
          <div className="w-3 h-3 bg-neuro-pink rounded-full animate-pulse delay-150" />
        </div>
        <span className="text-2xl font-bold text-white group-hover:text-neuro-pink transition-all">
          98.7%
        </span>
      </div>
    </div>
  );
};

export default NetworkStats;

