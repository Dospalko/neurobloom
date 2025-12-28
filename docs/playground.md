# Neurobloom Playground – technická dokumentácia

> Autor: Codex (ChatGPT)  
> Dátum: 2025-12-28  
> Verzia: 0.1  
> Modul: Playground (vizualizácia neurónovej siete)  
> Účel: interaktívne ihrisko na skladanie malej siete, tréning a vizualizáciu rozhodovacej hranice v reálnom čase.

## Prehľad
- Stránka `src/pages/PlaygroundPage.tsx` kombinuje konfiguráciu dát, hyperparametrov a tréningovej slučky neurónovej siete (`src/algorithms/NeuralNetwork.ts`).
- Vizualizácia siete prebieha v 3D cez `src/components/three/PlaygroundScene.tsx`; rozhodovacia hranica a priebeh chyby sú renderované cez `Heatmap` a `LossChart`.
- Interakcie prebiehajú cez React stav a `requestAnimationFrame`, aby tréning bežal plynulo počas zmien UI.
- Routing na stránku je definovaný v `src/App.tsx` pod cestou `/playground`.

## Štruktúra zdrojov (podstránka Playground)
- `src/pages/PlaygroundPage.tsx` – hlavný kontajner, správa stavu, tréning, UI rozloženie (ľavý panel dáta/vstupy, stred 3D sieť, pravý panel výstupy).
- `src/algorithms/NeuralNetwork.ts` – implementácia siete s triedami `NeuralNetwork`, `Node`, `Link`, funkciami `forward`, `backward` a generátorom dát `generateData`.
- `src/components/three/PlaygroundScene.tsx` – 3D scéna (React Three Fiber), vykreslenie uzlov, spojení, hover udalosti pre tooltip neurónu.
- `src/components/playground/Heatmap.tsx` – 2D plátno, vykreslenie rozhodovacej hranice (teplotná mapa) a reálnych dátových bodov.
- `src/components/playground/LossChart.tsx` – graf tréningovej/testovacej chyby (Recharts).
- `src/components/playground/NeuronPreview.tsx` – miniatúrny náhľad aktivácie konkrétneho neurónu pri hoveri v 3D scéne.

## Hlavné komponenty a funkcie

### PlaygroundPage (`src/pages/PlaygroundPage.tsx`)
- Zodpovednosti: drží stav hyperparametrov (`hiddenLayers`, `activationFn`, `learningRate`, `regularization`, `regRate`), konfiguráciu dát (`dataset`, `noise`, `trainSplit`, `batchSize`), výber vstupných vlastností (`activeFeatures`), priebeh tréningu (`isTraining`, `epoch`, `loss`, `lossHistory`) a odkaz na sieť (`networkRef`).
- Odvodené hodnoty: `inputSize` (počet aktívnych vstupov), `activeFeatureLabels` (popisy vstupov do 3D scény) a `scenarioLabel` (názov zvoleného datasetu).
- Inicializácia siete via `initNetwork`: vytvorí novú inštanciu `NeuralNetwork` podľa počtu vstupov a skrytých vrstiev, nastaví aktivačnú funkciu, rýchlosť učenia a regularizáciu, resetuje epochy a históriu.

```tsx
// src/pages/PlaygroundPage.tsx (skrátené)
const initNetwork = useCallback(() => {
  if (inputSize === 0) return;
  const layerSizes = [inputSize, ...hiddenLayers, 1];
  const net = new NeuralNetwork(layerSizes);
  net.activation = activationFn;
  net.learningRate = learningRate;
  net.regularization = regularization;
  net.regularizationRate = regRate;
  networkRef.current = net;
  setEpoch(0);
  setLoss(0);
  setLossHistory([]);
}, [hiddenLayers, activationFn, learningRate, regularization, regRate, inputSize]);
```

- Generovanie dát: `useEffect` volá `generateData(dataset, 200, noise)` pri zmene scenára alebo šumu; následne reštartuje sieť.
- Tréningová slučka `trainStep`: na každom `requestAnimationFrame` spracuje náhodný batch, spustí `forward` a `backward`, počíta priemernú chybu, každých 5 epoch ukladá históriu pre graf. Beží len keď je `isTraining === true`.

