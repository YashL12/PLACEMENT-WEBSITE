import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Eye,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Globe2,
  Monitor,
  Share2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsChart } from '../components/analytics/AnalyticsChart';
import { DonutDistribution } from '../components/analytics/DonutDistribution';
import { GeoAnalyticsCard } from '../components/analytics/GeoAnalyticsCard';
import { RealtimeWidget } from '../components/analytics/RealtimeWidget';
import { VisitorDetailModal } from '../components/analytics/VisitorDetailModal';

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom Range', value: 'custom' },
];

export const AdminAnalyticsPage = () => {
  // Filter States
  const [range, setRange] = useState('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Data States
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState({ points: [], isHourly: false });
  const [pages, setPages] = useState([]);
  const [deviceStats, setDeviceStats] = useState({ devices: [], browsers: [], operatingSystems: [] });
  const [geoStats, setGeoStats] = useState({ countries: [], states: [], cities: [] });
  const [trafficSources, setTrafficSources] = useState([]);

  // Visitors Table State
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastVisit');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedVisitorId, setSelectedVisitorId] = useState(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState('sessions');
  const [exporting, setExporting] = useState(false);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [purgeDays, setPurgeDays] = useState('90');
  const [purging, setPurging] = useState(false);

  // Extra Tab States
  const [activeMainTab, setActiveMainTab] = useState('overview');
  const [searchesData, setSearchesData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [journeysData, setJourneysData] = useState(null);
  const [extraLoading, setExtraLoading] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Fetch Main Analytics Data ──────────────────────────────────────────────
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = { range };
      if (range === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }

      const [
        overviewRes,
        trendsRes,
        pagesRes,
        devicesRes,
        geoRes,
        sourcesRes,
      ] = await Promise.all([
        api.getAnalyticsOverview(params),
        api.getAnalyticsTrends(params),
        api.getAnalyticsPages(params),
        api.getAnalyticsDevices(params),
        api.getAnalyticsGeo(params),
        api.getAnalyticsSources(params),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (pagesRes.success) setPages(pagesRes.data);
      if (devicesRes.success) setDeviceStats(devicesRes.data);
      if (geoRes.success) setGeoStats(geoRes.data);
      if (sourcesRes.success) setTrafficSources(sourcesRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [range, customStart, customEnd]);

  // ── Fetch Visitors List ───────────────────────────────────────────────────
  const loadVisitors = useCallback(async () => {
    try {
      setTableLoading(true);
      const res = await api.getAnalyticsVisitors({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        sortBy,
        order: sortOrder,
      });

      if (res.success && res.data) {
        setVisitors(res.data.visitors);
        setPagination((prev) => ({ ...prev, ...res.data.pagination }));
      }
    } catch (err) {
      console.error('Error fetching visitors list:', err);
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  // ── Fetch Extra Analytics (Searches / Engagement / Journeys) ─────────────
  const loadExtraAnalytics = useCallback(async () => {
    if (activeMainTab === 'overview') return;
    try {
      setExtraLoading(true);
      const params = { range };
      if (range === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      const [searchRes, engRes, journeyRes] = await Promise.all([
        api.getAnalyticsSearches(params),
        api.getAnalyticsEngagement(params),
        api.getAnalyticsJourneys(params),
      ]);
      if (searchRes.success) setSearchesData(searchRes.data);
      if (engRes.success) setEngagementData(engRes.data);
      if (journeyRes.success) setJourneysData(journeyRes.data);
    } catch (err) {
      console.error('Extra analytics error:', err);
    } finally {
      setExtraLoading(false);
    }
  }, [activeMainTab, range, customStart, customEnd]);

  useEffect(() => {
    loadExtraAnalytics();
  }, [loadExtraAnalytics]);

  // ── Export CSV Handler ────────────────────────────────────────────────────
  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await api.downloadAnalyticsCsv(range, exportType);
      showNotification(`Successfully exported ${exportType} CSV`);
      setExportModalOpen(false);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  // ── Purge Data Handler ────────────────────────────────────────────────────
  const handlePurgeRetention = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently purge all visitor analytics older than ${purgeDays} days?`
      )
    ) {
      return;
    }

    try {
      setPurging(true);
      const res = await api.purgeAnalyticsData({ olderThanDays: purgeDays });
      if (res.success) {
        showNotification(res.message);
        setPurgeModalOpen(false);
        loadAnalytics();
        loadVisitors();
      }
    } catch (err) {
      alert(`Purge failed: ${err.message}`);
    } finally {
      setPurging(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification(`Copied '${text}' to clipboard`);
  };

  const formatSeconds = (sec) => {
    if (!sec || sec <= 0) return '0s';
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    if (mins === 0) return `${rem}s`;
    return `${mins}m ${rem}s`;
  };

  const formatDelta = (delta) => {
    if (delta === 0) return <span className="text-slate-400 font-medium">0% vs prev</span>;
    const isPos = delta > 0;
    return (
      <span
        className={`flex items-center gap-0.5 font-bold ${
          isPos ? 'text-emerald-600' : 'text-rose-600'
        }`}
      >
        {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {isPos ? `+${delta}%` : `${delta}%`} vs prev
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-700">
              GECR Placement Sarthi • Business Intelligence & Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Visitor Analytics & Traffic Insights
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Anonymous visitor tracking, engagement trends, real-time activity, device analytics, and geographic intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/dashboard"
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>&larr; Back to Dashboard</span>
          </Link>

          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setPurgeModalOpen(true)}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Data retention & privacy cleanup"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Retention</span>
          </button>

          <button
            onClick={() => {
              loadAnalytics();
              loadVisitors();
              showNotification('Analytics data refreshed');
            }}
            title="Refresh analytics data"
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ── DATE RANGE FILTER BAR ─────────────────────────────────────────── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto py-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                range === r.value
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker */}
        {range === 'custom' && (
          <div className="flex items-center gap-2 text-xs flex-wrap w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
            />
            <span className="text-slate-400 font-medium">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
            />
            <button
              onClick={loadAnalytics}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ── MAIN ANALYTICS TABS ─────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'overview', label: 'Traffic Overview' },
          { id: 'searches', label: 'Search Intelligence' },
          { id: 'engagement', label: 'Practice & Feature Engagement' },
          { id: 'journeys', label: 'User Journeys' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeMainTab === tab.id
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeMainTab === 'overview' && (
        <>

      {/* ── REAL-TIME MONITORING WIDGET ───────────────────────────────────── */}
      <RealtimeWidget />

      {/* ── OVERVIEW METRIC CARDS (8 CARDS) ───────────────────────────────── */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Visitors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Sessions</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {overview.totalVisitors.value}
            </span>
            <div className="text-[11px]">{formatDelta(overview.totalVisitors.change)}</div>
          </div>

          {/* Card 2: Unique Visitors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Unique Visitors</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {overview.uniqueVisitors.value}
            </span>
            <div className="text-[11px]">{formatDelta(overview.uniqueVisitors.change)}</div>
          </div>

          {/* Card 3: Total Page Views */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Page Views</span>
              <Eye className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {overview.totalPageViews.value}
            </span>
            <div className="text-[11px]">{formatDelta(overview.totalPageViews.change)}</div>
          </div>

          {/* Card 4: Active Visitors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Right Now</span>
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {overview.activeVisitors.value}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active (last 5 min)
            </span>
          </div>

          {/* Card 5: Returning Visitors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Returning Visitors</span>
              <RefreshCw className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {overview.returningVisitors.value}
            </span>
            <span className="text-[11px] text-purple-700 font-medium">
              {overview.uniqueVisitors.value > 0
                ? Math.round((overview.returningVisitors.value / overview.uniqueVisitors.value) * 100)
                : 0}
              % of unique visitors
            </span>
          </div>

          {/* Card 6: New Visitors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">New Visitors</span>
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {overview.newVisitors.value}
            </span>
            <span className="text-[11px] text-sky-700 font-medium">
              First-time students
            </span>
          </div>

          {/* Card 7: Avg Session Duration */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Avg Duration</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {formatSeconds(overview.avgSessionDuration.value)}
            </span>
            <div className="text-[11px]">{formatDelta(overview.avgSessionDuration.change)}</div>
          </div>

          {/* Card 8: Bounce Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Bounce Rate</span>
              <Share2 className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {overview.bounceRate.value}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Single-page visits
            </span>
          </div>
        </div>
      )}

      {/* ── CHARTS & GEO SECTION ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Traffic Over Time (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Traffic & Engagement Over Time
              </h2>
              <p className="text-[11px] text-slate-500">
                Page views and unique visitors trend across the selected timeline
              </p>
            </div>
          </div>

          <AnalyticsChart data={trends.points} isHourly={trends.isHourly} />
        </div>

        {/* Right: Geographic Distribution (1 col) */}
        <div className="lg:col-span-1">
          <GeoAnalyticsCard
            countries={geoStats.countries}
            states={geoStats.states}
            cities={geoStats.cities}
          />
        </div>
      </div>

      {/* ── SECONDARY BREAKDOWNS (DEVICES, BROWSERS, OS, SOURCES) ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DonutDistribution
          title="Devices"
          items={deviceStats.devices}
          icon={Monitor}
        />
        <DonutDistribution
          title="Browsers"
          items={deviceStats.browsers}
          icon={Globe2}
        />
        <DonutDistribution
          title="Operating Systems"
          items={deviceStats.operatingSystems}
          icon={Monitor}
        />
        <DonutDistribution
          title="Traffic Sources"
          items={trafficSources}
          icon={Share2}
        />
      </div>

      {/* ── TOP VISITED PAGES TABLE ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs mb-8 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Most Visited Pages
            </h2>
            <p className="text-[11px] text-slate-500">
              Ranked by aggregate page views, unique visitors, and average dwell time
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Top {pages.length} Pages</span>
        </div>

        {pages.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No page visits logged for this date range
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5 pl-6">Rank</th>
                  <th className="p-3.5">Page URL & Title</th>
                  <th className="p-3.5 text-right">Total Views</th>
                  <th className="p-3.5 text-right">Unique Visitors</th>
                  <th className="p-3.5 text-right">Avg Time Spent</th>
                  <th className="p-3.5 pr-6 w-48">Traffic Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pages.map((p, idx) => {
                  const maxViews = pages[0]?.totalViews || 1;
                  const pct = Math.round((p.totalViews / maxViews) * 100);

                  return (
                    <tr key={p.pageUrl || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="font-mono text-blue-700 font-semibold">{p.pageUrl}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">
                          {p.pageTitle}
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">{p.totalViews}</td>
                      <td className="p-3.5 text-right text-slate-700">{p.uniqueVisitors}</td>
                      <td className="p-3.5 text-right text-slate-800 font-mono">
                        {formatSeconds(p.avgTimeSpent)}
                      </td>
                      <td className="p-3.5 pr-6">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${Math.max(4, pct)}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SEARCHABLE & PAGINATED DETAILED VISITOR ACTIVITY TABLE ─────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Detailed Visitor Audit Trail
            </h2>
            <p className="text-[11px] text-slate-500">
              Searchable anonymous visitor logs, IP tracking, sessions, and individual drilldowns
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Search ID, IP, location..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="lastVisit">Sort: Last Seen</option>
              <option value="firstVisit">Sort: First Seen</option>
              <option value="totalSessions">Sort: Sessions</option>
              <option value="totalPageViews">Sort: Page Views</option>
            </select>
          </div>
        </div>

        {tableLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading visitor records...
          </div>
        ) : visitors.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No visitor records match the search query
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5 pl-6">Visitor ID</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Device & Browser</th>
                  <th className="p-3.5">OS</th>
                  <th className="p-3.5">First Seen</th>
                  <th className="p-3.5">Last Seen</th>
                  <th className="p-3.5 text-center">Sessions</th>
                  <th className="p-3.5 text-center">Views</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {visitors.map((v) => (
                  <tr
                    key={v.visitorId}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedVisitorId(v.visitorId)}
                  >
                    <td className="p-3.5 pl-6">
                      <span className="font-mono font-bold text-slate-800 text-[11px] group-hover:text-blue-600 transition-colors">
                        {v.visitorId.slice(0, 16)}...
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                        <span>{v.ip || '127.0.0.1'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(v.ip || '127.0.0.1');
                          }}
                          title="Copy IP"
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-0.5"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="truncate block max-w-[130px]" title={`${v.city}, ${v.country}`}>
                        {v.city || 'Unknown'}, {v.country || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="truncate block max-w-[120px]">
                        {v.device} • {v.browser}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{v.os}</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {new Date(v.firstVisit).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {new Date(v.lastVisit).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800">
                      {v.totalSessions}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800">
                      {v.totalPageViews}
                    </td>
                    <td className="p-3.5">
                      {v.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 w-fit">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVisitorId(v.visitorId);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Drilldown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{pagination.total}</span> visitors
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* end overview tab */}
      </>
      )}

      {/* ── SEARCH INTELLIGENCE TAB ─────────────────────────────────────────── */}
      {activeMainTab === 'searches' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Search Query Intelligence</h2>
            <p className="text-xs text-slate-500 mb-5">What students search for across companies, alumni, practice, and learning materials.</p>
            {extraLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading search analytics...</div>
            ) : !searchesData || searchesData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No search activity recorded in this period</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3.5 pl-6">Rank</th>
                      <th className="p-3.5">Search Query</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-right">Times Searched</th>
                      <th className="p-3.5 text-right">Unique Users</th>
                      <th className="p-3.5">Last Searched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchesData.map((s, idx) => (
                      <tr key={s.query || idx} className="hover:bg-slate-50/70">
                        <td className="p-3.5 pl-6 font-bold text-slate-400">#{idx + 1}</td>
                        <td className="p-3.5 font-semibold text-slate-900">"{s.query}"</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold capitalize">
                            {s.category || 'general'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-bold text-slate-900">{s.count}</td>
                        <td className="p-3.5 text-right text-slate-700">{s.uniqueUsers}</td>
                        <td className="p-3.5 text-xs text-slate-400">{s.lastSearched ? new Date(s.lastSearched).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRACTICE & FEATURE ENGAGEMENT TAB ──────────────────────────────── */}
      {activeMainTab === 'engagement' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Practice &amp; Feature Engagement</h2>
            <p className="text-xs text-slate-500 mb-5">How students interact with DSA questions, SQL practice, code submissions, downloads, and feature buttons.</p>
            {extraLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading engagement analytics...</div>
            ) : !engagementData ? (
              <div className="py-12 text-center text-slate-400 text-xs">No engagement data recorded in this period</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(engagementData).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── USER JOURNEYS TAB ───────────────────────────────────────────────── */}
      {activeMainTab === 'journeys' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">User Journey Analysis</h2>
            <p className="text-xs text-slate-500 mb-5">How visitors navigate through the platform — entry pages, flow transitions, and exit points.</p>
            {extraLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading journey analytics...</div>
            ) : !journeysData || (Array.isArray(journeysData) && journeysData.length === 0) ? (
              <div className="py-12 text-center text-slate-400 text-xs">No journey data recorded in this period</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3.5 pl-6">Entry Page</th>
                      <th className="p-3.5">Exit Page</th>
                      <th className="p-3.5 text-right">Sessions</th>
                      <th className="p-3.5 text-right">Avg Pages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(Array.isArray(journeysData) ? journeysData : []).map((j, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-3.5 pl-6 font-mono text-blue-700">{j.entryPage || '/'}</td>
                        <td className="p-3.5 font-mono text-slate-700">{j.exitPage || '—'}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900">{j.sessions}</td>
                        <td className="p-3.5 text-right text-slate-700">{j.avgPages?.toFixed(1) || '1.0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VISITOR DRILLDOWN MODAL ───────────────────────────────────────── */}
      {selectedVisitorId && (
        <VisitorDetailModal
          visitorId={selectedVisitorId}
          onClose={() => setSelectedVisitorId(null)}
          onPurged={() => {
            loadVisitors();
            loadAnalytics();
            showNotification(`Visitor records purged successfully`);
          }}
        />
      )}

      {/* ── CSV EXPORT MODAL ──────────────────────────────────────────────── */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Export Analytics Data</h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Download clean, unaggregated CSV telemetry reports for reporting, audits, or Excel analysis.
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 block">Export Dataset</label>
              <div className="space-y-2">
                {[
                  { id: 'sessions', label: 'Visitor Sessions (Session ID, Referrer, Durations, Bounces)' },
                  { id: 'visitors', label: 'Visitors (Visitor ID, Server IP, Geolocation, Device, Totals)' },
                  { id: 'pages', label: 'Page Views (Page URL, Title, Aggregate Views, Dwell Time)' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <input
                      type="radio"
                      name="exportType"
                      value={opt.id}
                      checked={exportType === opt.id}
                      onChange={(e) => setExportType(e.target.value)}
                      className="mt-0.5 text-blue-600"
                    />
                    <span className="font-medium text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting ? 'Generating CSV...' : 'Download CSV'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RETENTION & DATA PURGE MODAL ──────────────────────────────────── */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Data Retention & Purge</h3>
              </div>
              <button
                onClick={() => setPurgeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Comply with privacy regulations and conserve database storage by automatically purging historical telemetry data older than a designated threshold.
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 block">Purge Data Older Than</label>
              <select
                value={purgeDays}
                onChange={(e) => setPurgeDays(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
              >
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days (Recommended)</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year (365 Days)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPurgeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeRetention}
                disabled={purging}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{purging ? 'Purging...' : 'Execute Purge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;

