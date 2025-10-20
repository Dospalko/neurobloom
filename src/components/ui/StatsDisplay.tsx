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
    <div className="glass-effect rounded-2xl p-5 space-y-3 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-3">Network Stats</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Neurons</p>
          <p className="text-xl font-bold text-neuro-blue">{stats.totalNeurons}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Connections</p>
          <p className="text-xl font-bold text-neuro-purple">{stats.totalConnections}</p>
        </div>
      </div>
      
      {/* Progress bars */}
      <div className="space-y-2.5 pt-1">
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Activation</span>
            <span className="text-neuro-green font-mono font-bold">
              {(stats.averageActivation * 100).toFixed(1)}%
            </span>
          </div>
          <ProgressBar value={stats.averageActivation} color="bg-neuro-blue" />
        </div>
        
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Health</span>
            <span className={`font-mono font-bold ${
              stats.averageHealth > 0.7 ? 'text-neuro-green' : 
              stats.averageHealth > 0.4 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {(stats.averageHealth * 100).toFixed(1)}%
            </span>
          </div>
          <ProgressBar 
            value={stats.averageHealth} 
            color={
              stats.averageHealth > 0.7 ? 'bg-neuro-green' : 
              stats.averageHealth > 0.4 ? 'bg-yellow-500' : 
              'bg-red-500'
            } 
          />
        </div>
        
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Accuracy</span>
            <span className="text-white font-mono font-bold">
              {(stats.accuracy * 100).toFixed(2)}%
            </span>
          </div>
          <ProgressBar value={stats.accuracy} color="bg-neuro-purple" />
        </div>
      </div>
      
      <div className="pt-3 border-t border-white/10 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-xs text-gray-400">Training Epochs</span>
          <span className="text-xs font-mono text-white font-bold">{stats.trainingEpochs}</span>
        </div>
      </div>
      
      {/* Upozornenia */}
      {stats.isOverfitted && (
        <div className="relative overflow-hidden bg-red-500/10 border border-red-500/40 rounded-lg p-2.5 animate-pulse">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/50" />
          <p className="text-xs text-red-400 flex items-center gap-2">
            <div className="flex-shrink-0 w-1 h-1 bg-red-500 rounded-full animate-ping" />
            <span className="font-mono"><span className="text-white font-bold">ERROR:</span> Overfitting detected</span>
          </p>
        </div>
      )}
      
      {stats.isUnderfitted && (
        <div className="relative overflow-hidden bg-yellow-500/10 border border-yellow-500/40 rounded-lg p-2.5">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-yellow-500/50" />
          <p className="text-xs text-yellow-400 flex items-center gap-2">
            <div className="flex-shrink-0 w-1 h-1 bg-yellow-500 rounded-full" />
            <span className="font-mono"><span className="text-white font-bold">WARN:</span> Insufficient training</span>
          </p>
        </div>
      )}
      
      {!stats.isOverfitted && !stats.isUnderfitted && stats.trainingEpochs > 0 && stats.accuracy > 0.8 && (
        <div className="relative overflow-hidden bg-neuro-green/10 border border-neuro-green/40 rounded-lg p-2.5">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-neuro-green/50" />
          <p className="text-xs text-neuro-green flex items-center gap-2">
            <div className="flex-shrink-0 w-1 h-1 bg-neuro-green rounded-full animate-pulse" />
            <span className="font-mono"><span className="text-white font-bold">OK:</span> Optimal convergence</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
