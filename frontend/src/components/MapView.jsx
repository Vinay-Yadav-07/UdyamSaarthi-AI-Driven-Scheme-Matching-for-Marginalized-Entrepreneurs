import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Building2, ShieldCheck, MapPin, ExternalLink, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically fit map bounds when partners change
function MapBoundsUpdater({ partners }) {
  const map = useMap();

  useEffect(() => {
    if (!partners || partners.length === 0) return;

    const validCoords = partners
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [p.latitude, p.longitude]);

    if (validCoords.length === 0) return;

    if (validCoords.length === 1) {
      map.setView(validCoords[0], 10, { animate: true });
    } else {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: true });
    }
  }, [partners, map]);

  return null;
}

// Custom DivIcon generator for clustered/multi-partner locations
const createGroupIcon = (count, city) => {
  if (count === 1) return new L.Icon.Default();

  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
        color: #ffffff;
        border-radius: 20px;
        padding: 4px 10px;
        font-weight: 800;
        font-size: 11px;
        font-family: system-ui, sans-serif;
        border: 2px solid #6366f1;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        cursor: pointer;
      ">
        <span style="background: #e0e7ff; color: #3730a3; border-radius: 9999px; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900;">${count}</span>
        <span>${city}</span>
      </div>
    `,
    className: 'custom-cluster-marker',
    iconSize: [110, 30],
    iconAnchor: [55, 15]
  });
};

function MultiPartnerPopup({ city, state, partners, t }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentPartner = partners[activeIndex] || partners[0];

  return (
    <div className="p-3 max-w-[290px] font-sans">
      {/* Cluster Header */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
          <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{partners.length} Partners in {city}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 transition-colors"
            title="Previous partner"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-extrabold text-slate-500 min-w-[28px] text-center">
            {activeIndex + 1}/{partners.length}
          </span>
          <button
            disabled={activeIndex === partners.length - 1}
            onClick={() => setActiveIndex((prev) => Math.min(partners.length - 1, prev + 1))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 transition-colors"
            title="Next partner"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Partner Details Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] rounded border border-indigo-200">
            {currentPartner.partner_type}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{currentPartner.partner_id}</span>
        </div>

        <h4 className="text-xs font-black text-slate-900 leading-snug">
          {currentPartner.partner_name}
        </h4>

        <p className="text-[11px] text-slate-600 leading-tight bg-slate-50 p-2 rounded border border-slate-100 max-h-[60px] overflow-y-auto">
          {currentPartner.address}
        </p>

        <div className="pt-1">
          <div className="flex items-center gap-1 text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 text-[10px]">
            <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
            <span>{currentPartner.location_notice || 'Address-based location'}</span>
          </div>
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${currentPartner.partner_name}, ${currentPartner.address}, ${currentPartner.city}, ${currentPartner.state}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <span>Get Directions</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default function MapView({ partners = [], center = [20.5937, 78.9629], zoom = 5, t }) {
  // Group partners by approximate coordinate location key
  const locationGroups = useMemo(() => {
    const groups = {};
    partners.forEach((p) => {
      if (!p.latitude || !p.longitude) return;
      // Key by 3 decimal places (~100m precision)
      const key = `${p.latitude.toFixed(3)},${p.longitude.toFixed(3)}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          latitude: p.latitude,
          longitude: p.longitude,
          city: p.city,
          state: p.state,
          partners: [],
        };
      }
      groups[key].partners.push(p);
    });
    return Object.values(groups);
  }, [partners]);

  return (
    <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-md relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater partners={partners} />

        {locationGroups.map((group) => {
          const isCluster = group.partners.length > 1;
          const icon = createGroupIcon(group.partners.length, group.city);

          return (
            <Marker
              key={group.key}
              position={[group.latitude, group.longitude]}
              icon={icon}
            >
              <Popup className="custom-popup" maxWidth={310}>
                {isCluster ? (
                  <MultiPartnerPopup
                    city={group.city}
                    state={group.state}
                    partners={group.partners}
                    t={t}
                  />
                ) : (
                  <div className="p-3 max-w-[250px]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{group.partners[0].partner_type}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 leading-snug mb-1">
                      {group.partners[0].partner_name}
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-2 leading-tight">
                      {group.partners[0].address}
                    </p>

                    <div className="pt-1 border-t border-slate-200">
                      <div className="flex items-center gap-1 text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[10px]">
                        <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{group.partners[0].location_notice || 'Address-based location'}</span>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${group.partners[0].partner_name}, ${group.partners[0].address}, ${group.partners[0].city}, ${group.partners[0].state}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
