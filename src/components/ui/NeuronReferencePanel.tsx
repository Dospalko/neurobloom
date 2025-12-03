import { ActivationFocus } from "../../hooks/useNeuralNetwork";
import { Neuron } from "../../simulation/types";

interface NeuronReferencePanelProps {
  neurons: Neuron[];
  liveFocus: ActivationFocus | null;
  selectedNeuronId: string | null;
  onSelectNeuron: (id: string | null) => void;
}

const typeStyles: Record<Neuron["type"], { label: string; chip: string; text: string }> = {
  input: { label: "Input", chip: "bg-neuro-blue/20 text-neuro-blue border-neuro-blue/40", text: "text-neuro-blue" },
  hidden: { label: "Hidden", chip: "bg-neuro-purple/20 text-neuro-purple border-neuro-purple/40", text: "text-neuro-purple" },
  output: { label: "Output", chip: "bg-neuro-green/20 text-neuro-green border-neuro-green/40", text: "text-neuro-green" },
};

const formatId = (id: string) => id.split("_").slice(-1)[0]?.toUpperCase() ?? id;

const NeuronReferencePanel = ({
  neurons,
  liveFocus,
  selectedNeuronId,
  onSelectNeuron,
}: NeuronReferencePanelProps) => {
  const selectedNeuron = neurons.find((n) => n.id === selectedNeuronId);

  return (
    <div className="glass-effect rounded-2xl p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Neuron Reference</h3>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">Live activity + pins</p>
        </div>
        <div className="px-2 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono text-gray-300">
          {neurons.length} nodes
        </div>
      </div>

      {/* Live focus */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neuro-green animate-pulse" />
            <span className="text-xs font-semibold text-white">Live activation</span>
          </div>
          {liveFocus && (
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${typeStyles[liveFocus.type].chip}`}>
              {typeStyles[liveFocus.type].label}
            </span>
          )}
        </div>

        {liveFocus ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                #{formatId(liveFocus.id)}
              </p>
              <p className="text-[11px] text-gray-400">
                Aktivácia {Math.round(liveFocus.activation * 100)}% • Spojenia {liveFocus.connectionCount}
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                Pos: {liveFocus.position.x.toFixed(1)}, {liveFocus.position.y.toFixed(1)}, {liveFocus.position.z.toFixed(1)}
              </p>
            </div>
            <button
              onClick={() => onSelectNeuron(liveFocus.id)}
              className="px-3 py-1 text-[11px] font-semibold rounded-lg bg-neuro-purple/20 border border-neuro-purple/50 text-white hover:bg-neuro-purple/30 transition"
            >
              Pin live
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">Spusti tréning alebo algoritmus a uvidíš najaktívnejší neurón.</p>
        )}
      </div>

      {/* Selected neuron */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Pinned neuron</span>
          {selectedNeuron && (
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${typeStyles[selectedNeuron.type].chip}`}>
              {typeStyles[selectedNeuron.type].label}
            </span>
          )}
        </div>

        {selectedNeuron ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">#{formatId(selectedNeuron.id)}</span>
              <span className="font-mono text-neuro-green">{(selectedNeuron.activation * 100).toFixed(1)}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                <span>Health</span>
                <span className={selectedNeuron.health > 0.7 ? "text-neuro-green font-semibold" : "text-yellow-400 font-semibold"}>
                  {(selectedNeuron.health * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                <span>Training</span>
                <span className="font-mono text-white">{selectedNeuron.trainingCount}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                <span>Connections</span>
                <span className="font-mono text-white">{selectedNeuron.connections.length}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                <span>Type</span>
                <span className={`${typeStyles[selectedNeuron.type].text} font-semibold`}>{typeStyles[selectedNeuron.type].label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400">Klikni neurón v 3D scéne alebo použi Pin live.</p>
              <button
                onClick={() => onSelectNeuron(null)}
                className="text-[11px] text-gray-300 hover:text-white underline decoration-dashed"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-gray-400">
            Klikni na neurón v scéne, aby si ho pripol a sledoval jeho metriky počas tréningu.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/5 bg-gradient-to-r from-white/5 to-white/0 p-3 text-[11px] text-gray-300 space-y-1">
        <div className="flex items-center gap-2 text-white font-semibold text-xs">
          <div className="w-1.5 h-1.5 bg-neuro-blue rounded-full" />
          <span>Training guide</span>
        </div>
        <p>• Sleduj badge “Live activation” – ukazuje aktuálne najaktívnejší uzol.</p>
        <p>• Pinni ho alebo iný neurón a uvidíš jeho zdravie, počet tréningov a spojení.</p>
        <p>• Počas tréningu hľadaj uzly s vysokou aktiváciou, no nízkym health – môžu potrebovať pridať susedov.</p>
      </div>
    </div>
  );
};

export default NeuronReferencePanel;
