import { Section, Card, Button } from '../ui';
import weddingData from '../../data/wedding-data.json';

export const GiftList = () => {
  const { giftList } = weddingData;

  const getIcon = (type: string) => {
    if (type === 'contribution') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (type === 'experience') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    );
  };

  return (
    <Section
      id="liste-mariage"
      title="Liste de Mariage"
      subtitle="Votre présence est le plus beau des cadeaux !"
      background="white"
    >
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <p className="font-body text-gray-600 text-lg">
          Si toutefois vous souhaitez nous gâter, voici quelques idées qui nous feraient plaisir :
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {giftList.map((gift, index) => (
          <Card key={gift.id} delay={index * 0.1} className="text-center">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
              {getIcon(gift.type)}
            </div>
            <h3 className="font-heading text-2xl text-gray-800 mb-3">{gift.title}</h3>
            <p className="font-body text-gray-600 mb-6">{gift.description}</p>
            <Button variant="primary" href={gift.link} external className="w-full">
              Voir la liste
            </Button>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-pastel-rose/20 to-pastel-peach/20 text-center">
        <p className="font-body text-gray-700">
          ⚠️ <strong>Note :</strong> Le système de réservation anti-doublon sera ajouté prochainement.
          En attendant, n'hésitez pas à nous contacter directement.
        </p>
      </Card>
    </Section>
  );
};
