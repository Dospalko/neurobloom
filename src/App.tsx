import NeuroBloomScene from "./components/NeuroBloomScene";
import Hero from "./components/Hero";
import InfoSection from "./components/InfoSection";
import NetworkStats from "./components/NetworkStats";
import Footer from "./components/Footer";
import "./styles/global.css";

const App = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <Hero />

      {/* 3D Scene Section */}
      <section className="relative h-screen w-full">
        <NeuroBloomScene />
      </section>

      {/* Network Statistics */}
      <NetworkStats />

      {/* Info Sections */}
      <div className="space-y-0">
        <InfoSection
          title="Simulácia rastu"
          description="Sieť vzniká z náhodných semien a postupne nadobúda štruktúru a rytmus. Každý neurón zvyšuje svoju amplitúdu podľa toho, ako sa spracúvajú vstupy z prostredia."
          align="left"
        />
        
        <InfoSection
          title="Aktivácia a útlm"
          description="Spojenia medzi neurónmi pulzujú podľa aktivácie a synapsie zosilňujú tam, kde tok dát prináša nové poznanie. Staršie časti postupne menia farbu a ustupujú ďalšiemu rastu."
          align="right"
        />
        
        <InfoSection
          title="Budúcnosť neurónov"
          description="NeuroBloom je poetická predstava toho, ako by mohli vyzerať živé neurónové siete. Možno sa raz dočkáme AI, ktorá nielen počíta, ale aj žije."
          align="left"
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
