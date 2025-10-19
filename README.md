# 🧠 NeuroBloom

**Interaktívna vizualizácia živej neurónovej siete** – simulácia AI, ktorá rastie, učí sa, starne a degraduje v reálnom čase. Postavené na React, Three.js a TypeScript.

![NeuroBloom Preview](https://img.shields.io/badge/status-live-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Three.js](https://img.shields.io/badge/Three.js-WebGL-red)

---

## 🚀 Rýchly štart

```bash
# Inštalácia
npm install

# Spustenie dev servera
npm run dev

# Build pre produkciu
npm run build
```

Otvor prehliadač na `http://localhost:5173`

---

## 🎮 Ako to funguje

### 1. **Začni s jedným neurónom**
   - Pri spustení máš jeden input neurón
   - Klikni na tlačidlá INPUT, HIDDEN alebo OUTPUT pre pridanie neurónov
   - Neuróny sa automaticky prepoja s existujúcimi

### 2. **Trénovanie siete**
   - Stlač **"Spustiť tréning"** a sleduj ako sa sieť učí
   - Váhy spojení sa menia, neuróny pulzujú podľa aktivácie
   - Sleduj štatistiky: presnosť, zdravie, epochy

### 3. **Sleduj degradáciu**
   - Neuróny časom starnú (age rastie)
   - Zdravie klesá, farba sa mení na červenú
   - Overtraining = príliš veľa trénovania
   - Undertraining = nedostatočné učenie

---

## 📁 Štruktúra projektu

```
src/
├── components/
│   ├── three/                    # 3D Three.js komponenty
│   │   ├── Neuron.tsx           # Vizualizácia jedného neurónu
│   │   ├── Connection.tsx       # Spojenia medzi neurónmi
│   │   └── NeuralNetworkScene.tsx # Hlavná 3D scéna
│   └── ui/                       # UI komponenty
│       ├── ControlPanel.tsx     # Ovládacie prvky
│       └── StatsDisplay.tsx     # Štatistiky siete
├── simulation/                   # Simulačná logika
│   ├── types.ts                 # TypeScript typy
│   └── neuralNetwork.ts         # AI algoritmy
├── hooks/
│   └── useNeuralNetwork.ts      # React hook pre správu siete
└── styles/
    └── global.css               # Tailwind štýly
```

---

## 🎨 Vizuálne featury

### Neuróny
- **Pulzovanie** podľa aktivácie (0-1)
- **Farba** podľa typu:
  - 🔵 Cyan = Input neuróny
  - 🟣 Purple = Hidden neuróny
  - 🔴 Pink = Output neuróny
- **Zdravie** - červená farba = degradácia
- **Glow efekt** pri vysokej aktivácii

### Spojenia
- **Modré** = pozitívna váha (+)
- **Červené** = negatívna váha (-)
- **Opacity** = sila spojenia
- **Animované** podľa aktivácie

### Scéna
- Auto-rotácia kamery
- OrbitControls (drag, zoom, pan)
- Dynamické osvetlenie
- Gradient pozadie

---

## � Simulované procesy

### Učenie sa (Training)
```typescript
- Forward propagation cez sieť
- Aktivačná funkcia: Sigmoid
- Backpropagation: Update váh
- Learning rate: 0.1
- Epochy sa počítajú v reálnom čase
```

### Starnutie (Aging)
```typescript
- Každú sekundu: age += 1
- Zdravie klesá po 5 minútach
- health = f(age, trainingCount)
- Farba interpoluje do červenej
```

### Overtraining / Undertraining
```typescript
- Overtraining: trainingAccuracy - validationAccuracy > 15%
- Undertraining: trainingAccuracy < 70% po 50 epochách
- Vizuálne upozornenia v UI
```

---

## 🛠️ Technológie

| Technológia | Použitie |
|-------------|----------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Three.js** | 3D grafika (WebGL) |
| **React Three Fiber** | React renderer pre Three.js |
| **React Three Drei** | Helper komponenty |
| **Tailwind CSS** | Styling |
| **Vite** | Build tool |

---

## 📊 Metriky siete

- **Total Neurons** - počet neurónov v sieti
- **Total Connections** - počet synaptických spojení
- **Average Activation** - priemerná aktivácia (0-100%)
- **Average Health** - priemerné zdravie (0-100%)
- **Training Epochs** - počet tréningových epoch
- **Accuracy** - presnosť siete (0-100%)

---

## 🎯 Budúce vylepšenia

- [ ] Import/export architektúr siete
- [ ] Vlastné tréningovacie dáta
- [ ] Rôzne aktivačné funkcie (ReLU, Tanh, Softmax)
- [ ] Vizualizácia gradientov
- [ ] Zvukové efekty pri aktivácii
- [ ] Rôzne architektúry (CNN, RNN, Transformer)
- [ ] Uloženie stavu do localStorage
- [ ] Video export animácie

---

## 📝 Licencia

MIT License - Vytvorené pre vzdelávacie účely

---

**Autor:** Dospalko  
**Rok:** 2025  
**Web:** [github.com/Dospalko/neurobloom](https://github.com/Dospalko/neurobloom)
