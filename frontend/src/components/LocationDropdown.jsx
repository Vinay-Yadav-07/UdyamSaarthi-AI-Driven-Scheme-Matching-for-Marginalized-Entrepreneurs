import React, { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { api } from '../services/api';

export default function LocationDropdown({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  t
}) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [stateSearch, setStateSearch] = useState('');
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    async function loadStates() {
      try {
        setLoadingStates(true);
        const data = await api.getStates();
        setStates(data.states || []);
      } catch (err) {
        console.error("Failed to load states:", err);
      } finally {
        setLoadingStates(false);
      }
    }
    loadStates();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    async function loadDistricts() {
      try {
        setLoadingDistricts(true);
        const data = await api.getDistricts(selectedState);
        setDistricts(data.districts || []);
      } catch (err) {
        console.error("Failed to load districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    }
    loadDistricts();
  }, [selectedState]);

  const filteredStates = states.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* State Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{t.labelState}</span>
        </label>
        <select
          value={selectedState || ''}
          onChange={(e) => {
            onStateChange(e.target.value);
            onDistrictChange('');
          }}
          disabled={loadingStates}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-xs hover:border-slate-400 disabled:bg-slate-50"
        >
          <option value="">-- {t.labelState} (36 States/UTs) --</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* District Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{t.labelDistrict}</span>
        </label>
        <select
          value={selectedDistrict || ''}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!selectedState || loadingDistricts}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-xs hover:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">-- {t.labelDistrict} --</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
