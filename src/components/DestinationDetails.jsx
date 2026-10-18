import { useEffect, useRef, useState } from "react";
import { X, MapPin, Users, Globe, ExternalLink, Bookmark, BookmarkCheck, Mountain, Loader2 } from "lucide-react";
import { fetchWikipediaSummary } from "../services/destinationApi.js";
import { formatCoords, formatLocation, formatPopulation, mapUrl, toneIndex } from "../utils/destinations.js";

export default function DestinationDetails({ destination: d, saved, onClose, onSave, onViewTrip }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [wiki, setWiki] = useState({ status: "loading", data: null });

  // Focus management, Escape to close, Tab trapping, scroll lock.
  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const nodes = dialogRef.current.querySelectorAll('a[href], button:not([disabled])');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [onClose]);

  // Optional Wikipedia text and photo; aborted if the dialog closes or changes.
  useEffect(() => {
    const controller = new AbortController();
    setWiki({ status: "loading", data: null });
    fetchWikipediaSummary(d, controller.signal)
      .then((data) => setWiki({ status: data ? "ready" : "none", data }))
      .catch((err) => { if (err.name !== "AbortError") setWiki({ status: "none", data: null }); });
    return () => controller.abort();
  }, [d]);

  const summary = [
    `${d.name} is a place in ${formatLocation(d)}.`,
    d.population != null ? `The geocoding database lists a population of ${formatPopulation(d.population)}.` : "No population figure is listed for it.",
    d.timezone ? `It uses the ${d.timezone} time zone.` : "",
  ].join(" ");

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="details-title" ref={dialogRef}>
        <button className="icon-btn dialog__close" onClick={onClose} ref={closeRef} aria-label="Close details">
          <X size={20} aria-hidden="true" />
        </button>

        <div className={`dialog__media tone-${toneIndex(d.name)}`}>
          {wiki.data?.photo ? (
            <img src={wiki.data.photo} alt={`${d.name}, from Wikipedia`} />
          ) : (
            <div className="dialog__fallback" aria-hidden="true">
              {wiki.status === "loading" ? <Loader2 className="spin" size={32} /> : <Mountain size={44} />}
            </div>
          )}
        </div>

        <div className="dialog__body">
          <h2 id="details-title">{d.name}</h2>
          <p className="meta"><MapPin size={16} aria-hidden="true" /> {formatLocation(d)}</p>

          <dl className="facts">
            <div><dt>Country</dt><dd>{d.country ?? "Not available"}</dd></div>
            <div><dt>Region</dt><dd>{d.admin1 ?? "Not available"}</dd></div>
            <div><dt>Coordinates</dt><dd>{formatCoords(d)}</dd></div>
            <div><dt><Users size={14} aria-hidden="true" /> Population</dt><dd>{formatPopulation(d.population)}</dd></div>
          </dl>

          <h3>About</h3>
          <p>{summary}</p>
          <p className="source-note">Generated from Open-Meteo geocoding fields.</p>
          {wiki.status === "ready" && (
            <>
              <p>{wiki.data.extract}</p>
              <p className="source-note">
                Summary and photo from Wikipedia{wiki.data.url && <> · <a href={wiki.data.url} target="_blank" rel="noopener noreferrer">read the article</a></>}.
                Matched by name, so double-check it is the place you mean.
              </p>
            </>
          )}
          {wiki.status === "none" && <p className="source-note">No Wikipedia summary was found for this place.</p>}

          <div className="dialog__actions">
            {saved ? (
              <>
                <span className="status-ok" role="status"><BookmarkCheck size={18} aria-hidden="true" /> Already in My Trip</span>
                <button className="btn btn--ghost" onClick={onViewTrip}>View My Trip</button>
              </>
            ) : (
              <button className="btn btn--primary" onClick={() => onSave(d)}>
                <Bookmark size={16} aria-hidden="true" /> Add to My Trip
              </button>
            )}
            <a className="btn btn--ghost" href={mapUrl(d)} target="_blank" rel="noopener noreferrer">
              <Globe size={16} aria-hidden="true" /> View on map <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
