import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import {
  Venue,
  DressCode,
  Timeline,
  RSVP,
  GiftList,
  Accommodations,
  Childcare,
  FAQ
} from './components/sections';

function App() {
  return (
    <Layout>
      {/* Hero - Animation d'ouverture */}
      <Hero />

      {/* Venue avec image de fond */}
      <Venue />

      {/* RSVP juste après le Venue */}
      <RSVP />

      {/* Déroulé de la journée */}
      <Timeline />

      {/* Hébergements */}
      <Accommodations />

      {/* Garde d'enfants */}
      <Childcare />

      {/* Sections MVP */}
      <GiftList />
      <DressCode />
      <FAQ />

      {/* Footer avec contacts */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Contacts */}
          <div className="mb-8">
            <h3 className="font-heading text-lg text-gold-light mb-3 text-center">Contact</h3>
            <div className="flex justify-center items-center gap-6">
              <div className="text-center">
                <p className="font-heading text-base text-white mb-1">Quentin</p>
                <a href="tel:0675953002" className="font-body text-gold-light hover:text-gold text-sm">
                  06 75 95 30 02
                </a>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="font-heading text-base text-white mb-1">Élisa</p>
                <a href="tel:0689370214" className="font-body text-gold-light hover:text-gold text-sm">
                  06 89 37 02 14
                </a>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="h-px bg-white/20 max-w-4xl mx-auto my-8"></div>

          {/* Footer info */}
          <div className="text-center">
            <p className="font-heading text-2xl mb-2">Quentin & Élisa</p>
            <p className="font-body text-gray-400 mb-4">19 Juin 2027 - Domaine de Mont</p>
            <p className="font-body text-sm text-gray-500">
              Site créé avec ❤️ pour notre mariage
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

export default App;
