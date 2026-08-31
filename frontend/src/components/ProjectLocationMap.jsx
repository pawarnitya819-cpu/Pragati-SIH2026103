import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { X, MapPin } from "lucide-react";
import { getStateLatLng } from "../data/stateCoordinates";

// Leaflet's default marker icons don't load correctly under Vite's bundler
// unless we point them at the bundled image URLs manually. This fixes the
// common "marker shows as a broken image" bug.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function ProjectLocationMap({ project, onClose }) {
  if (!project) return null;

  // Prefer the project's own site coordinates (exact location) — only fall
  // back to the state's approximate center when a project genuinely has no
  // lat/lng of its own (e.g. rows uploaded without site-level detail).
  const hasExactSite = Number.isFinite(project.lat) && Number.isFinite(project.lng);
  const { lat, lng } = hasExactSite ? { lat: project.lat, lng: project.lng } : getStateLatLng(project.state);
  const zoom = hasExactSite ? 12 : 7;
  const placeLabel = project.city ? `${project.city}, ${project.state}` : project.state;

  return (
    <div
      className="fixed inset-0 z-[1100] bg-navy-900/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="bg-navy-900 text-white px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold">{project.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{project.ministry}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-[380px] w-full">
          <MapContainer
            key={`${lat}-${lng}`}
            center={[lat, lng]}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>
                <strong>{project.name}</strong>
                <br />
                {placeLabel}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="p-4 text-xs text-slate-500 flex items-start gap-2 border-t border-slate-100">
          <MapPin className="h-3.5 w-3.5 text-navy-700 mt-0.5 shrink-0" />
          {hasExactSite ? (
            <p>
              <span className="font-semibold text-navy-900">{placeLabel}</span> — exact project
              site location on real map data (OpenStreetMap).
            </p>
          ) : (
            <p>
              <span className="font-semibold text-navy-900">{project.state}</span> — showing
              approximate state-level location on real map data (OpenStreetMap). Precise site
              coordinates aren't part of this project's data yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}