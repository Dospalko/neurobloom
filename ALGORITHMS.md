# NeuroBloom - Interaktívne Vizualizačné Algoritmy

## ✨ Nové funkcie!

- 🎯 **Automatické vytváranie neurónov** - Algoritmy sami vytvoria 40 neurónov
- 🔄 **Postupné pridávanie** - Sleduj ako sa neuróny vytvárajú jeden po druhom (každých 50ms)
- 🎨 **Jasnejšie farby** - Žiarivé neonové farby pre lepšiu viditeľnosť
- 📊 **Live progress tracking** - Vidíš priebeh, počet neurónov a fázu algoritmu
- 💡 **Detailné vysvetlenia** - Každý algoritmus má podrobný popis priamo v overlay

## 🎨 Prehľad algoritmov

NeuroBloom obsahuje 5 predprogramovaných vizualizačných algoritmov, ktoré demonštrujú rôzne vzory aktivácie v neurónových sieťach.

### 1. **Wave Propagation** 🌊
- **Farba**: Jasná modrá (#00D4FF)
- **Trvanie**: 5 sekúnd
- **Popis**: Vlny aktivácie sa šíria od stredu siete radiálne von
- **Vizuálny efekt**: Neuróny sa postupne sfarbujú na žiarivú modro pri prechode vlny
- **Simuluje**: Šírenie elektrického signálu v nervovom systéme
- **Čo vidíš**: Pulzujúce modré vlny šíriace sa koncentricky von

### 2. **Spiral Growth** 🌀
- **Farba**: Jasná fialová → Jasná modrá → Jasná zelená
- **Trvanie**: 6 sekúnd
- **Popis**: Rotujúca špirála s plynulým farebným prechodom
- **Vizuálny efekt**: Hypnotický farebný gradient vytvárajúci špirálový vzor
- **Simuluje**: Organický rast a difúzne vzory v biológii
- **Čo vidíš**: Dúhový efekt rotujúci v špirále

### 3. **Cascade Activation** ⚡
- **Farba**: Jasná zelená → Oranžová
- **Trvanie**: 4 sekundy
- **Popis**: Postupná kaskádová aktivácia od najstarších k najnovším neurónom
- **Vizuálny efekt**: Vlna žiarivej zelenej farby postupujúca cez sieť
- **Simuluje**: Učenie a sekvenčné spracovanie v hlbokých neurónových sieťach
- **Čo vidíš**: Rýchla zeleno-oranžová kaskáda

### 4. **Pulse Network** 💓
- **Farba**: Ružová ↔ Jasná fialová
- **Trvanie**: 8 sekúnd
- **Popis**: Celá sieť pulzuje synchronizovane s rytmickým prechodom
- **Vizuálny efekt**: Všetky neuróny pulzujú v harmónii, farba osciluje
- **Simuluje**: Mozgové vlny alfa a theta počas hlbokej relaxácie
- **Čo vidíš**: Meditačný efekt ružovo-fialového pulzovania

### 5. **Random Walker** 🎲
- **Farba**: Oranžová → Jasná zelená
- **Trvanie**: 7 sekúnd
- **Popis**: Náhodné šírenie aktivácie cez susedné neuróny
- **Vizuálny efekt**: Chaotické ale organické šírenie farby medzi susedmi
- **Simuluje**: Spontánnu neurónovú aktivitu a stochastickú difúziu
- **Čo vidíš**: Iskry oranžovej farby náhodne skáčuce po sieti

## 🚀 Ako použiť

1. **Spustenie algoritmu**:
   - Otvor panel "Algorithms" v pravom slidebaru
   - Vyber algoritmus kliknutím na jeho názov
   - Prečítaj si popis a klikni na "Run Algorithm"

2. **Sleduj automatické vytváranie**:
   - ⏱️ **Fáza 1: Príprava** - Systém sa pripravuje
   - 🔨 **Fáza 2: Vytváranie neurónov** - Sleduj live počítadlo (0/40 → 40/40)
     - Každý neurón sa pridáva postupne (50ms interval)
     - Neuróny sa usporiadajú do sférickej formácie
     - Automaticky sa vytvárajú spojenia k 3 najbližším neurónom
   - ▶️ **Fáza 3: Beh algoritmu** - Sleduj farebné zmeny!
   - ✅ **Fáza 4: Dokončené** - Algoritmus skončil

3. **Čo sledovať počas behu**:
   - 🎨 **Farebné zmeny neurónov** - každý algoritmus má unikátny vzor
   - 💫 **Aktiváciu** - žiariace neuróny = aktívne
   - 🔗 **Spojenia** - svetlejšie linky = silnejšie spojenia
   - 📊 **Progress bar** - koľko % algoritmu už prebehlo
   - 📝 **Live popis** - čo práve vidíš a prečo

4. **Interakcia so scénou**:
   - 🖱️ **Ľavé tlačidlo + ťahanie** = rotácia
   - 🖱️ **Pravé tlačidlo + ťahanie** = posun
   - 🔄 **Koliesko myši** = zoom
   - 🔄 **Automatická rotácia** = zapína sa pri viac ako 1 neuróne

5. **Zastavenie**:
   - Klikni na červené "Stop" tlačidlo
   - Neuróny sa fade-nu späť do pôvodných farieb
   - Môžeš spustiť iný algoritmus

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

## 🎨 Farebná paleta (Neon Edition)

```
Jasná modrá:     #00D4FF  (Input neuróny)
Jasná fialová:   #B565FF  (Hidden neuróny)
Jasná zelená:    #00FF88  (Output neuróny)
Ružová:          #FF6B9D  (Pulse Network)
Oranžová:        #FFB74A  (Random Walker)
```

### Prečo nové farby?
- ✨ **Vyššia viditeľnosť** - žiarivejšie farby sa lepšie vidia
- 🎭 **Lepší kontrast** - jasnejšie farby voči tmavému pozadiu
- 🌈 **Výraznejšie prechody** - lepšie viditeľné zmeny počas algoritmov
- 💫 **Neonový efekt** - futuristický vzhľad

---

**Tip**: Skús spustiť viacero algoritmov po sebe a sleduj rozdielne vzory!
