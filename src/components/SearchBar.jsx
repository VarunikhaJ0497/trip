import { Search, Loader2 } from "lucide-react";

export default function SearchBar({ value, onChange, onSubmit, error, loading }) {
  return (
    <form
      className="search"
      role="search"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="destination-search" className="sr-only">Search destinations</label>
      <div className={`search__field${error ? " has-error" : ""}`}>
        <Search size={20} aria-hidden="true" />
        <input
          id="destination-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search a city or town, e.g. Kyoto"
          autoComplete="off"
          maxLength={100}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "search-error" : undefined}
        />
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}
          {loading ? "Searching" : "Explore"}
        </button>
      </div>
      {error && <p id="search-error" className="field-error" role="alert">{error}</p>}
    </form>
  );
}
