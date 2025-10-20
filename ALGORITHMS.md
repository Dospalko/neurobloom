# NeuroBloom - Vizualizačné Algoritmy

## 🎨 Prehľad algoritmov

NeuroBloom obsahuje 5 predprogramovaných vizualizačných algoritmov, ktoré demonštrujú rôzne vzory aktivácie v neurónových sieťach.

### 1. **Wave Propagation** 🌊
- **Farba**: Modrá (#4A9EFF)
- **Trvanie**: 5 sekúnd
- **Popis**: Vlny aktivácie sa šíria od stredu siete radiálne von
- **Vizuálny efekt**: Neuróny sa postupne sfarbujú na modro pri prechode vlny
- **Simuluje**: Šírenie signálu v nervovom systéme

### 2. **Spiral Growth** 🌀
- **Farba**: Fialová → Modrá → Zelená
- **Trvanie**: 6 sekúnd
- **Popis**: Rotujúca špirála s farebným gradientom
- **Vizuálny efekt**: Hypnotický farebný prechod vytvárajúci špirálový vzor
- **Simuluje**: Organický rast a difúzne vzory v biológii

### 3. **Cascade Activation** ⚡
- **Farba**: Zelená → Oranžová
- **Trvanie**: 4 sekundy
- **Popis**: Sekvenčná aktivácia od najstarších k najnovším neurónom
- **Vizuálny efekt**: Kaskádový efekt s farebným prechodom
- **Simuluje**: Učenie a spracovanie informácií vo vrstvách

### 4. **Pulse Network** 💓
- **Farba**: Ružová ↔ Fialová
- **Trvanie**: 8 sekúnd
- **Popis**: Synchronizované pulzovanie celej siete
- **Vizuálny efekt**: Rytmické striedanie farieb
- **Simuluje**: Mozgové vlny počas spánku alebo meditácie

### 5. **Random Walker** 🎲
- **Farba**: Oranžová → Zelená
- **Trvanie**: 7 sekúnd
- **Popis**: Náhodné šírenie aktivácie cez susedné neuróny
- **Vizuálny efekt**: Chaotické, ale plynulé šírenie farby
- **Simuluje**: Spontánnu neurónovú aktivitu a difúziu

## 🚀 Ako použiť

1. **Spustenie algoritmu**:
   - Otvor panel "Algorithms" v pravom slidebaru
   - Vyber algoritmus kliknutím na jeho názov
   - Prečítaj si popis a klikni na "Run Algorithm"

2. **Automatické vytvorenie neurónov**:
   - Ak máš menej ako 30 neurónov, algoritmus ich automaticky vytvorí
   - Neuróny sa usporiadajú do sférickej formácie
   - Automaticky sa vytvoria spojenia medzi najbližšími neurónmi

3. **Sledovanie vizualizácie**:
   - Pozorovaj ako sa menia farby neurónov
   - Sleduj aktiváciu (žiaru) jednotlivých neurónov
   - Rotuj scénu pomocou myši pre lepší pohľad

4. **Zastavenie**:
   - Klikni na "Stop" tlačidlo
   - Neuróny sa vrátia do pôvodného stavu

## 🎯 Technické detaily

### Implementácia farieb
- Každý algoritmus používa `THREE.Color` interpoláciu
- Farby sa plynule menia pomocou `lerp()` funkcie
- Originálne farby sa ukladajú a obnovujú po ukončení

### Výkonnosť
- Optimalizované pre 30-50 neurónov
- Refresh rate: ~60 FPS (16ms interval)
- Minimálne výpočetné nároky vďaka Three.js

### Prispôsobenie
Chceš vytvoriť vlastný algoritmus? Pozri sa na:
```typescript
src/algorithms/algorithmRunner.ts
```

Každý algoritmus má vlastnú metódu (napr. `wavePropaation()`, `spiralGrowth()`)
kde môžeš upraviť:
- Rýchlosť animácie
- Farebné schémy
- Vzory aktivácie
- Matematické funkcie

## 🎨 Farebná paleta

```
Modrá:     #4A9EFF
Fialová:   #9B6AFF
Zelená:    #5FE88C
Ružová:    #FF6B9D
Oranžová:  #FFB74A
```

---

**Tip**: Skús spustiť viacero algoritmov po sebe a sleduj rozdielne vzory!
