import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Smartphone, Monitor, Tablet, MapPin, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const RealtimeWidget = () => {
  const [data, setData] = useState({ activeCount: 0, visitors: [] });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastFetched, setLastFetched] = useState(new Date());

  const fetchRealtime = async () => {
    try {
      const res = await api.getAnalyticsRealtime();
      if (res.success && res.data) {
        setData(res.data);
        setLastFetched(new Date());
      }
    } catch (err) {
      // Fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtime();
  }, []);

  // Polling every 12 seconds when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchRealtime();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getDeviceIcon = (device) => {
    const lower = (device || '').toLowerCase();
    if (lower.includes('mobile')) return <Smartphone className="w-3.5 h-3.5 text-indigo-500" />;
    if (lower.includes('tablet')) return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
    return <Monitor className="w-3.5 h-3.5 text-blue-500" />;
  };

  const formatSecondsAgo = (seconds) => {
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m ago`;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Live Visitor Monitoring
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ACTIVE NOW: {data.activeCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Visitors active within the last 5 minutes (auto-polled every 12s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>Auto Refresh</span>
          </label>

          <button
            onClick={fetchRealtime}
            disabled={loading}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="Refresh active visitors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Visitors List / Cards */}
      {data.visitors.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
          <Radio className="w-6 h-6 text-slate-300" />
          <span>No visitors currently browsing the public site</span>
          <span className="text-[10px] text-slate-400">Activity refreshes automatically</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.visitors.map((v) => (
            <div
              key={v.sessionId}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                  {v.visitorId.slice(0, 14)}...
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {formatSecondsAgo(v.activeSeconds)}
                </span>
              </div>

              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium w-12 shrink-0">Viewing:</span>
                  <span className="font-mono text-blue-700 truncate font-semibold" title={v.currentPage}>
                    {v.currentPage}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium w-12 shrink-0">Device:</span>
                  <span className="flex items-center gap-1 text-slate-800 font-medium">
                    {getDeviceIcon(v.device)}
                    <span>{v.device} • {v.browser}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium w-12 shrink-0">Location:</span>
                  <span className="flex items-center gap-1 text-slate-700 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{v.location}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealtimeWidget;

