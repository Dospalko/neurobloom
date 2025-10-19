import { NetworkStats as StatsType } from "../../simulation/types";

interface StatsDisplayProps {
  stats: StatsType;
}

const StatsDisplay = ({ stats }: StatsDisplayProps) => {
  // Progress bar komponenta
  const ProgressBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-300 rounded-full`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  );

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
      </div>
      
      {/* Progress bars */}
      <div className="space-y-3 pt-2">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Aktivácia</span>
            <span className="text-neuro-pink font-mono">
              {(stats.averageActivation * 100).toFixed(1)}%
            </span>
          </div>
          <ProgressBar value={stats.averageActivation} color="bg-gradient-to-r from-neuro-cyan to-neuro-pink" />
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Zdravie</span>
            <span className={`font-mono ${
              stats.averageHealth > 0.7 ? 'text-green-400' : 
              stats.averageHealth > 0.4 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {(stats.averageHealth * 100).toFixed(1)}%
            </span>
          </div>
          <ProgressBar 
            value={stats.averageHealth} 
            color={
              stats.averageHealth > 0.7 ? 'bg-green-500' : 
              stats.averageHealth > 0.4 ? 'bg-yellow-500' : 
              'bg-red-500'
            } 
          />
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Presnosť</span>
            <span className="text-white font-mono">
              {(stats.accuracy * 100).toFixed(2)}%
            </span>
          </div>
          <ProgressBar value={stats.accuracy} color="bg-gradient-to-r from-neuro-purple to-neuro-cyan" />
        </div>
      </div>
      
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Tréningové epochy</span>
          <span className="text-sm font-mono text-white">{stats.trainingEpochs}</span>
        </div>
      </div>
      
      {/* Upozornenia */}
      {stats.isOverfitted && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 animate-pulse">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span><strong>Overtraining!</strong> Príliš prispôsobená tréningovým dátam</span>
          </p>
        </div>
      )}
      
      {stats.isUnderfitted && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
          <p className="text-sm text-yellow-300 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span><strong>Undertraining!</strong> Sieť sa ešte nedostatočne naučila</span>
          </p>
        </div>
      )}
      
      {!stats.isOverfitted && !stats.isUnderfitted && stats.trainingEpochs > 0 && stats.accuracy > 0.8 && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <p className="text-sm text-green-300 flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span><strong>Výborné!</strong> Sieť sa učí optimálne</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
