const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__section">
          <h3 className="footer__title">NeuroBloom</h3>
          <p className="footer__description">
            Experimentálna vizualizácia umelej neurónovej siete postavená na React a Three.js
          </p>
        </div>
        
        <div className="footer__section">
          <h4 className="footer__subtitle">Technológie</h4>
          <ul className="footer__list">
            <li>React 18</li>
            <li>Three.js</li>
            <li>React Three Fiber</li>
            <li>TypeScript</li>
          </ul>
        </div>
        
        <div className="footer__section">
          <h4 className="footer__subtitle">Princípy</h4>
          <ul className="footer__list">
            <li>Organický rast</li>
            <li>Synaptická plastickosť</li>
            <li>Adaptívna aktivácia</li>
            <li>Živá simulácia</li>
          </ul>
        </div>
      </div>
      
      <div className="footer__bottom">
        <p>© {currentYear} NeuroBloom · vytvorené pre vizuálny experiment a vzdelávanie</p>
        <div className="footer__pulse" />
      </div>
    </footer>
  );
};

export default Footer;
