import { Layout, Footer } from './components/Layout';
import { Hero } from './components/Hero';
import {
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

      {/* 01 — Réponse (RSVP, section phare ardoise) */}
      <RSVP />

      {/* 02 — Le Programme (timeline spine) */}
      <Timeline />

      {/* 03 — Où Dormir */}
      <Accommodations />

      {/* 04 — Les Enfants */}
      <Childcare />

      {/* 05 — La Liste */}
      <GiftList />

      {/* 06 — La Tenue + 07 — Questions (FAQ) */}
      <DressCode />

      {/* Footer — section phare ardoise */}
      <Footer />
    </Layout>
  );
}

export default App;
