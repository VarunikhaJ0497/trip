import { AlertTriangle, SearchX, RotateCcw } from "lucide-react";

export function LoadingState({ label = "Searching destinations…" }) {
  return (
    <div role="status" aria-busy="true">
      <p className="sr-only">{label}</p>
      <div className="grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="card card--skeleton" key={i}>
            <div className="skeleton skeleton--media" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line short" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <AlertTriangle size={36} aria-hidden="true" />
      <h2>We couldn’t load destinations</h2>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title, children, action }) {
  return (
    <div className="state">
      <Icon size={36} aria-hidden="true" />
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
