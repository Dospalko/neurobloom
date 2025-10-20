const NetworkStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-12 max-w-6xl mx-auto">
      <div className="group relative overflow-hidden glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border border-white/10">
        <div className="absolute top-0 right-0 w-16 h-16 bg-neuro-green/20 rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-500" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">STATUS</span>
            <div className="w-2 h-2 bg-neuro-green rounded-full animate-pulse" />
          </div>
          <span className="text-lg font-bold text-white block">
            Adaptive
          </span>
          <span className="text-xs text-gray-500 font-mono">activation</span>
        </div>
      </div>
      
      <div className="group relative overflow-hidden glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border border-white/10">
        <div className="absolute top-0 right-0 w-16 h-16 bg-neuro-blue/20 rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-500" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">NEURONS</span>
            <div className="w-2 h-2 border border-neuro-blue rounded-full animate-pulse delay-75" />
          </div>
          <span className="text-lg font-bold text-white block font-mono">
            420+
          </span>
          <span className="text-xs text-gray-500 font-mono">active nodes</span>
        </div>
      </div>
      
      <div className="group relative overflow-hidden glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border border-white/10">
        <div className="absolute top-0 right-0 w-16 h-16 bg-neuro-purple/20 rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-500" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">CONNECTIONS</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-neuro-purple rounded-full animate-pulse delay-100" />
              <div className="w-1 h-1 bg-neuro-purple rounded-full animate-pulse" />
            </div>
          </div>
          <span className="text-lg font-bold text-white block font-mono">
            260+
          </span>
          <span className="text-xs text-gray-500 font-mono">synapses</span>
        </div>
      </div>
      
      <div className="group relative overflow-hidden glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border border-white/10">
        <div className="absolute top-0 right-0 w-16 h-16 bg-neuro-blue/20 rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-500" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">ACTIVITY</span>
            <div className="w-2 h-0.5 bg-neuro-blue animate-pulse delay-150" />
          </div>
          <span className="text-lg font-bold text-white block font-mono">
            98.7%
          </span>
          <span className="text-xs text-gray-500 font-mono">uptime</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;

