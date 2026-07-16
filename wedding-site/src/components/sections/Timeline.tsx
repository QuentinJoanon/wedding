import weddingData from '../../data/wedding-data.json';

const { schedule } = weddingData;

export const Timeline = () => {
  return (
    <section className="section panel" id="programme">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="kicker">
            <span className="num">03</span>&nbsp;— Le Programme
          </p>
          <h2 className="title">
            Deux jours
            <br />
            pour <em>tout fêter</em>.
          </h2>
          <p className="lede">
            Le déroulé du weekend, du « oui » de samedi au brunch du dimanche.
          </p>
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
                      <div className="tl-title">{item.title}</div>
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
