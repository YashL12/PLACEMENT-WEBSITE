import React, { useState } from 'react';
import { MapPin, Globe2, Building } from 'lucide-react';

export const GeoAnalyticsCard = ({ countries = [], states = [], cities = [] }) => {
  const [activeTab, setActiveTab] = useState('country');

  const getList = () => {
    if (activeTab === 'country') return countries;
    if (activeTab === 'state') return states;
    return cities;
  };

  const list = getList();
  const maxCount = list.length > 0 ? Math.max(...list.map((item) => item.count || 0), 1) : 1;
  const totalCount = list.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Approximate Geolocation
            </h3>
            <span className="text-[10px] text-slate-400">Server & Edge IP-based resolution</span>
          </div>
        </div>

        {/* Sub-tabs: Country / State / City */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('country')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'country'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Countries ({countries.length})
          </button>
          <button
            onClick={() => setActiveTab('state')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'state'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            States ({states.length})
          </button>
          <button
            onClick={() => setActiveTab('city')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'city'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cities ({cities.length})
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No location records detected in this period
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {list.map((item, idx) => {
            const pctOfMax = Math.round((item.count / maxCount) * 100);
            const pctOfTotal = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
            const displayName = item.country
              ? `${item.name}, ${item.country}`
              : item.name || 'Unknown';

            return (
              <div
                key={idx}
                className="group p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[11px] font-bold text-slate-400 text-center">
                      #{idx + 1}
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-400 w-9 text-right font-medium">
                      {pctOfTotal}%
                    </span>
                  </div>
                </div>

                {/* Relative Volume Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden ml-7 max-w-[calc(100%-28px)]">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(3, pctOfMax)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GeoAnalyticsCard;

