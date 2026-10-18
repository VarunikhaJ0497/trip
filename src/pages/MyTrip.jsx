import { MapPin, Trash2, Info, X, Compass } from "lucide-react";
import { EmptyState } from "../components/States.jsx";
import { formatCoords, formatLocation, toneIndex } from "../utils/destinations.js";

export default function MyTrip({ itinerary, onOpen, onRemove }) {
  const { items, notice, dismissNotice } = itinerary;
  return (
    <section className="container trip">
      <a className="back-link" href="#/">← Back to Explore</a>
      <h1>My Trip</h1>
      <p className="trip__count" aria-live="polite">
        {items.length === 0 ? "No destinations saved yet." : `${items.length} destination${items.length === 1 ? "" : "s"} saved on this device.`}
      </p>

      {notice && (
        <div className="notice" role="status">
          <Info size={18} aria-hidden="true" /> <span>{notice}</span>
          <button className="icon-btn" onClick={dismissNotice} aria-label="Dismiss message"><X size={16} aria-hidden="true" /></button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Compass} title="Your trip is empty"
          action={<a className="btn btn--primary" href="#/">Find destinations</a>}>
          Save places from Explore and they will appear here, even after you refresh.
        </EmptyState>
      ) : (
        <ul className="trip__list">
          {items.map((d) => (
            <li key={d.id} className="trip__item">
              <div className={`trip__swatch tone-${toneIndex(d.name)}`} aria-hidden="true">{d.name.charAt(0)}</div>
              <div className="trip__info">
                <h2>{d.name}</h2>
                <p className="meta"><MapPin size={15} aria-hidden="true" /> {formatLocation(d)}</p>
                <p className="meta">Coordinates: {formatCoords(d)}</p>
              </div>
              <div className="trip__actions">
                <button className="btn btn--ghost" onClick={() => onOpen(d)} aria-label={`View details for ${d.name}`}>Details</button>
                <button className="btn btn--danger" onClick={() => onRemove(d)} aria-label={`Remove ${d.name} from My Trip`}>
                  <Trash2 size={16} aria-hidden="true" /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
