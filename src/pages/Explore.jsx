import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import SearchBar from "../components/SearchBar.jsx";
import DestinationCard from "../components/DestinationCard.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/States.jsx";
import { validateQuery } from "../services/destinationApi.js";
import { SORT_OPTIONS, filterAndSort, getCountries } from "../utils/destinations.js";

const SUGGESTIONS = ["Kyoto", "Lisbon", "Reykjavik", "Cape Town", "Cusco", "Chennai"];

export default function Explore({ search, itinerary, onOpen, onSave }) {
  const [input, setInput] = useState(search.query);
  const [inputError, setInputError] = useState(null);
  const [country, setCountry] = useState("all");
  const [sort, setSort] = useState("relevance");

  const countries = useMemo(() => getCountries(search.results), [search.results]);
  // If a new search no longer contains the chosen country, fall back to "all".
  const activeCountry = countries.includes(country) ? country : "all";
  const visible = useMemo(
    () => filterAndSort(search.results, { country: activeCountry, sort }),
    [search.results, activeCountry, sort]
  );

  const run = (value) => {
    const problem = validateQuery(value);
    setInputError(problem);
    if (!problem) search.search(value);
  };

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <h1>Find your next destination</h1>
          <p className="hero__lede">Search real places around the world, read the essentials, and save the ones worth the trip.</p>
          <SearchBar
            value={input}
            onChange={(v) => { setInput(v); if (inputError) setInputError(null); }}
            onSubmit={() => run(input)}
            error={inputError}
            loading={search.status === "loading"}
          />
          <div className="chips" aria-label="Quick searches">
            <span>Try:</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => { setInput(s); run(s); }}>{s}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="container results" aria-live="polite">
        {search.status === "idle" && (
          <EmptyState icon={Search} title="Start with a place name">
            Search for a city or town, or pick one of the quick searches above.
          </EmptyState>
        )}
        {search.status === "loading" && <LoadingState />}
        {search.status === "error" && <ErrorState message={search.error} onRetry={search.retry} />}

        {search.status === "success" && search.results.length === 0 && (
          <EmptyState title={`No destinations found for “${search.query}”`}>
            Check the spelling or try a nearby larger town.
          </EmptyState>
        )}

        {search.status === "success" && search.results.length > 0 && (
          <>
            <div className="toolbar">
              <p className="toolbar__count">
                Showing <strong>{visible.length}</strong> of {search.results.length} results for “{search.query}”
              </p>
              <div className="toolbar__controls">
                <label>
                  <span>Country</span>
                  <select value={activeCountry} onChange={(e) => setCountry(e.target.value)}>
                    <option value="all">All countries</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>
                  <span>Sort by</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <button className="btn btn--ghost" onClick={() => { setCountry("all"); setSort("relevance"); }}
                  disabled={activeCountry === "all" && sort === "relevance"}>
                  <RotateCcw size={16} aria-hidden="true" /> Reset
                </button>
              </div>
            </div>
            <div className="grid">
              {visible.map((d) => (
                <DestinationCard key={d.id} destination={d} saved={itinerary.has(d.id)} onOpen={onOpen} onSave={onSave} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
