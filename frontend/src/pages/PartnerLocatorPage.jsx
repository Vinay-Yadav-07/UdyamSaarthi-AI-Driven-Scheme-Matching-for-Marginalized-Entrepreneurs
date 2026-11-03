import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Search, ExternalLink, ShieldCheck, Info, X } from 'lucide-react';
import MapView from '../components/MapView';
import { api } from '../services/api';

export default function PartnerLocatorPage({ t }) {
  const location = useLocation();
  const locatorState = location.state || {};

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [partnerType, setPartnerType] = useState(locatorState.partnerType || '');
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load available 36 States/UTs for filter dropdown
  useEffect(() => {
    async function loadStates() {
      try {
        const data = await api.getStates();
        setStates(data.states || []);
      } catch (err) {
        console.error("Failed to load states list:", err);
      }
    }
    loadStates();
  }, []);

  // Search partners based on state, city, category filters
  useEffect(() => {
    async function search() {
      try {
        setLoading(true);
        const data = await api.getPartners({
          state: selectedState || undefined,
          city: searchCity || undefined,
          partner_type: partnerType || undefined,
        });
        setPartners(data || []);
      } catch (err) {
        console.error("Partner search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [selectedState, searchCity, partnerType]);

  const clearFilters = () => {
    setSelectedState('');
    setSearchCity('');
    setPartnerType('');
  };

  const isFilterActive = Boolean(selectedState || searchCity || partnerType);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Official Disbursing Institutions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.partnerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {t.partnerSub}
          </p>

          {locatorState.schemeName && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 mt-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Showing channel partners for selected scheme: <strong className="text-indigo-950 underline">{locatorState.schemeName}</strong> {locatorState.channel ? `(${locatorState.channel})` : ''}</span>
              </div>
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Clean, Uniform 3-Column Filter Row */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: State / UT Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.filterState}
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
              >
                <option value="">-- All States / UTs (36 States/UTs) --</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Column 2: City / District Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.filterCity}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.filterCity}
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Column 3: Partner Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.filterPartnerType}
              </label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
              >
                <option value="">{t.allTypes} (91 Partners)</option>
                <option value="SCA">State Channelizing Agencies (SCAs)</option>
                <option value="PSB">Public Sector Banks (PSBs)</option>
                <option value="RRB">Regional Rural Banks (RRBs)</option>
                <option value="NBFC-MFI">NBFC Micro-Finance Institutions (NBFC-MFIs)</option>
                <option value="Cooperative Bank">Cooperative Banks</option>
                <option value="SFB">Small Finance Banks (SFBs)</option>
                <option value="Cooperative Society">Cooperative Societies</option>
                <option value="Other Agency & SIDBI">Other Agencies & SIDBI</option>
              </select>
            </div>
          </div>

          {/* Active Filter Clear Bar */}
          {isFilterActive && !locatorState.schemeName && (
            <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600 font-medium">
              <span>Filtering results by active criteria...</span>
              <button
                onClick={clearFilters}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reduced Width Leaflet Map Display */}
      <div className="max-w-5xl mx-auto w-full">
        <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-md">
          <MapView partners={partners} t={t} />
        </div>
      </div>

      {/* Partner Card Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">
            Channel Partners ({partners.length})
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Source: NSFDC Source-Backed 91 Organization Dataset
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-semibold text-sm">
            Searching channel partners...
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-600 text-sm space-y-3 shadow-xs">
            <p className="font-semibold">No channel partners found matching the selected filter criteria.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Show All 91 Channel Partners on Map
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div key={partner.partner_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all card-hover-lift flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[11px] rounded-md border border-indigo-200">
                      {partner.partner_type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{partner.partner_id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {partner.partner_name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-3">{partner.city}, {partner.state}</p>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 leading-tight">
                    {partner.address}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 text-indigo-900 bg-indigo-50 p-1.5 rounded-md border border-indigo-200 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{partner.location_notice || 'Address-based location'}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${partner.partner_name}, ${partner.address}, ${partner.city}, ${partner.state}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t.btnGetDirections}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
