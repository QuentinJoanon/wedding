import { Layout } from './components/Layout';
import { Hero } from './components/Hero';

function App() {
  return (
    <Layout>
      <Hero />

      {/* Sections à venir */}
      <section className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-4xl font-heading text-gold-dark mb-4">Informations Pratiques</h2>
          <p className="text-gray-600">Section à développer</p>
        </div>
      </section>
    </Layout>
  );
}

export default App;
