import { Section, Card } from '../ui';
import weddingData from '../../data/wedding-data.json';

export const PracticalInfo = () => {
  const { practicalInfo } = weddingData;

  return (
    <Section
      id="infos-pratiques"
      title="Informations Pratiques"
      subtitle="Contacts et informations utiles"
      background="cream"
    >
      {/* Contacts d'urgence */}
      <Card className="bg-gradient-to-r from-pastel-rose/10 to-pastel-peach/10 max-w-4xl mx-auto">
        <h3 className="font-heading text-2xl text-gold-dark mb-6 text-center">Contacts d'Urgence</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {practicalInfo.emergencyContacts.map((contact, index) => (
            <div key={index} className="text-center p-4 bg-white/50 rounded-lg">
              <p className="font-heading text-lg text-gray-700">{contact.name}</p>
              <p className="font-body text-sm text-gray-500 mb-1">{contact.role}</p>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="font-body text-gold hover:text-gold-dark text-sm">
                  {contact.phone}
                </a>
              )}
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
};
