import { Compass, Bookmark } from "lucide-react";

export default function Navbar({ route, savedCount }) {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a className="brand" href="#/" aria-label="TripWise home">
          <Compass size={26} aria-hidden="true" />
          <span>TripWise</span>
        </a>
        <nav aria-label="Main">
          <a href="#/" className="nav-link" aria-current={route === "explore" ? "page" : undefined}>
            Explore
          </a>
          <a href="#/trip" className="nav-link" aria-current={route === "trip" ? "page" : undefined}>
            <Bookmark size={16} aria-hidden="true" />
            My Trip
            <span className="badge" aria-label={`${savedCount} saved`}>{savedCount}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
