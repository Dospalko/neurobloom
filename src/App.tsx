import NeuroBloomScene from "./components/NeuroBloomScene";
import Hero from "./components/Hero";
import InfoSection from "./components/InfoSection";
import NetworkStats from "./components/NetworkStats";
import Footer from "./components/Footer";
import "./styles/global.css";
import "./styles/app.css";

const App = () => {
  return (
    <div className="app-shell">
      <div className="gradient-overlay" />

      <Hero />

      <main className="stage">
        <div className="stage__canvas">
          <NeuroBloomScene />
        </div>
        
        <NetworkStats />

        <section className="story">
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
