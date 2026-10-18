import { useCallback, useEffect, useState } from "react";
import { searchDestinations } from "../services/destinationApi.js";

/**
 * Runs a search whenever `query` changes (or Retry is pressed).
 * The effect cleanup aborts the previous request, so a slow old response
 * can never overwrite the results of a newer search.
 */
export function useDestinationSearch() {
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: "idle", results: [], error: null });

  useEffect(() => {
    if (!query) return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, status: "loading", error: null }));
    searchDestinations(query, controller.signal)
      .then((results) => setState({ status: "success", results, error: null }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ status: "error", results: [], error: err.message });
      });
    return () => controller.abort();
  }, [query, attempt]);

  const search = useCallback((q) => {
    setQuery(q.trim());
    setAttempt((n) => n + 1); // lets the same query be re-run
  }, []);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, query, search, retry };
}
