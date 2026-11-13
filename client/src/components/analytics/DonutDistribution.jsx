import React from 'react';
import { Monitor, Smartphone, Tablet, Globe, HardDrive, Compass } from 'lucide-react';

const COLORS = [
  'bg-blue-600',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-slate-400',
];

export const DonutDistribution = ({ title, items = [], icon: Icon = Compass, totalCount = 0 }) => {
  const sum = totalCount > 0 ? totalCount : items.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const getDeviceIcon = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('mobile')) return Smartphone;
    if (lower.includes('tablet')) return Tablet;
    if (lower.includes('desktop')) return Monitor;
    return Icon;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">{sum} total</span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">No distribution data</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const pct = sum > 0 ? Math.round((item.count / sum) * 100) : 0;
            const ItemIcon = getDeviceIcon(item.name);
            const colorClass = COLORS[idx % COLORS.length];

            return (
              <div key={item.name || idx}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <ItemIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
                      {item.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${Math.max(2, pct)}%` }}
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

export default DonutDistribution;

