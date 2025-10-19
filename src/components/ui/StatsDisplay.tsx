import { NetworkStats as StatsType } from "../../simulation/types";

interface StatsDisplayProps {
  stats: StatsType;
}

const StatsDisplay = ({ stats }: StatsDisplayProps) => {
  return (
    <div className="glass-effect rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-bold gradient-text mb-4">Štatistiky siete</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Neuróny</p>
          <p className="text-2xl font-bold text-neuro-cyan">{stats.totalNeurons}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Spojenia</p>
          <p className="text-2xl font-bold text-neuro-purple">{stats.totalConnections}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Priemer aktivácia</p>
          <p className="text-2xl font-bold text-neuro-pink">
            {(stats.averageActivation * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Zdravie</p>
          <p className={`text-2xl font-bold ${stats.averageHealth > 0.7 ? 'text-green-400' : stats.averageHealth > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
            {(stats.averageHealth * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Tréningové epochy</span>
          <span className="text-sm font-mono text-white">{stats.trainingEpochs}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Presnosť</span>
          <span className="text-sm font-mono text-white">
            {(stats.accuracy * 100).toFixed(2)}%
          </span>
        </div>
      </div>
      
      {/* Upozornenia */}
      {stats.isOverfitted && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span><strong>Overtraining:</strong> Sieť je príliš prispôsobená tréningovým dátam!</span>
          </p>
        </div>
      )}
      
      {stats.isUnderfitted && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
          <p className="text-sm text-yellow-300 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span><strong>Undertraining:</strong> Sieť sa ešte nedostatočne naučila!</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