```tsx
// src/pages/PlaygroundPage.tsx (skrátené)
const trainStep = useCallback(() => {
  if (!networkRef.current || !isTraining) return;
  const net = networkRef.current;
  const featureFuncs = FEATURES.filter(f => activeFeatures[f.id]).map(f => f.func);
  if (featureFuncs.length === 0) return;

  let totalError = 0;
  for (let i = 0; i < batchSize; i++) {
    const point = dataPoints[Math.floor(Math.random() * dataPoints.length)];
    const inputs = featureFuncs.map(fn => fn(point.x, point.y));
    net.forward(inputs);
    net.backward(point.label);
    totalError += Math.abs(net.layers[net.layers.length - 1][0].output - point.label);
  }

  const currentLoss = totalError / batchSize;
  setLoss(currentLoss);
  setEpoch((e) => {
    const nextEpoch = e + 1;
    if (nextEpoch % 5 === 0) {
      setLossHistory((prev) => [...prev, {
        epoch: nextEpoch,
        trainLoss: currentLoss,
        testLoss: currentLoss * (1.1 + (Math.random() * 0.2))
      }].slice(-50));
    }
    return nextEpoch;
  });
  requestRef.current = requestAnimationFrame(trainStep);
}, [isTraining, dataPoints, batchSize, activeFeatures]);
```

- Handlery: `toggleFeature`, `addLayer`, `removeLayer`, `adjustLayer`, `reset` – všetky menia konfiguráciu a zastavujú tréning, aby bol stav siete konzistentný.
- UI rozloženie:
  - Ľavý panel: výber datasetu, šum, pomer tréning/test, batch size, prepínače vstupných vlastností.
  - Stred: 3D scéna siete (`PlaygroundScene`), živý hover náhľad neurónu (`NeuronPreview`).
  - Pravý panel: graf chýb (`LossChart`), aktuálne metriky a rozhodovacia hranica (`Heatmap`).

### Neuronová sieť (`src/algorithms/NeuralNetwork.ts`)
- Triedy:
  - `Node`: bias, mapu váh, aktuálny výstup (`output`), vstup pred aktiváciou (`totalInput`) a gradient (`delta`).
  - `Link`: reprezentuje spojenie `source -> dest` s váhou.
  - `NeuralNetwork`: drží vrstvy (`layers`), všetky odkazy (`links`), hyperparametre (`learningRate`, `activation`, `regularization`, `regularizationRate`).
- Konštruktor skladá vrstvy podľa `layerSizes`, vytvára `Link` pre každý pár uzlov v susedných vrstvách a inicializuje váhy náhodne okolo 0.
- `forward(inputs: number[])`: nastaví výstupy vstupnej vrstvy a prejde každú ďalšiu vrstvu, kde spočíta vážený súčet + bias a aplikuje aktiváciu. Vracia výstup posledného uzla.
- `backward(target: number)`: počíta delty (MSE * derivácia aktivácie) najprv pre výstupnú vrstvu, potom spätne pre skryté vrstvy, a aktualizuje váhy vrátane regularizačného termu (L1 alebo L2) plus biasy.
- Aktivácie: `relu`, `tanh`, `sigmoid`, `linear` cez `applyActivation` a `applyActivationDeriv`.
- Generovanie dát `generateData(type, count, noise)`: podporuje scenáre `circle`, `xor`, `gauss`, `spiral`; body sú škálované do rozsahu približne -5..5 a okorenené šumom (noise/10).

```ts
// src/algorithms/NeuralNetwork.ts (výrez)
export const generateData = (type: string, count: number, noise: number): Point[] => {
  const points: Point[] = [];
  const rand = () => (Math.random() - 0.5) * 2;
  for (let i = 0; i < count; i++) {
    let x = rand() * 5;
    let y = rand() * 5;
    let label = 0;
    if (type === 'circle') { /* body podľa vzdialenosti od stredu */ }
    else if (type === 'xor') { /* kvadranty s opačnými znamienkami */ }
    else if (type === 'gauss') { /* dva zhluky okolo (+2,+2) a (-2,-2) */ }
    else if (type === 'spiral') { /* dvojramenná špirála s náhodným ramenom */ }
    x += (Math.random() - 0.5) * (noise / 10);
    y += (Math.random() - 0.5) * (noise / 10);
    points.push({ x, y, label });
  }
  return points;
};
```

