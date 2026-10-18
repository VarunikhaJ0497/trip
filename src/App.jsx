import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import DestinationDetails from "./components/DestinationDetails.jsx";
import Explore from "./pages/Explore.jsx";
import MyTrip from "./pages/MyTrip.jsx";
import { useDestinationSearch } from "./hooks/useDestinationSearch.js";
import { useItinerary } from "./hooks/useItinerary.js";
import { useHashRoute } from "./hooks/useHashRoute.js";

export default function App() {
  const route = useHashRoute();
  const search = useDestinationSearch();
  const itinerary = useItinerary();
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = "info") => setToast({ message, tone, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const closeDetails = useCallback(() => setSelected(null), []);

  const handleSave = (d) => {
    const result = itinerary.add(d);
    if (result === "duplicate") notify(`${d.name} is already in My Trip.`, "warn");
    else if (result === "unsaved") notify(`${d.name} added, but browser storage is unavailable so it won’t persist.`, "error");
    else notify(`${d.name} saved to My Trip.`, "success");
  };
  const handleRemove = (d) => {
    itinerary.remove(d.id);
    notify(`${d.name} removed from My Trip.`);
  };

  return (
    <>
      <Navbar route={route} savedCount={itinerary.items.length} />
      <main>
        {route === "trip" ? (
          <MyTrip itinerary={itinerary} onOpen={setSelected} onRemove={handleRemove} />
        ) : (
          <Explore search={search} itinerary={itinerary} onOpen={setSelected} onSave={handleSave} />
        )}
      </main>
      <footer className="footer">
        <div className="container">
          Place data from <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noopener noreferrer">Open-Meteo Geocoding API</a> (CC BY 4.0, GeoNames).
          Summaries and photos from <a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia</a>.
        </div>
      </footer>

      {selected && (
        <DestinationDetails
          destination={selected}
          saved={itinerary.has(selected.id)}
          onClose={closeDetails}
          onSave={handleSave}
          onViewTrip={() => { closeDetails(); window.location.hash = "#/trip"; }}
        />
      )}
      {toast && <div key={toast.id} className={`toast toast--${toast.tone}`} role="status">{toast.message}</div>}
    </>
  );
}
