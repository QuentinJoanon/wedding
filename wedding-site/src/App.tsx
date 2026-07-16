import { Layout, Footer } from './components/Layout';
import { Hero } from './components/Hero';
import {
  Venue,
  RSVP,
  Timeline,
  Accommodations,
  Childcare,
  GiftList,
  DressCode,
} from './components/sections';

function App() {
  return (
    <Layout>
      {/* Hero — type à gauche / photo en arche à droite */}
      <Hero />

      {/* 01 — Le Lieu */}
      <Venue />

      {/* 02 — Réponse (RSVP, section phare ardoise) */}
      <RSVP />

      {/* 03 — Le Programme (timeline spine) */}
      <Timeline />

      {/* 04 — Où Dormir */}
      <Accommodations />

      {/* 05 — Les Enfants */}
      <Childcare />

      {/* 06 — La Liste */}
      <GiftList />

      {/* 07 — La Tenue + 08 — Questions (FAQ) */}
      <DressCode />

      {/* Footer — section phare ardoise */}
      <Footer />
    </Layout>
  );
}

export default App;
