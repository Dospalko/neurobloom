# NeuroBloom

Vizualno bohatá experimentálna stránka postavená na Reacte a Three.js, ktorá zobrazuje rast umelej neurónovej siete ako keby bola živým organizmom. Každý neurón pulzuje, dýcha a vytvára synaptické spojenia reagujúce na vstupné podnety.

## Rýchly štart

1. Nainštalujte závislosti:

   ```bash
   npm install
   ```

2. Spustite dev server:

   ```bash
   npm run dev
   ```

3. Otvorte prehliadač na adrese `http://localhost:5173`.

## Architektúra

- `src/App.tsx` – rozloženie stránky, hero sekcia, sprievodné texty.
- `src/components/NeuroBloomScene.tsx` – Three.js scéna s rastúcou a dýchajúcou neurónovou sieťou.
- `src/styles/` – globálne štýly a dizajn pre jednotlivé sekcie.

## Dizajnové princípy

- **Organický rast:** neuróny sa pridávajú postupne, menia farbu podľa aktivácie a pulzujú podobne ako živé organizmy.
- **Synaptické väzby:** spojenia využívajú jemný shader s gradientom a priehľadnosťou, ktorý reaguje na aktivitu.
- **Atmosféra:** tmavé pozadie, neonové akcenty a jemné prechody podporujú futuristickú estetiku.

## Ďalšie nápady

- Prepojiť simuláciu s reálnymi dátami alebo interaktívnymi vstupmi.
- Pridať panel s možnosťami ovládania rýchlosti rastu a intenzity aktivácie.
- Exportovať animácie alebo momentky siete ako obrázky.
