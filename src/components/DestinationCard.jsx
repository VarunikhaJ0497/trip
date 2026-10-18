import { MapPin, Users, Bookmark, BookmarkCheck } from "lucide-react";
import { formatLocation, formatPopulation, toneIndex } from "../utils/destinations.js";

export default function DestinationCard({ destination: d, saved, onOpen, onSave }) {
  return (
    <article className="card">
      <div className={`card__media tone-${toneIndex(d.name)}`} aria-hidden="true">
        <span className="card__initial">{d.name.charAt(0)}</span>
        {d.countryCode && <span className="card__code">{d.countryCode}</span>}
      </div>
      <div className="card__body">
        <h3>{d.name}</h3>
        <p className="meta"><MapPin size={15} aria-hidden="true" /> {formatLocation(d)}</p>
        <p className="meta"><Users size={15} aria-hidden="true" /> {d.population == null ? "Population not listed" : formatPopulation(d.population)}</p>
        <div className="card__actions">
          <button className="btn btn--ghost" onClick={() => onOpen(d)} aria-label={`View details for ${d.name}`}>
            View details
          </button>
          {saved ? (
            <button className="btn btn--saved" disabled aria-label={`${d.name} is already in My Trip`}>
              <BookmarkCheck size={16} aria-hidden="true" /> Saved
            </button>
          ) : (
            <button className="btn btn--primary" onClick={() => onSave(d)} aria-label={`Save ${d.name} to My Trip`}>
              <Bookmark size={16} aria-hidden="true" /> Save
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
