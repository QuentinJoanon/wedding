import { Section, Card } from '../ui';
import weddingData from '../../data/wedding-data.json';

export const Access = () => {
  const { routes } = weddingData;

  return (
    <Section
      id="acces"
      title="Plans d'Accès"
      subtitle="Comment se rendre au Domaine de Mont"
      background="pastel"
    >
      {/* Carte placeholder */}
      <Card className="mb-12 bg-gray-100 aspect-video flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="font-body text-gray-500">Carte interactive Google Maps à intégrer</p>
          <p className="font-body text-sm text-gray-400 mt-2">Coordonnées GPS : À ajouter</p>
        </div>
      </Card>

      {/* Itinéraires */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {routes.map((route, index) => (
          <Card key={index} delay={index * 0.1}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-heading text-xl text-gray-800">Depuis {route.from}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-body text-gray-700">
                <span className="font-semibold">Distance :</span> {route.distance}
              </p>
              <p className="font-body text-gray-700">
                <span className="font-semibold">Durée :</span> {route.duration}
              </p>
              <p className="font-body text-gray-600 text-xs italic mt-3">
                {route.directions}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Infos pratiques */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading text-xl text-gold-dark mb-4">🚗 En Voiture</h3>
          <p className="font-body text-gray-700 mb-2">
            Un parking gratuit est disponible sur place pour tous les invités.
          </p>
          <p className="font-body text-gray-600 text-sm">
            Pensez à partager les trajets entre invités pour réduire le nombre de véhicules.
          </p>
        </Card>

        <Card>
          <h3 className="font-heading text-xl text-gold-dark mb-4">🚂 En Train</h3>
          <p className="font-body text-gray-700 mb-2">
            Gares les plus proches : <span className="font-semibold">À définir</span>
          </p>
          <p className="font-body text-gray-600 text-sm">
            Des taxis sont disponibles. Consultez la section hébergements pour plus d'infos.
          </p>
        </Card>
      </div>
    </Section>
  );
};
