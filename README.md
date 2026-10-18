# TripWise – Smart Travel Planner

**Track:** Frontend Development · AWS Student Builder Group, VIT Chennai – Web Development Recruitment Task

- **GitHub repository:** _add your public repo link here_
- **Live deployment:** _add your deployment link here after you deploy and verify it_

## Problem and solution
Planning a trip means jumping between sites to find places and remember them. TripWise lets you search real places through an external API, narrow and sort the results, open a destination for details, and save places to a personal trip that survives a page refresh.

## Features
- **Explore:** search a real API, a result count, quick-search chips, and a responsive card grid.
- **Filter and sort:** country filter built from the countries actually in the results; sort by best match, name (A–Z / Z–A) or population (missing values always last). Filter and sort work together and have a Reset button.
- **Destination details:** accessible dialog with name, country, region, coordinates, population, image (Wikipedia photo or an intentional fallback), description, Add to My Trip, and View on map (OpenStreetMap).
- **My Trip:** list, remove, count, friendly empty state, back to Explore. Duplicates are prevented, and saved items show a "Saved" state.
- **States:** loading skeletons, no results, blank/invalid input, failed request with Retry, damaged saved data notice, and toast feedback for save, duplicate and remove.
- **Responsive and accessible:** mobile to desktop, labelled inputs, visible focus, focus-trapped dialog (Esc closes), reduced-motion support.

## Tech stack
React 18 (hooks) · Vite 5 · JavaScript/JSX · plain CSS with variables · lucide-react icons · `localStorage` · Node's built-in test runner.

## External APIs (no API keys needed)
| API | Used for | Docs |
|---|---|---|
| Open-Meteo Geocoding API | Destination search: name, country, region, latitude, longitude, population, timezone | https://open-meteo.com/en/docs/geocoding-api |
| Wikipedia REST API | Optional summary and photo in the details dialog (matched by name, and only accepted if the text mentions the country or region) | https://en.wikipedia.org/api/rest_v1/ |

**Attribution:** place data is from Open-Meteo's geocoding API (CC BY 4.0, based on GeoNames). Open-Meteo's free tier is for non-commercial use with fair-use rate limits. Wikipedia text is CC BY-SA. Both credits are shown in the app footer and details dialog.

**Limitations:** the geocoding API searches *places* (cities, towns, regions), not tourist attractions. It has no photos, ratings or descriptions, and population is missing for many places. Results are capped at 30 per search, and one-character searches are not supported. Wikipedia matching by name can occasionally pick a different place, so the app says so.

## Folder structure
```
src/
├── main.jsx, App.jsx, styles.css
├── components/  Navbar, SearchBar, DestinationCard, DestinationDetails, States
├── pages/       Explore, MyTrip
├── hooks/       useDestinationSearch, useItinerary, useHashRoute
├── services/    destinationApi.js (all fetch calls)
└── utils/       destinations.js (filter/sort/format), itineraryStorage.js
```

## Run it
Prerequisite: Node.js 18+ (20 or 22 recommended).
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview    # serve the production build
npm test           # unit tests (no extra dependencies)
```

## Browser storage
The trip is stored in `localStorage` under `tripwise.itinerary.v1` as a list of `{id, name, country, admin1, latitude, longitude, population, savedAt}`. On load, data is parsed inside try/catch and validated: malformed JSON or a non-array resets to an empty trip with a notice; invalid or duplicate entries are dropped. Items are identified by the API's place `id`. Other open tabs stay in sync via the `storage` event. No personal data is stored.

## Error handling
- Input is validated before any request (blank, under 2 or over 80 characters, no letters), so no pointless API calls.
- Each search aborts the previous one, so a slow old response can't overwrite newer results.
- HTTP errors, network failures, unreadable JSON and unexpected shapes each give a clear message and a **Try again** button.
- Wikipedia failures never break the dialog; it just shows without that extra text and photo.

## Testing
Verified in the authoring environment, which had no internet access:
- `npm test`: **20 of 20 tests passed** (filter/sort including missing population, storage round-trip, malformed/damaged storage, duplicate handling, input validation, API error cases with a mocked `fetch`).
- Every source file compiles, and all imports resolve (esbuild bundle).

**Not verified there:** `npm install`, `npm run build`, live API calls, and browser/responsive checks. Run the checklist below on your machine and record the results.

- [ ] `npm install`, `npm run dev` and `npm run build` succeed
- [ ] Search "Tokyo" returns real results; "zzqxqx" shows the empty state
- [ ] Country filter and each sort option work; Reset works
- [ ] Details open, close (button, Esc, backdrop) and show the map link
- [ ] Save, duplicate, remove, and refresh persistence work
- [ ] Offline (DevTools → Network → Offline) shows the error state; Retry works after going back online
- [ ] No console errors; layouts at 360, 390, 768, 1024, 1440 px have no horizontal scroll

## Screenshots
Add images to `docs/screenshots/` and list them here: Explore, search/filter results, Destination Details, My Trip (populated), My Trip (empty), error state, and mobile versions.

## Deploy
Build command `npm run build`, output directory `dist`. Vercel/Netlify: import the GitHub repo, framework preset Vite. Routing uses `#/` hashes, so no rewrite rules are needed.

## Git
```bash
git init
git add .
git commit -m "TripWise frontend"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Make the repository public (Settings → Danger Zone → Change visibility).

## Known limitations
No attractions or hotels, no trip reordering/notes, trip is per browser (not synced across devices), and photos appear only when Wikipedia has a confident match.