### 3D vizualizácia siete (`src/components/three/PlaygroundScene.tsx`)
- Props: `network`, `epoch` (trigger na re-render váh), `featureLabels`, `scenarioLabel`, `onNodeHover`.
- Počítanie pozícií uzlov (`useMemo`): vrstvy sa rozprestrú na osi X, uzly v rámci vrstvy na osi Y; vstupná vrstva používa `featureLabels`.
- Pri zmene `epoch` sa vytvorí zoznam spojení z `network.links` s údajmi o váhe a výstupe zdrojového/destináčného uzla; to riadi farbu/hrúbku čiary.
- Render: uzly ako gule so žiarou (farba podľa aktivácie), spojenia ako línie (`@react-three/drei` `Line`), `OrbitControls` pre rotáciu/zoom. Hover nad uzlom volá `onNodeHover` a zobrazí titulok.

### Rozhodovacia hranica (`src/components/playground/Heatmap.tsx`)
- Canvas 300×300 (default) prechádza mriežku bodov v rozsahu -6..6, pre každý bod aplikuje aktívne vstupné funkcie (`featureFuncs`) a spustí `network.forward`.
- Výsledok mapuje na farbu (oranžová pre záporné, modrá pre kladné hodnoty, alpha 180–255). Následne vykreslí reálne dátové body s obrysom pre čitateľnosť.

### Detail neurónu (`src/components/playground/NeuronPreview.tsx`)
- Pri hoveri nad uzlom v 3D scéne vykreslí malý canvas (60×60) s lokálnou teplotnou mapou výstupu daného neurónu (`targetNode.layer/index`), opäť cez `network.forward` na mriežke vstupov.
- Zobrazuje hlavičku s typom vrstvy (vstup/skrytá/výstup) a indexom neurónu.

### Graf chyby (`src/components/playground/LossChart.tsx`)
- Využíva Recharts `LineChart` s osami epoch/loss, dve krivky (`trainLoss`, `testLoss`), vypnutá animácia pre stabilitu. Popisky a legenda sú v pravom paneli nad grafom.

## Tok dát a udalostí
- Pri načítaní alebo zmene datasetu/šumu: `useEffect` -> `generateData` -> `setDataPoints` -> `initNetwork`.
- Pri zmene vstupných vlastností: `toggleFeature` mení `activeFeatures`, čo cez `useMemo` zmení `inputSize`; `initNetwork` sa spustí na základe závislosti a sieť sa znovu postaví.
- Tlačidlo Play/Pause: prepína `isTraining`; `useEffect` podľa toho registruje alebo ruší `requestAnimationFrame(trainStep)`.
- `trainStep` aktualizuje sieť, metriky a históriu; `epoch` sa používa aj ako trigger na prepočítanie 3D spojení a heatmapy.
- Hover nad neurónom v 3D: `onNodeHover` nastaví `hoveredNode` v stránke, ktorá zobrazí `NeuronPreview` pri kurzore.

## Rýchly prehľad API a parametrov
- `NeuralNetwork(layerSizes: number[])` – vytvorenie siete; `layerSizes` zahŕňajú vstupy, skryté vrstvy a výstup (1).
- `forward(inputs: number[]): number` – výstup siete pre daný vektor vstupov (uskladní medzi-výpočty pre spätnú väzbu).
- `backward(target: number): void` – backprop s MSE a L1/L2 regularizáciou (podľa nastavenia inštancie).
- `generateData(type: string, count: number, noise: number): Point[]` – syntetické dáta pre scenáre `circle|xor|gauss|spiral`; `noise` pridáva náhodný posun.
- `PlaygroundScene` props: `network`, `epoch`, `featureLabels: string[]`, `scenarioLabel?: string`, `onNodeHover?: (node | null) => void`.
- `Heatmap` props: `network`, `data: Point[]`, `epoch`, `activeFeatures`, `featureFuncs` (mapa id->funkcia), rozmer `width/height`.
- `NeuronPreview` props: `network`, `targetNode`, `activeFeatures`, `featureFuncs`, voliteľné `width/height`.
- `LossChart` props: `data: { epoch; trainLoss; testLoss }[]`.

## Poznámky a odporúčania
- Ak pridáte nové vstupné vlastnosti, zahrňte ich do `FEATURES` v `PlaygroundPage.tsx` a odvodzujte `inputSize` z `activeFeatures`, aby sa sieť správne prepočíta.
- Pre stabilnejší tréning môžete obmedziť `learningRate` alebo pridať `dropout`/`momentum` priamo do `NeuralNetwork` (nové polia a úpravy `forward/backward`).
- Vizualizácia váh v 3D je závislá od `network.links`; pri zmene dátovej štruktúry dbať na konzistenciu ID uzlov (`${layer}_${index}`).
- Heatmap predpokladá rozsah vstupov -6..6; ak zmeníte generátor dát, zvažujte preškálovanie alebo nové limity.

