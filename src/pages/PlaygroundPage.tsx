import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaygroundScene from "../components/three/PlaygroundScene";

const DATASETS = [
  { id: "clusters", label: "Clusters", swatch: "linear-gradient(135deg, #ffb74a, #00b4d8)" },
  { id: "circles", label: "Circles", swatch: "radial-gradient(circle at 30% 30%, #00b4d8, #0b0c10 60%)" },
  { id: "xor", label: "XOR", swatch: "linear-gradient(135deg, #ff6b9d 0%, #0b0c10 50%, #4ade80 100%)" },
  { id: "spiral", label: "Spiral", swatch: "conic-gradient(from 45deg, #ffb74a, #00d4ff, #b565ff, #ffb74a)" },
];

const ACTIVATIONS = ["ReLU", "Sigmoid", "Tanh", "Swish"];
const PROBLEMS = ["Classification", "Regression"];

const PlaygroundPage = () => {
  const navigate = useNavigate();

  const [hiddenLayers, setHiddenLayers] = useState<number[]>([3, 4, 3]);
  const layers = useMemo(() => [2, ...hiddenLayers, 1], [hiddenLayers]);

  const [activations, setActivations] = useState<number[][]>(() =>
    layers.map((count) => Array.from({ length: count }, () => Math.random()))
  );

  const [isTraining, setIsTraining] = useState(false);
  const [dataset, setDataset] = useState<string>(DATASETS[0].id);
  const [activationFn, setActivationFn] = useState(ACTIVATIONS[0]);
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [learningRate, setLearningRate] = useState(0.03);
  const [epoch, setEpoch] = useState(148);
  const [loss, setLoss] = useState(0.12);
  const [testLoss, setTestLoss] = useState(0.18);
  const [accuracy, setAccuracy] = useState(0.76);
  const [trainSplit, setTrainSplit] = useState(50);
  const [noise, setNoise] = useState(0);
  const [batchSize, setBatchSize] = useState(16);

  // keep activations aligned with layer sizes
  useEffect(() => {
    setActivations((prev) =>
      layers.map((count, layerIdx) => {
        const prevLayer = prev[layerIdx] || [];
        return Array.from({ length: count }, (_, i) => prevLayer[i] ?? Math.random());
      })
    );
  }, [layers]);

  // training animation
  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
      setActivations((prev) =>
        prev.map((layer) =>
          layer.map((a) => Math.max(0, Math.min(1, a + (Math.random() - 0.5) * 0.08)))
        )
      );
      setEpoch((e) => e + 3);
      setLoss((l) => Math.max(0.01, l * 0.985 + Math.random() * 0.01));
      setTestLoss((l) => Math.max(0.01, l * 0.99 + Math.random() * 0.008));
      setAccuracy((a) => Math.min(0.99, a + Math.random() * 0.01));
    }, 120);
    return () => clearInterval(interval);
  }, [isTraining]);

  const layerChips = hiddenLayers.map((count, idx) => ({ index: idx, count }));

  const addLayer = () => {
    if (hiddenLayers.length >= 6) return;
    setHiddenLayers((prev) => [...prev, 3]);
  };

  const removeLayer = () => {
    if (hiddenLayers.length <= 1) return;
    setHiddenLayers((prev) => prev.slice(0, -1));
  };

  const adjustLayer = (idx: number, delta: number) => {
    setHiddenLayers((prev) =>
      prev.map((n, i) => (i === idx ? Math.max(1, Math.min(10, n + delta)) : n))
    );
  };

  return (
    <div className="min-h-screen bg-neuro-dark text-white flex flex-col">
      {/* Hero bar */}
      <div className="bg-[#143646] text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">Neural playground</p>
          <h1 className="text-3xl font-semibold">Tinker with a neural network right in your browser.</h1>
          <p className="text-white/80">No backend, just visuals. Adjust layers, datasets, and watch activations flow.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-6 space-y-4 flex-1">
        {/* Toolbar */}
        <div className="panel p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEpoch(0); setLoss(0.2); setTestLoss(0.25); setAccuracy(0.6); }}
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:border-white/40 transition"
              aria-label="Reset"
            >
              ?
            </button>
            <button
              onClick={() => setIsTraining((v) => !v)}
              className="w-12 h-12 rounded-full bg-neuro-blue text-white font-bold flex items-center justify-center shadow-lg shadow-neuro-blue/30"
              aria-label="Play/Pause"
            >
              {isTraining ? "??" : "?"}
            </button>
            <button
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-lg text-gray-300"
              aria-label="Step"
            >
              ?
            </button>
            <div className="ml-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Epoch</p>
              <p className="text-xl font-mono">{epoch.toString().padStart(6, '0')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 min-w-[280px]">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-gray-500">Learning rate</p>
              <select
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm"
              >
                {[0.01, 0.02, 0.03, 0.05].map((lr) => (
                  <option key={lr} value={lr} className="bg-neuro-dark">{lr.toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-gray-500">Activation</p>
              <select
                value={activationFn}
                onChange={(e) => setActivationFn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm"
              >
                {ACTIVATIONS.map((a) => (
                  <option key={a} value={a} className="bg-neuro-dark">{a}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-gray-500">Regularization</p>
              <select className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm">
                <option className="bg-neuro-dark">None</option>
                <option className="bg-neuro-dark">L1</option>
                <option className="bg-neuro-dark">L2</option>
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-gray-500">Reg. rate</p>
              <input
                type="number"
                value={0}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm text-gray-400"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-gray-500">Problem</p>
              <select
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm"
              >
                {PROBLEMS.map((p) => (
                  <option key={p} value={p} className="bg-neuro-dark">{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-gray-500">Batch size</p>
              <input
                type="range"
                min={4}
                max={64}
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
                className="w-full accent-neuro-blue"
              />
              <p className="text-xs text-gray-400">{batchSize}</p>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Data column */}
          <div className="lg:col-span-3 panel p-4 space-y-4">
            <div>
              <p className="text-[11px] uppercase text-gray-500 font-mono">Data</p>
              <p className="text-sm text-gray-300">Which dataset?</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {DATASETS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDataset(d.id)}
                    className={`h-16 rounded-lg border transition ${dataset === d.id ? 'border-neuro-blue shadow-lg shadow-neuro-blue/30' : 'border-white/10 hover:border-white/25'}`}
                    style={{ backgroundImage: d.swatch, backgroundSize: 'cover' }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase text-gray-500">Train / Test split</label>
              <input
                type="range"
                min={10}
                max={90}
                value={trainSplit}
                onChange={(e) => setTrainSplit(parseInt(e.target.value, 10))}
                className="w-full accent-neuro-blue"
              />
              <p className="text-xs text-gray-400">Training {trainSplit}% / Test {100 - trainSplit}%</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase text-gray-500">Noise</label>
              <input
                type="range"
                min={0}
                max={100}
                value={noise}
                onChange={(e) => setNoise(parseInt(e.target.value, 10))}
                className="w-full accent-neuro-blue"
              />
              <p className="text-xs text-gray-400">{noise}%</p>
            </div>
          </div>

          {/* Network center */}
          <div className="lg:col-span-6 panel p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[11px] uppercase text-gray-500 font-mono">Hidden layers</p>
                <div className="flex items-center gap-2">
                  <button onClick={addLayer} className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40">+</button>
                  <span className="text-sm text-gray-300">{hiddenLayers.length}</span>
                  <button onClick={removeLayer} className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40">-</button>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">Input 2 ? Output 1</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {layerChips.map((chip) => (
                <div key={chip.index} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm">
                  <span>Layer {chip.index + 1}: {chip.count} neurons</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => adjustLayer(chip.index, 1)} className="w-7 h-7 rounded-full border border-white/10 hover:border-white/30">+</button>
                    <button onClick={() => adjustLayer(chip.index, -1)} className="w-7 h-7 rounded-full border border-white/10 hover:border-white/30">-</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 h-[420px]">
              <PlaygroundScene layers={layers} activations={activations} isTraining={isTraining} />
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-3 panel p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase text-gray-500 font-mono">Output</p>
              <div className="text-right text-xs text-gray-400">
                <p>Test loss {testLoss.toFixed(3)}</p>
                <p>Training loss {loss.toFixed(3)}</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1f2a44] via-[#1c2b3a] to-[#0b0c10] h-56 relative">
              <svg viewBox="0 0 200 200" className="absolute inset-0">
                <defs>
                  <linearGradient id="plane" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffb74a" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="200" height="200" fill="url(#plane)" opacity="0.65" />
                {[...Array(35)].map((_, i) => {
                  const x = Math.random() * 200;
                  const y = Math.random() * 200;
                  const isBlue = i % 2 === 0;
                  return <circle key={i} cx={x} cy={y} r={3} fill="none" stroke={isBlue ? '#0ff' : '#ffb74a'} strokeWidth={1.2} />;
                })}
              </svg>
              <div className="absolute bottom-2 right-2 text-[10px] text-gray-300 bg-black/30 px-2 py-1 rounded">Decision surface (mock)</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="panel-subtle p-3 border-white/10">Activation: {activationFn}</div>
              <div className="panel-subtle p-3 border-white/10">Accuracy: {(accuracy * 100).toFixed(1)}%</div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Outputs show a mock decision boundary and scatter. Training is simulated for visuals only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;
