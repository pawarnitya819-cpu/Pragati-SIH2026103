import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  Trash2,
  FileText,
  X,
  Crosshair,
  Loader2,
  AlertTriangle,
  Maximize2,
  Layers,
} from "lucide-react";

// Site media sits alongside the numeric project record: a field engineer's
// progress photo is the evidence behind a physical-progress percentage, and an
// inspection report PDF is the evidence behind a risk downgrade. Items are
// held as {metadata + File handle + object-URL preview} so the same list can
// later be POSTed to the backend without re-reading anything off disk.

export const MEDIA_CATEGORIES = [
  "Site Photo",
  "Progress Snapshot",
  "Inspection Report",
  "Drone / Aerial Survey",
  "Geo-tagged Media",
];

const ACCEPTED_MIME = ["image/", "application/pdf"];
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_ITEMS = 30;

function isAccepted(file) {
  return ACCEPTED_MIME.some((prefix) => (file.type || "").startsWith(prefix));
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCoords(geo) {
  if (!geo) return null;
  return `${geo.lat.toFixed(5)}°, ${geo.lng.toFixed(5)}°`;
}

export default function SiteMediaUpload({ projectId, items, onChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState(MEDIA_CATEGORIES[0]);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [geo, setGeo] = useState({ status: "idle", coords: null, message: "" });
  const inputRef = useRef(null);

  // Two rules govern the handlers below.
  //
  // 1. Object URLs are deliberately NOT revoked on unmount: the media list is
  //    lifted into App state and survives tab switches, so revoking here would
  //    leave dead previews behind. They are released on explicit delete /
  //    clear, and by the browser on page unload.
  // 2. Everything with a side effect (createObjectURL, revokeObjectURL, error
  //    messages) happens *outside* the state updater. Updaters must stay pure —
  //    StrictMode invokes them twice in development, which would otherwise mint
  //    two object URLs per file and leak the discarded one.
  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      if (!incoming.length) return;

      const rejected = [];
      const accepted = [];

      for (const file of incoming) {
        if (!isAccepted(file)) {
          rejected.push(`${file.name} — unsupported type`);
        } else if (file.size > MAX_FILE_BYTES) {
          rejected.push(`${file.name} — over 15 MB`);
        } else {
          accepted.push(file);
        }
      }

      const room = Math.max(MAX_ITEMS - items.length, 0);
      if (accepted.length > room) {
        rejected.push(
          room === 0
            ? `attachment limit of ${MAX_ITEMS} reached`
            : `only ${room} more attachment(s) allowed`
        );
      }

      const stamp = Date.now();
      const additions = accepted.slice(0, room).map((file, i) => ({
        id: `media-${stamp}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        kind: file.type.startsWith("image/") ? "image" : "document",
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        category,
        projectId: projectId || "unassigned",
        uploadedAt: new Date(stamp).toISOString(),
        geo: geo.status === "ready" ? geo.coords : null,
      }));

      if (additions.length) onChange((prev) => [...prev, ...additions]);
      setError(rejected.length ? `Skipped: ${rejected.join("; ")}.` : "");
    },
    [category, geo, items.length, onChange, projectId]
  );

  const removeItem = (id) => {
    const target = items.find((item) => item.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    items.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    onChange([]);
    setError("");
  };

  const retagItem = (id, nextCategory) => {
    onChange((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category: nextCategory } : item))
    );
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "error", coords: null, message: "Geolocation unavailable in this browser." });
      return;
    }
    setGeo({ status: "locating", coords: null, message: "" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: "ready",
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          },
          message: "",
        });
      },
      (err) => {
        setGeo({
          status: "error",
          coords: null,
          message: err.code === err.PERMISSION_DENIED ? "Location permission denied." : "Could not read location.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const summary = useMemo(() => {
    const byCategory = {};
    let totalBytes = 0;
    items.forEach((item) => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      totalBytes += item.size;
    });
    return { byCategory, totalBytes };
  }, [items]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-navy-900">Site Photos & Field Evidence</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Attach progress photographs, inspection reports and geo-tagged media captured on site.
            Stored against project <span className="font-mono">{projectId || "—"}</span>.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <label className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Tag new uploads as
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
            >
              {MEDIA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={requestLocation}
            disabled={geo.status === "locating"}
            title="Stamp new uploads with your current GPS coordinates"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-60 ${
              geo.status === "ready"
                ? "border-success-500/40 bg-success-500/10 text-success-600"
                : "border-slate-300 text-slate-600 hover:border-navy-700 hover:text-navy-900"
            }`}
          >
            {geo.status === "locating" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5" />
            )}
            {geo.status === "ready" ? "Geo-tagging on" : "Geo-tag"}
          </button>
        </div>
      </div>

      {geo.status === "ready" && (
        <p className="text-xs text-success-600">
          New uploads will be stamped at {formatCoords(geo.coords)} (±{geo.coords.accuracy} m).
        </p>
      )}
      {geo.status === "error" && <p className="text-xs text-saffron-600">{geo.message}</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors bg-white ${
          dragActive ? "border-saffron-600 bg-saffron-100/40" : "border-slate-300 hover:border-navy-700"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            // Reset so re-selecting the same file still fires onChange.
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-12 w-12 rounded-full bg-navy-900/5 flex items-center justify-center">
            <ImagePlus className="h-6 w-6 text-navy-700" strokeWidth={2} />
          </div>
          <p className="font-semibold text-navy-900 text-sm">
            Drag & drop site photos, or click to browse
          </p>
          <p className="text-xs text-slate-500">
            JPG, PNG, WebP, HEIC or PDF · up to 15 MB each · max {MAX_ITEMS} attachments
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-saffron-100/60 text-saffron-600 text-xs px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-navy-900">{items.length} attachment(s)</span>
              <span>· {formatBytes(summary.totalBytes)} total</span>
              {Object.entries(summary.byCategory).map(([name, count]) => (
                <span
                  key={name}
                  className="ml-1 rounded-full bg-navy-900/5 px-2 py-0.5 font-medium text-navy-800"
                >
                  {name} · {count}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="font-semibold text-alert-600 hover:underline underline-offset-2"
            >
              Clear all
            </button>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="group bg-white rounded-xl ring-1 ring-slate-900/5 shadow-card overflow-hidden flex flex-col animate-fade-up"
              >
                <div className="relative h-32 bg-slate-100">
                  {item.kind === "image" ? (
                    <>
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLightbox(item)}
                        title="Preview full size"
                        className="absolute inset-0 flex items-center justify-center bg-navy-950/0 group-hover:bg-navy-950/35 transition-colors"
                      >
                        <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-1 text-slate-500">
                      <FileText className="h-8 w-8" strokeWidth={1.75} />
                      <span className="text-[11px] font-medium">Document</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    title="Remove attachment"
                    aria-label={`Remove ${item.name}`}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/95 text-alert-600 flex items-center justify-center shadow-sm hover:bg-alert-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  <p
                    className="text-xs font-semibold text-navy-900 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </p>

                  <dl className="text-[11px] text-slate-500 space-y-0.5">
                    <div className="flex justify-between gap-2">
                      <dt>Uploaded</dt>
                      <dd className="font-mono text-slate-600">{formatTimestamp(item.uploadedAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Size</dt>
                      <dd className="font-mono text-slate-600">{formatBytes(item.size)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Project</dt>
                      <dd className="font-mono text-slate-600 truncate">{item.projectId}</dd>
                    </div>
                    {item.geo && (
                      <div className="flex justify-between gap-2">
                        <dt>Geo-tag</dt>
                        <dd className="font-mono text-slate-600">{formatCoords(item.geo)}</dd>
                      </div>
                    )}
                  </dl>

                  <select
                    value={item.category}
                    onChange={(e) => retagItem(item.id, e.target.value)}
                    aria-label={`Category for ${item.name}`}
                    className="mt-auto w-full text-[11px] font-medium rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-700/25"
                  >
                    {MEDIA_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${lightbox.name}`}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100">
              <div className="min-w-0">
                <p className="font-semibold text-navy-900 text-sm truncate">{lightbox.name}</p>
                <p className="text-xs text-slate-500">
                  {lightbox.category} · {formatTimestamp(lightbox.uploadedAt)}
                  {lightbox.geo ? ` · ${formatCoords(lightbox.geo)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Close preview"
                className="shrink-0 h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={lightbox.previewUrl}
              alt={lightbox.name}
              className="w-full max-h-[70vh] object-contain bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
