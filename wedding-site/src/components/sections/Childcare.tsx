import { Section, Card } from '../ui';
import weddingData from '../../data/wedding-data.json';

export const Childcare = () => {
  const { childcare } = weddingData;

  return (
    <Section
      id="enfants"
      title="Section Enfants"
      subtitle="Informations pour les familles avec enfants"
      background="cream"
    >
      {/* Info Baby-sitting */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="bg-gradient-to-r from-pastel-rose/20 to-pastel-blue/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gold/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-2xl text-gold-dark mb-4">Baby-sitting</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-body text-gray-700">
                    <span className="font-semibold">Nombre de baby-sitters :</span> {childcare.babySitters.count}
                  </p>
                  <p className="font-body text-gray-700">
                    <span className="font-semibold">Horaires :</span> {childcare.babySitters.schedule}
                  </p>
                </div>
                <div>
                  <p className="font-body text-gray-700">
                    <span className="font-semibold">Âges :</span> {childcare.babySitters.ages}
                  </p>
                  <p className="font-body text-gray-700">
                    <span className="font-semibold">Lieu :</span> {childcare.babySitters.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activités */}
      <div className="mb-12">
        <h3 className="font-heading text-3xl text-gold-dark text-center mb-8">Activités Prévues</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {childcare.activities.map((activity, index) => (
            <Card key={index} delay={index * 0.1}>
              <div className="text-center">
                <p className="font-heading text-gold text-lg mb-2">{activity.time}</p>
                <h4 className="font-heading text-xl text-gray-800 mb-3">{activity.title}</h4>
                <p className="font-body text-gray-600 text-sm mb-2">{activity.description}</p>
                <span className="inline-block px-3 py-1 bg-pastel-blue/30 text-gray-600 text-xs rounded-full">
                  {activity.ageRange}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Conseils aux parents */}
      <Card className="max-w-3xl mx-auto">
        <h3 className="font-heading text-2xl text-gold-dark mb-4 text-center">Conseils aux Parents</h3>
        <ul className="space-y-3">
          {childcare.parentTips.map((tip, index) => (
            <li key={index} className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-body text-gray-700">{tip}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
};
