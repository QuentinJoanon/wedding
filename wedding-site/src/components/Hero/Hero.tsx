import weddingData from '../../data/wedding-data.json';

const { couple } = weddingData;

export const Hero = () => {
  return (
    <header className="hero hero--split">
      <div className="hero__type">
        <p className="kicker no-rule">{couple.dateShort}</p>
        <h1 className="hero-names">
          {couple.groom}
          <br />
          <span className="amp">&amp;</span>
          <br />
          {couple.bride}
        </h1>
        <div className="hero-detail">
          <span>Nous célébrons notre union au {couple.venue}, à Mont-et-Marré dans la Nièvre, et nous serions heureux de vous compter parmi nous.</span>
        </div>
        <a href="#rsvp" className="linklike">
          Confirmer votre présence <span>→</span>
        </a>
      </div>
      <div className="hero__art">
        <div className="arch">
          <img className="cover" src="/domaine-de-mont.avif" alt="Le château du Domaine de Mont" />
        </div>
      </div>
    </header>
  );
};
