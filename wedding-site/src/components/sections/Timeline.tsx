import { Section } from '../ui';
import { motion } from 'framer-motion';
import weddingData from '../../data/wedding-data.json';

export const Timeline = () => {
  const { schedule } = weddingData.practicalInfo;
  const saturdayEvents = schedule.filter(event => event.day === 'saturday');
  const sundayEvents = schedule.filter(event => event.day === 'sunday');

  // Version mobile (verticale)
  const EventItemMobile = ({ event, index, isLast }: { event: typeof schedule[0]; index: number; isLast: boolean }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start space-x-6 group"
    >
      {/* Timeline dot et ligne */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.3 }}
          className="w-5 h-5 rounded-full bg-gold group-hover:bg-gold-dark transition-colors shadow-md"
        />
        {!isLast && (
          <div className="w-0.5 h-full bg-linear-to-b from-gold to-gold-light min-h-20" />
        )}
      </div>

      {/* Event content */}
      <div className="pb-10 flex-1">
        <p className="font-heading text-gold text-lg mb-1">{event.time}</p>
        <h4 className="font-heading text-2xl text-gray-800 mb-2">{event.title}</h4>
        {event.description && (
          <p className="font-body text-gray-600">{event.description}</p>
        )}
      </div>
    </motion.div>
  );

  // Version desktop (horizontale)
  const EventItemDesktop = ({ event, index, isLast }: { event: typeof schedule[0]; index: number; isLast: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col items-center group relative"
    >
      {/* Event content (au-dessus) */}
      <div className="text-center mb-4 min-w-35">
        <p className="font-heading text-gold text-lg mb-1">{event.time}</p>
        <h4 className="font-heading text-xl text-gray-800 mb-1">{event.title}</h4>
        {event.description && (
          <p className="font-body text-gray-600 text-sm">{event.description}</p>
        )}
      </div>

      {/* Timeline dot et ligne horizontale */}
      <div className="flex items-center">
        {!isLast && (
          <div className="h-0.5 w-full bg-linear-to-r from-gold to-gold-light min-w-12 lg:min-w-24" />
        )}
        <motion.div
          whileHover={{ scale: 1.3 }}
          className="w-5 h-5 rounded-full bg-gold group-hover:bg-gold-dark transition-colors shadow-md shrink-0"
        />
        {!isLast && (
          <div className="h-0.5 w-full bg-linear-to-r from-gold-light to-gold min-w-12 lg:min-w-24" />
        )}
      </div>
    </motion.div>
  );

  const DaySeparator = ({ day }: { day: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex items-center space-x-4 my-8"
    >
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-gold to-transparent" />
      <div className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-pastel-blue/20 to-pastel-cream rounded-full">
        <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <span className="font-heading text-xl text-gold-dark">{day}</span>
      </div>
      <div className="h-px flex-1 bg-linear-to-r from-gold via-gold-light to-transparent" />
    </motion.div>
  );

  return (
    <Section
      id="timeline"
      title="Déroulé du Weekend"
      subtitle="Programme du 19-20 juin 2027"
      background="white"
    >
      {/* Version mobile (verticale) */}
      <div className="lg:hidden max-w-3xl mx-auto">
        <div className="relative">
          {schedule.map((event, index) => {
            const previousEvent = index > 0 ? schedule[index - 1] : null;
            const showDaySeparator = previousEvent && previousEvent.day !== event.day;
            const isFirstEvent = index === 0;

            return (
              <div key={index}>
                {isFirstEvent && <DaySeparator day="Samedi" />}
                {showDaySeparator && <DaySeparator day="Dimanche" />}
                <EventItemMobile
                  event={event}
                  index={index}
                  isLast={index === schedule.length - 1}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Version desktop (horizontale) */}
      <div className="hidden lg:block max-w-7xl mx-auto">
        {/* Samedi */}
        <div className="mb-12">
          <DaySeparator day="Samedi" />
          <div className="flex justify-center items-start mt-8">
            {saturdayEvents.map((event, index) => (
              <EventItemDesktop
                key={index}
                event={event}
                index={index}
                isLast={index === saturdayEvents.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Dimanche */}
        <div>
          <DaySeparator day="Dimanche" />
          <div className="flex justify-center items-start mt-8">
            {sundayEvents.map((event, index) => (
              <EventItemDesktop
                key={index}
                event={event}
                index={index}
                isLast={index === sundayEvents.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Note importante */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center bg-pastel-cream/30 p-6 rounded-lg max-w-3xl mx-auto"
      >
        <p className="font-body text-gray-600 italic">
          Les horaires sont indicatifs et peuvent être ajustés. Nous vous tiendrons informés de tout changement.
        </p>
      </motion.div>
    </Section>
  );
};
