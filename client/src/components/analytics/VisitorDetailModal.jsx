import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Clock,
  Layers,
  FileText,
  MapPin,
  Monitor,
  Calendar,
  Compass,
  ArrowRight,
  Shield,
  Trash2,
  Activity,
  Search,
  Code2,
  Download,
} from 'lucide-react';
import { api } from '../../services/api';

export const VisitorDetailModal = ({ visitorId, onClose, onPurged }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    if (!visitorId) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalyticsVisitorDetails(visitorId);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [visitorId]);

  if (!visitorId) return null;

  const handlePurge = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete all tracking records for visitor ${visitorId}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setPurging(true);
      const res = await api.purgeAnalyticsData({ visitorId });
      if (res.success) {
        alert(res.message);
        if (onPurged) onPurged(visitorId);
        onClose();
      }
    } catch (err) {
      alert(`Error purging records: ${err.message}`);
    } finally {
      setPurging(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins}m ${rem}s`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  data?.visitor?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              ></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Visitor Detail Drilldown • {data?.visitor?.isActive ? 'Active Now' : 'Offline'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
              {visitorId}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive telemetry trail, historical session lifecycles, and page navigations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePurge}
              disabled={purging}
              title="GDPR/Privacy: Delete this visitor's data"
              className="px-3 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{purging ? 'Purging...' : 'Delete Data'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            Loading visitor records...
          </div>
        ) : !data || !data.visitor ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            Visitor record not found
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Quick Profile Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Server IP (Admin Only)
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 break-all">
                  {data.visitor.ip || '127.0.0.1'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Location
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {data.visitor.city}, {data.visitor.country}
                  </span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Device & OS
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                  <Monitor className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">
                    {data.visitor.device} • {data.visitor.os}
                  </span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Visits
                </span>
                <span className="text-xs font-bold text-indigo-700">
                  {data.visitor.totalSessions} Sessions • {data.visitor.totalPageViews} Views
                </span>
              </div>
            </div>

            {/* Sub-tabs: Sessions vs Page Views vs Events */}
            <div className="flex items-center gap-3 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'sessions'
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Historical Sessions ({data.sessions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('pageViews')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pageViews'
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Page Navigation Trail ({data.pageViews.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'events'
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Actions & Events ({data.events?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: SESSIONS */}
            {activeTab === 'sessions' && (
              <div className="space-y-3">
                {data.sessions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No sessions recorded</div>
                ) : (
                  data.sessions.map((s, idx) => (
                    <div
                      key={s.sessionId || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all text-xs"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">
                            {s.sessionId}
                          </span>
                          {s.isBounce ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                              Bounce
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Engaged
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {formatDate(s.startedAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Duration & Pages
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formatDuration(s.duration)} • {s.pageViewCount} page views
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Entry & Exit Pages
                          </span>
                          <span className="font-mono text-blue-700 truncate block">
                            {s.entryPage} <ArrowRight className="w-2.5 h-2.5 inline mx-1 text-slate-400" /> {s.exitPage}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Referrer Source
                          </span>
                          <span className="font-medium text-slate-700 truncate block">
                            {s.referrerDomain || 'Direct'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: PAGE VIEWS */}
            {activeTab === 'pageViews' && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Page URL</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Entered At</th>
                      <th className="p-3">Time Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {data.pageViews.map((pv, idx) => (
                      <tr key={pv._id || idx} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono text-blue-700">{pv.pageUrl}</td>
                        <td className="p-3 text-slate-800 truncate max-w-[200px]">
                          {pv.pageTitle || 'Untitled'}
                        </td>
                        <td className="p-3 text-slate-500">{formatDate(pv.enteredAt)}</td>
                        <td className="p-3 font-bold text-slate-800">
                          {formatDuration(pv.timeSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: ACTIONS & USER EVENTS */}
            {activeTab === 'events' && (
              <div className="space-y-3">
                {!data.events || data.events.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No specific interaction events logged for this visitor
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-3 pl-4">Event Type</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Action & Label</th>
                          <th className="p-3">Details / Query</th>
                          <th className="p-3 pr-4 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {data.events.map((ev, idx) => {
                          const meta = ev.metadata || {};
                          const detailText =
                            meta.query ||
                            meta.title ||
                            meta.questionTitle ||
                            meta.platform ||
                            meta.company ||
                            meta.companyName ||
                            meta.fileName ||
                            '';

                          return (
                            <tr key={ev._id || idx} className="hover:bg-slate-50/60">
                              <td className="p-3 pl-4">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                                  {ev.eventType?.replace(/_/g, ' ') || 'Event'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 capitalize">
                                {ev.category || 'general'}
                              </td>
                              <td className="p-3">
                                <span className="font-semibold text-slate-900 block">
                                  {ev.action || ev.label || '—'}
                                </span>
                                {ev.label && ev.action && ev.label !== ev.action && (
                                  <span className="text-[11px] text-slate-400">{ev.label}</span>
                                )}
                              </td>
                              <td className="p-3">
                                {detailText ? (
                                  <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                    {detailText}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">—</span>
                                )}
                              </td>
                              <td className="p-3 pr-4 text-right text-slate-500 text-[11px]">
                                {formatDate(ev.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorDetailModal;

