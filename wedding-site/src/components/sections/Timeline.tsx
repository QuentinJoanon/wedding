import weddingData from '../../data/wedding-data.json';
import type { ScheduleDay } from '../../types';

const { schedule } = weddingData as { schedule: ScheduleDay[] };

/** Téléphone barré, dans un rond — signale les moments sans écran. */
const NoPhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="6.5" y="1.8" width="11" height="20.4" rx="2.6" />
    <line x1="10.2" y1="19" x2="13.8" y2="19" />
    <line x1="3.4" y1="21.4" x2="20.6" y2="2.6" />
  </svg>
);

const TimelineBadge = ({ tip }: { tip: string }) => (
  <span className="tl-badge" tabIndex={0} role="note" aria-label={tip}>
    <NoPhoneIcon />
    <span className="tl-badge__tip">{tip}</span>
  </span>
);

export const Timeline = () => {
  return (
    <section className="section panel" id="programme">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="kicker">
            <span className="num">03</span>&nbsp;— Le Déroulé
          </p>
          <h2 className="title">
            Deux jours pour
            <br />
            <em>partager et célébrer</em>.
          </h2>
          <p className="lede">Du « oui » de samedi au brunch du dimanche.</p>
        </div>

        <div className="tl__days">
          {schedule.map((day) => (
            <div className="tl-day reveal" key={day.day}>
              <div className="tl-day__head">
                <span className="d">
                  <em>{day.day}</em>
                </span>
                <span className="meta">{day.date}</span>
              </div>
              <div className="tl-day__rail">
                {day.items.map((item) => (
                  <div className="tl-item" key={`${day.day}-${item.time}`}>
                    <div className="tl-body">
                      <div className="tl-time">{item.time}</div>
                      <div className="tl-title">
                        {item.title}
                        {item.icon === 'no-phone' && item.tip && <TimelineBadge tip={item.tip} />}
                      </div>
                      <div className="tl-desc">{item.desc}</div>
                    </div>
                    <div className="tl-spacer"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
