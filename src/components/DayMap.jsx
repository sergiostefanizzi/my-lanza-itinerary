import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

// Tile provider CARTO (gratis, no API key) coerente col tema scuro/chiaro.
const TILES = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
};

// Segnaposto numerato colorato con l'accent del giorno (DivIcon, niente immagini esterne).
function numberedIcon(n, color) {
  return L.divIcon({
    className: "daymap-pin-wrap",
    html: `<div class="daymap-pin" style="--pin:${color}">${n}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [0, -16],
  });
}

// Segnaposto della base (alloggio).
const homeIcon = L.divIcon({
  className: "daymap-home-wrap",
  html: `<div class="daymap-home">🏠</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  tooltipAnchor: [0, -16],
});

// Adatta la vista per contenere tutti i punti del giorno.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [44, 44] });
    }
  }, [points, map]);
  return null;
}

export default function DayMap({ day, base, theme }) {
  const tiles = TILES[theme === "light" ? "light" : "dark"];
  const stops = day.stops || [];
  const stopPoints = stops.map(s => s.coords);
  const routePoints = base ? [base.coords, ...stopPoints] : stopPoints;
  const allPoints = base ? [base.coords, ...stopPoints] : stopPoints;

  return (
    <MapContainer
      key={`${day.day}-${theme}`}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer url={tiles.url} attribution={tiles.attribution} />

      {routePoints.length > 1 && (
        <Polyline
          positions={routePoints}
          pathOptions={{ color: day.accent, weight: 3, opacity: 0.85, dashArray: "1 8" }}
        />
      )}

      {base && (
        <Marker position={base.coords} icon={homeIcon}>
          <Tooltip>{base.label}</Tooltip>
        </Marker>
      )}

      {stops.map((s, i) => (
        <Marker key={i} position={s.coords} icon={numberedIcon(i + 1, day.accent)}>
          <Tooltip>{s.label}</Tooltip>
        </Marker>
      ))}

      <FitBounds points={allPoints} />
    </MapContainer>
  );
}
