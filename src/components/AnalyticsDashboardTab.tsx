import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  TrendingUp, 
  Calendar, 
  Share2, 
  Download, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Compass, 
  RefreshCw,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { AnalyticsService } from '../services/analyticsService';
import { AnalyticsSummary, PageViewEvent } from '../types/portfolio';

interface AnalyticsDashboardTabProps {
  darkMode: boolean;
}

const DEVICE_COLORS = ['#6366f1', '#38bdf8', '#a855f7'];
const SOURCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export const AnalyticsDashboardTab: React.FC<AnalyticsDashboardTabProps> = ({ darkMode }) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [summary, setSummary] = useState<AnalyticsSummary>(() => AnalyticsService.getAnalyticsSummary('all'));
  const [recentEvents, setRecentEvents] = useState<PageViewEvent[]>([]);
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadData = () => {
    const sum = AnalyticsService.getAnalyticsSummary(timeFilter);
    setSummary(sum);
    const all = AnalyticsService.getAllEvents();
    setRecentEvents(all.slice(0, 15));
  };

  const syncGlobalData = async () => {
    setIsSyncing(true);
    try {
      await AnalyticsService.syncGlobalEvents();
      loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    syncGlobalData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('portfolio_analytics_updated', handleUpdate);

    // Auto-poll every 6 seconds for live global visits from other devices/browsers
    const intervalId = setInterval(() => {
      AnalyticsService.syncGlobalEvents().then(() => {
        loadData();
      });
    }, 6000);

    return () => {
      window.removeEventListener('portfolio_analytics_updated', handleUpdate);
      clearInterval(intervalId);
    };
  }, [timeFilter]);

  // Trigger a test visit to verify tracking instantly
  const handleSimulateTestVisit = async () => {
    const testPaths = ['/', '/projects', '/contact', '/experience', '/blog'];
    const randomPath = testPaths[Math.floor(Math.random() * testPaths.length)];
    await AnalyticsService.trackPageView(randomPath, `Live Test View: ${randomPath}`);
    await AnalyticsService.syncGlobalEvents();
    loadData();
    showNotice(`✅ টেস্ট ভিজিটর সফলভাবে রেকর্ড হয়েছে (${randomPath})! চার্ট ও কাউন্টার আপডেট হয়েছে।`);
  };

  const handleExportJson = () => {
    const jsonStr = AnalyticsService.exportAnalyticsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-real-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Real Analytics JSON Exported Successfully!');
  };

  const handleExportCsv = () => {
    const csvStr = AnalyticsService.exportAnalyticsCsv();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-real-analytics-raw-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Real Analytics CSV Exported Successfully!');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to clear real analytics events? This will reset telemetry to zero until new visits occur.')) {
      AnalyticsService.resetAnalytics();
      loadData();
      showNotice('Analytics database cleared successfully.');
    }
  };

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Format seconds to mm:ss
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // Active chart data
  const chartData = chartView === 'daily' 
    ? summary.dailyViews 
    : chartView === 'weekly' 
      ? summary.weeklyViews 
      : summary.monthlyViews;

  const chartXKey = chartView === 'daily' ? 'date' : chartView === 'weekly' ? 'week' : 'month';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold">Visitor Analytics & Real Traffic</h3>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              100% Real Live Traffic
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified telemetry: Real unique visitors, authentic page views, live geo IP locations & device breakdown.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Time Filter Pills */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['all', 'today', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeFilter(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeFilter === range
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'all' ? 'All Time' : range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={syncGlobalData}
            disabled={isSyncing}
            title="Sync Live Global Telemetry"
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Test Real Visit Button */}
          <button
            type="button"
            onClick={handleSimulateTestVisit}
            title="Trigger a live visit event to test tracking instantly"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">টেস্ট ভিজিট যোগ করুন</span>
          </button>

          {/* Action buttons */}
          <button
            type="button"
            onClick={handleExportJson}
            title="Export JSON Report"
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            title="Export CSV Raw Telemetry"
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            title="Clear Analytics Data"
            className={`p-2 rounded-xl border text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 1. KEY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Visitors */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Unique Visitors</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {summary.uniqueVisitors.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
            <span>{summary.totalVisitors.toLocaleString()} Total Sessions</span>
          </div>
        </div>

        {/* Total Pageviews */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Page Views</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-sky-400">
            {summary.totalPageViews.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>
              {summary.uniqueVisitors > 0 
                ? `${(summary.totalPageViews / summary.uniqueVisitors).toFixed(1)} views/visitor` 
                : '0 views/visitor'}
            </span>
          </div>
        </div>

        {/* Today & Weekly Visitors */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Today's Visitors</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-400">
            {summary.todayVisitors.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>{summary.weeklyVisitors.toLocaleString()} this week</span>
          </div>
        </div>

        {/* Avg Duration & Returning */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg Session Duration</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-400">
            {formatDuration(summary.avgSessionDuration)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>{summary.returningVisitors} Returning sessions</span>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE VISITOR TIMELINE CHART */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Visitor & Page View Traffic Trends (Actual Data)</span>
            </h4>
            <p className="text-xs text-slate-400">Real counts recorded over time</p>
          </div>

          <div className={`p-0.5 rounded-xl border flex items-center gap-1 w-fit ${
            darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setChartView(view)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  chartView === view
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData as any} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} opacity={0.5} />
              <XAxis 
                dataKey={chartXKey} 
                stroke={darkMode ? '#94a3b8' : '#64748b'} 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke={darkMode ? '#94a3b8' : '#64748b'} 
                fontSize={11} 
                tickLine={false} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area 
                type="monotone" 
                dataKey="pageViews" 
                name="Page Views" 
                stroke="#38bdf8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                name="Unique Visitors" 
                stroke="#6366f1" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorVisitors)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. SOURCES & DEVICES BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Traffic Source Channels</span>
          </h4>
          <div className="space-y-2.5">
            {summary.sources.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No traffic source recorded yet.</p>
            ) : (
              summary.sources.map((src, i) => (
                <div key={src.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                      />
                      <span>{src.name}</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      {src.count} ({src.percentage}%)
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.max(src.percentage, 2)}%`,
                        backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] 
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Statistics */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Device Breakdown & Screen Types</span>
          </h4>
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            {summary.devices.map((dev) => (
              <div 
                key={dev.name} 
                className={`p-3 rounded-2xl border ${
                  darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-center mb-1.5 text-indigo-400">
                  {dev.name === 'Desktop' ? <Monitor className="w-5 h-5" /> : dev.name === 'Mobile' ? <Smartphone className="w-5 h-5" /> : <Tablet className="w-5 h-5" />}
                </div>
                <div className="text-xs font-semibold">{dev.name}</div>
                <div className="text-sm font-extrabold mt-0.5">{dev.percentage}%</div>
                <div className="text-[10px] text-slate-400">{dev.count} visits</div>
              </div>
            ))}
          </div>

          {/* Browser list */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Browsers:</span>
            <div className="flex flex-wrap gap-2">
              {summary.browsers.length === 0 ? (
                <span className="text-xs text-slate-400">No browser data yet</span>
              ) : (
                summary.browsers.slice(0, 5).map((b) => (
                  <span 
                    key={b.name}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {b.name}: <strong className="font-mono text-indigo-400">{b.count}</strong>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MOST VIEWED PAGES & PROJECTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Viewed Pages */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Most Viewed Pages</span>
          </h4>
          <div className="divide-y divide-slate-800/40">
            {summary.topPages.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">No page views recorded for this filter yet.</p>
            ) : (
              summary.topPages.map((page, idx) => (
                <div key={page.path} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold truncate">{page.title || page.path}</p>
                      <code className="text-[11px] text-slate-400 truncate block">{page.path}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-mono font-bold text-sky-400">
                    <span>{page.views}</span>
                    <span className="text-[10px] text-slate-400 font-sans">views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Viewed Projects */}
        <div className={`p-5 rounded-3xl border ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Top Engaging Projects</span>
          </h4>
          <div className="divide-y divide-slate-800/40">
            {summary.topProjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">No project case studies viewed yet. Live tracking active.</p>
            ) : (
              summary.topProjects.map((proj, idx) => (
                <div key={proj.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="font-semibold truncate">{proj.title}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-mono font-bold text-amber-400">
                    <span>{proj.views}</span>
                    <span className="text-[10px] text-slate-400 font-sans">views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. GEOGRAPHIC INTELLIGENCE (COUNTRIES & CITIES) */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Geographic Distribution (Real Countries & Cities)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Top Countries */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Countries:</span>
            <div className="space-y-2">
              {summary.countries.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No geographic location captured yet.</p>
              ) : (
                summary.countries.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] uppercase">
                        {c.code}
                      </span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-mono text-slate-400">{c.count} visits</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Cities */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Cities:</span>
            <div className="space-y-2">
              {summary.cities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No city location captured yet.</p>
              ) : (
                summary.cities.map((city) => (
                  <div key={`${city.name}-${city.country}`} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>{city.name}, {city.country}</span>
                    </span>
                    <span className="font-mono text-slate-400">{city.count} visits</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. REAL-TIME ACTIVITY LOG */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-Time Live Event Stream</span>
          </h4>
          <span className="text-xs text-slate-400">Latest Recorded Visits ({recentEvents.length})</span>
        </div>

        <div className="overflow-x-auto">
          {recentEvents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No visitor events recorded yet. Browse any page to see live events appear here instantly!</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                  <th className="pb-2 font-semibold">Time</th>
                  <th className="pb-2 font-semibold">Page Path</th>
                  <th className="pb-2 font-semibold">Source</th>
                  <th className="pb-2 font-semibold">Device</th>
                  <th className="pb-2 font-semibold">Browser</th>
                  <th className="pb-2 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {recentEvents.map((evt) => {
                  const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return (
                    <tr key={evt.id} className="hover:bg-indigo-500/5 transition-colors">
                      <td className="py-2.5 font-mono text-slate-400 whitespace-nowrap">{timeStr}</td>
                      <td className="py-2.5 font-semibold text-indigo-400 truncate max-w-[160px]">
                        {evt.path}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {evt.source}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">{evt.deviceType}</td>
                      <td className="py-2.5 text-slate-300">{evt.browser}</td>
                      <td className="py-2.5 text-slate-400">{evt.city}, {evt.countryCode}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
