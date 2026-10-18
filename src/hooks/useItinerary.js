import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY, loadItinerary, saveItinerary, toItineraryItem } from "../utils/itineraryStorage.js";

const PROBLEMS = {
  damaged: "Some saved destinations were damaged and have been skipped.",
  unreadable: "Your saved trip couldn’t be read, so we started a fresh one.",
};

export function useItinerary() {
  const [initial] = useState(loadItinerary);
  const [items, setItems] = useState(initial.items);
  const [notice, setNotice] = useState(initial.problem ? PROBLEMS[initial.problem] : null);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) setItems(loadItinerary().items);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((id) => items.some((i) => i.id === String(id)), [items]);

  /** Returns "added" | "duplicate" | "unsaved" (added, but storage failed). */
  const add = useCallback(
    (destination) => {
      if (items.some((i) => i.id === String(destination.id))) return "duplicate";
      const next = [...items, toItineraryItem(destination)];
      setItems(next);
      return saveItinerary(next) ? "added" : "unsaved";
    },
    [items]
  );

  const remove = useCallback(
    (id) => {
      const next = items.filter((i) => i.id !== String(id));
      setItems(next);
      saveItinerary(next);
    },
    [items]
  );

  return { items, has, add, remove, notice, dismissNotice: () => setNotice(null) };
}
