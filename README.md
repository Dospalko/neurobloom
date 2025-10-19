# NeuroBloom

Vizuálne bohatá experimentálna stránka postavená na Reacte, Three.js a Tailwind CSS, ktorá zobrazuje rast umelej neurónovej siete ako keby bola živým organizmom. Každý neurón pulzuje, dýcha a vytvára synaptické spojenia reagujúce na vstupné podnety.

## 🚀 Rýchly štart

1. Nainštalujte závislosti:

   ```bash
   npm install
   ```

2. Spustite dev server:

   ```bash
   npm run dev
   ```

3. Otvorte prehliadač na adrese `http://localhost:5173`.

## 📁 Štruktúra projektu

```
src/
├── components/
│   ├── NeuroBloomScene.tsx    # Three.js 3D scéna s neurónovou sieťou
│   ├── Hero.tsx                # Hlavná hero sekcia
│   ├── InfoSection.tsx         # Info sekcie s popismi
│   ├── NetworkStats.tsx        # Štatistiky siete
│   └── Footer.tsx              # Päta stránky
├── styles/
│   └── global.css              # Globálne Tailwind štýly
└── App.tsx                     # Hlavný komponent aplikácie
```

## 🎨 Technológie

- **React 18** - Moderný UI framework
- **Three.js** - 3D WebGL grafika
- **React Three Fiber** - React renderer pre Three.js
- **React Three Drei** - Pomocné komponenty pre R3F
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Bleskovo rýchly build tool

## 🧠 Dizajnové princípy

- **Organický rast:** Neuróny sa pridávajú postupne, menia farbu podľa aktivácie a pulzujú podobne ako živé organizmy
- **Synaptické väzby:** Spojenia využívajú jemný shader s gradientom a priehľadnosťou, ktorý reaguje na aktivitu
- **Atmosféra:** Tmavé pozadie, neonové akcenty (cyan, purple, pink) a jemné prechody podporujú futuristickú estetiku
- **Responzívny dizajn:** Optimalizované pre desktop aj mobilné zariadenia

## 🎯 Features

- ✨ 420+ dynamických neurónov
- 🔗 260+ synaptických spojení
- 🌊 Dýchacia animácia celej siete
- 🎨 Gradientové farby reagujúce na aktiváciu
- 📊 Real-time štatistiky siete
- 🎮 Interaktívna 3D scéna s OrbitControls

## 💡 Ďalšie nápady

- Prepojiť simuláciu s reálnymi dátami alebo interaktívnymi vstupmi
- Pridať panel s možnosťami ovládania rýchlosti rastu a intenzity aktivácie
- Exportovať animácie alebo momentky siete ako obrázky
- Pridať zvukové efekty reagujúce na aktiváciu neurónov
- Implementovať rôzne architektúry neurónových sietí (CNN, RNN, Transformer)
