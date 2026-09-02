/**
 * Visitor Analytics Engine & Tracking Service
 * 100% Real-Time Live Telemetry: Tracks Real Page Views, Unique Visitors, Traffic Sources, Geolocation & Devices
 * Supports Dual-Engine Sync: Direct Supabase Cloud Database + Server-side In-Memory Engine + Local Cache
 */

import { createClient } from '@supabase/supabase-js';
import { PageViewEvent, AnalyticsSummary } from '../types/portfolio';

const ANALYTICS_EVENTS_KEY = 'DYNAMIC_PORTFOLIO_REAL_ANALYTICS_EVENTS_V2';
const SESSION_ID_KEY = 'DYNAMIC_PORTFOLIO_REAL_SESSION_ID_V2';
const VISITOR_ID_KEY = 'DYNAMIC_PORTFOLIO_REAL_VISITOR_ID_V2';
const SESSION_START_KEY = 'DYNAMIC_PORTFOLIO_REAL_SESSION_START_V2';
const GEO_CACHE_KEY = 'DYNAMIC_PORTFOLIO_REAL_GEO_CACHE_V2';
const LAST_TRACKED_KEY = 'DYNAMIC_PORTFOLIO_REAL_LAST_TRACKED_V2';

// Initialize Client-side Supabase connection if keys exist
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export class AnalyticsService {
  private static visitorGeo: { country: string; countryCode: string; city: string } | null = null;
  private static isSyncing = false;
  private static lastSyncTime = 0;
  private static cloudConnected = false;

  /**
   * Check if Supabase Cloud is configured and active
   */
  public static isCloudConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
  }

  /**
   * Helper to detect Device Type
   */
  private static detectDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
    if (typeof window === 'undefined') return 'Desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
      return 'Tablet';
    }
    if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo)/.test(ua) || window.innerWidth < 768) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  /**
   * Helper to detect Browser
   */
  private static detectBrowser(): string {
    if (typeof window === 'undefined') return 'Chrome';
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Internet';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
    if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) return 'Microsoft Edge';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    return 'Other';
  }

  /**
   * Helper to detect Operating System
   */
  private static detectOS(): string {
    if (typeof window === 'undefined') return 'Windows';
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') !== -1) return 'Windows';
    if (ua.indexOf('Mac') !== -1) return 'macOS';
    if (ua.indexOf('Linux') !== -1) return 'Linux';
    if (ua.indexOf('Android') !== -1) return 'Android';
    if (ua.indexOf('like Mac') !== -1) return 'iOS';
    return 'Unknown';
  }

  /**
   * Helper to categorize Traffic Source
   */
  private static detectTrafficSource(referrer: string): 'Google' | 'Facebook' | 'LinkedIn' | 'Twitter' | 'Direct' | 'Referral' {
    if (!referrer || referrer.trim() === '') return 'Direct';
    const ref = referrer.toLowerCase();
    if (ref.includes('google.')) return 'Google';
    if (ref.includes('facebook.') || ref.includes('fb.com') || ref.includes('instagram.')) return 'Facebook';
    if (ref.includes('linkedin.')) return 'LinkedIn';
    if (ref.includes('twitter.') || ref.includes('t.co') || ref.includes('x.com')) return 'Twitter';
    if (typeof window !== 'undefined' && ref.includes(window.location.hostname)) return 'Direct';
    return 'Referral';
  }

  /**
   * Get or initialize a unique persistent visitor ID
   */
  public static getVisitorId(): { id: string; isReturning: boolean } {
    if (typeof window === 'undefined') return { id: 'visitor_ssr', isReturning: false };
    try {
      const stored = localStorage.getItem(VISITOR_ID_KEY);
      if (stored) {
        return { id: stored, isReturning: true };
      }
      const newId = 'vis_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_ID_KEY, newId);
      return { id: newId, isReturning: false };
    } catch {
      return { id: 'vis_temp', isReturning: false };
    }
  }

  /**
   * Get or initialize session ID for the current tab
   */
  public static getSessionId(): string {
    if (typeof window === 'undefined') return 'session_ssr';
    try {
      let session = sessionStorage.getItem(SESSION_ID_KEY);
      if (!session) {
        session = 'ses_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        sessionStorage.setItem(SESSION_ID_KEY, session);
        sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
      }
      return session;
    } catch {
      return 'ses_temp';
    }
  }

  /**
   * Fast synchronous fallback geo based on timezone and locale
   */
  public static getInstantGeo(): { country: string; countryCode: string; city: string } {
    if (this.visitorGeo) return this.visitorGeo;
    if (typeof window === 'undefined') {
      return { country: 'Global', countryCode: 'UN', city: 'City' };
    }

    try {
      const cached = localStorage.getItem(GEO_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000 && parsed.geo) {
          this.visitorGeo = parsed.geo;
          return parsed.geo;
        }
      }
    } catch {}

    let fallback = { country: 'Global', countryCode: 'UN', city: 'City' };
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Dhaka') || tz.includes('Asia/Dhaka')) {
        fallback = { country: 'Bangladesh', countryCode: 'BD', city: 'Dhaka' };
      } else if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Asia/Kolkata')) {
        fallback = { country: 'India', countryCode: 'IN', city: 'Kolkata' };
      } else if (tz.includes('London') || tz.includes('Europe/London')) {
        fallback = { country: 'United Kingdom', countryCode: 'GB', city: 'London' };
      } else if (tz.includes('New_York') || tz.includes('America/New_York')) {
        fallback = { country: 'United States', countryCode: 'US', city: 'New York' };
      } else if (tz.includes('Los_Angeles') || tz.includes('America/Los_Angeles')) {
        fallback = { country: 'United States', countryCode: 'US', city: 'Los Angeles' };
      } else if (tz.includes('Tokyo') || tz.includes('Asia/Tokyo')) {
        fallback = { country: 'Japan', countryCode: 'JP', city: 'Tokyo' };
      } else if (tz.includes('Sydney') || tz.includes('Australia/Sydney')) {
        fallback = { country: 'Australia', countryCode: 'AU', city: 'Sydney' };
      } else if (tz.includes('Berlin') || tz.includes('Europe/Berlin')) {
        fallback = { country: 'Germany', countryCode: 'DE', city: 'Berlin' };
      } else if (tz.includes('Dubai') || tz.includes('Asia/Dubai')) {
        fallback = { country: 'United Arab Emirates', countryCode: 'AE', city: 'Dubai' };
      } else if (tz.includes('Singapore') || tz.includes('Asia/Singapore')) {
        fallback = { country: 'Singapore', countryCode: 'SG', city: 'Singapore' };
      }
    } catch {}

    this.visitorGeo = fallback;
    return fallback;
  }

  /**
   * Asynchronously fetch real visitor geolocation
   */
  public static async fetchGeoLocation(): Promise<{ country: string; countryCode: string; city: string }> {
    if (this.visitorGeo && this.visitorGeo.country !== 'Global') return this.visitorGeo;
    if (typeof window === 'undefined') {
      return { country: 'Global', countryCode: 'UN', city: 'City' };
    }

    try {
      // Fast lookup via ipwho.is with 2.5s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const geo = {
            country: data.country || 'Global',
            countryCode: data.country_code || 'UN',
            city: data.city || 'City',
          };
          this.visitorGeo = geo;
          localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), geo }));
          return geo;
        }
      }
    } catch {}

    return this.getInstantGeo();
  }

  /**
   * Save event directly to Supabase cloud
   */
  private static async persistToSupabase(event: PageViewEvent): Promise<void> {
    if (!supabase) return;

    // 1. Try writing directly to dedicated visitor_analytics table
    let savedToTable = false;
    try {
      const { error } = await supabase.from('visitor_analytics').insert({
        id: event.id,
        path: event.path,
        title: event.title,
        session_id: event.sessionId,
        visitor_id: event.visitorId || null,
        referrer: event.referrer,
        source: event.source,
        device_type: event.deviceType,
        browser: event.browser,
        os: event.os,
        country: event.country,
        country_code: event.countryCode,
        city: event.city,
        duration_seconds: event.durationSeconds,
        project_id: event.projectId || null,
        blog_slug: event.blogSlug || null,
        created_at: event.timestamp,
      });

      if (!error) {
        savedToTable = true;
        this.cloudConnected = true;
      }
    } catch {}

    // 2. Also write/append to portfolio_configs row (id: 2) as guaranteed fallback
    try {
      const { data } = await supabase
        .from('portfolio_configs')
        .select('content')
        .eq('id', 2)
        .single();

      let remoteEvents: PageViewEvent[] = [];
      if (data && data.content && Array.isArray(data.content.events)) {
        remoteEvents = data.content.events;
      }

      // Prepend and trim to 5000 max events
      remoteEvents.unshift(event);
      if (remoteEvents.length > 5000) {
        remoteEvents = remoteEvents.slice(0, 5000);
      }

      await supabase
        .from('portfolio_configs')
        .upsert({ id: 2, content: { events: remoteEvents, updatedAt: new Date().toISOString() } });

      this.cloudConnected = true;
    } catch {}
  }

  /**
   * Track a Real Page View event (Instant synchronous local storage + background async sync)
   */
  public static trackPageView(
    path: string,
    title: string = (typeof document !== 'undefined' ? document.title : 'Page View'),
    meta?: { projectId?: string; blogSlug?: string }
  ): void {
    if (typeof window === 'undefined') return;

    try {
      const cleanPath = path || window.location.pathname || '/';
      
      // Debounce rapid duplicate tracking (within 1 second on same path)
      const lastTrackStr = sessionStorage.getItem(LAST_TRACKED_KEY);
      const now = Date.now();
      if (lastTrackStr) {
        try {
          const last = JSON.parse(lastTrackStr);
          if (last.path === cleanPath && now - last.time < 1000) {
            return;
          }
        } catch {}
      }
      sessionStorage.setItem(LAST_TRACKED_KEY, JSON.stringify({ path: cleanPath, time: now }));

      const sessionId = this.getSessionId();
      const visitor = this.getVisitorId();
      const referrer = document.referrer || '';
      const source = this.detectTrafficSource(referrer);
      const deviceType = this.detectDeviceType();
      const browser = this.detectBrowser();
      const os = this.detectOS();
      
      // Instant Synchronous Geo (Zero latency)
      const geo = this.getInstantGeo();

      // Estimate session duration
      let durationSeconds = 15;
      const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
      if (sessionStart) {
        const diffSec = Math.round((now - parseInt(sessionStart, 10)) / 1000);
        if (diffSec > 0 && diffSec < 3600) {
          durationSeconds = Math.max(15, diffSec);
        }
      }

      const newEvent: PageViewEvent = {
        id: 'evt_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
        path: cleanPath,
        title: title || cleanPath,
        timestamp: new Date().toISOString(),
        sessionId,
        visitorId: visitor.id,
        referrer,
        source,
        deviceType,
        browser,
        os,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        durationSeconds,
        projectId: meta?.projectId,
        blogSlug: meta?.blogSlug,
      };

      // 1. Store in local browser storage IMMEDIATELY
      const raw = localStorage.getItem(ANALYTICS_EVENTS_KEY);
      let events: PageViewEvent[] = [];
      if (raw) {
        try {
          events = JSON.parse(raw);
        } catch {}
      }

      // Keep latest 2,500 events locally
      events.unshift(newEvent);
      if (events.length > 2500) {
        events = events.slice(0, 2500);
      }
      localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(events));

      // 2. Dispatch UI event for real-time live updates immediately
      window.dispatchEvent(new CustomEvent('portfolio_analytics_updated', { detail: newEvent }));

      // 3. Transmit directly to Supabase Cloud Database in background
      this.persistToSupabase(newEvent).catch(() => {});

      // 4. Transmit to server API in background
      try {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent),
          keepalive: true,
        }).catch(() => {});
      } catch {}

      // 5. Asynchronously refine IP geo if necessary
      this.fetchGeoLocation().then(refined => {
        if (refined && refined.country !== geo.country) {
          newEvent.country = refined.country;
          newEvent.countryCode = refined.countryCode;
          newEvent.city = refined.city;
          // Update in local storage
          try {
            const currentRaw = localStorage.getItem(ANALYTICS_EVENTS_KEY);
            if (currentRaw) {
              const currentEvents: PageViewEvent[] = JSON.parse(currentRaw);
              const idx = currentEvents.findIndex(e => e.id === newEvent.id);
              if (idx !== -1) {
                currentEvents[idx] = newEvent;
                localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(currentEvents));
                window.dispatchEvent(new CustomEvent('portfolio_analytics_updated', { detail: newEvent }));
              }
            }
          } catch {}
        }
      }).catch(() => {});

    } catch (err) {
      console.warn('Analytics tracking skipped:', err);
    }
  }

  /**
   * Sync and merge server-side and Supabase global events with local events
   */
  public static async syncGlobalEvents(): Promise<PageViewEvent[]> {
    if (typeof window === 'undefined') return [];
    if (this.isSyncing || Date.now() - this.lastSyncTime < 2500) {
      return this.getAllEvents();
    }

    this.isSyncing = true;
    try {
      const localEvents = this.getAllEvents();
      const map = new Map<string, PageViewEvent>();

      // Populate local events first
      localEvents.forEach((e: PageViewEvent) => {
        if (e && e.id) map.set(e.id, e);
      });

      // 1. Fetch from Supabase (Central Cloud Store)
      if (supabase) {
        // A. Try dedicated table
        try {
          const { data: tableData, error: tableErr } = await supabase
            .from('visitor_analytics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);

          if (!tableErr && Array.isArray(tableData) && tableData.length > 0) {
            tableData.forEach((d: any) => {
              if (d && d.id) {
                map.set(d.id, {
                  id: d.id,
                  path: d.path,
                  title: d.title,
                  timestamp: d.created_at || d.timestamp,
                  sessionId: d.session_id || d.sessionId || 'ses_anon',
                  visitorId: d.visitor_id || d.visitorId,
                  referrer: d.referrer || '',
                  source: d.source || 'Direct',
                  deviceType: d.device_type || d.deviceType || 'Desktop',
                  browser: d.browser || 'Chrome',
                  os: d.os || 'Unknown',
                  country: d.country || 'Global',
                  countryCode: d.country_code || d.countryCode || 'UN',
                  city: d.city || 'City',
                  durationSeconds: d.duration_seconds || d.durationSeconds || 15,
                  projectId: d.project_id || d.projectId,
                  blogSlug: d.blog_slug || d.blogSlug,
                });
              }
            });
            this.cloudConnected = true;
          }
        } catch {}

        // B. Try portfolio_configs id: 2 row
        try {
          const { data: configData } = await supabase
            .from('portfolio_configs')
            .select('content')
            .eq('id', 2)
            .single();

          if (configData && configData.content && Array.isArray(configData.content.events)) {
            configData.content.events.forEach((e: PageViewEvent) => {
              if (e && e.id && !map.has(e.id)) {
                map.set(e.id, e);
              }
            });
            this.cloudConnected = true;
          }
        } catch {}
      }

      // 2. Fetch from Express / Node Server API (if running full-stack)
      try {
        const res = await fetch('/api/analytics/events');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.events)) {
            data.events.forEach((e: PageViewEvent) => {
              if (e && e.id && !map.has(e.id)) {
                map.set(e.id, e);
              }
            });
          }
        }
      } catch {}

      // Sort by timestamp desc and store up to 3000 events
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 3000);

      if (merged.length > 0) {
        localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(merged));

        // Push combined events to server in background so server never loses local events
        try {
          fetch('/api/analytics/bulk-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: merged.slice(0, 500) }),
          }).catch(() => {});
        } catch {}
      }

      this.lastSyncTime = Date.now();
      window.dispatchEvent(new CustomEvent('portfolio_analytics_updated'));
      return merged;
    } catch (err) {
      console.warn('Analytics sync error:', err);
    } finally {
      this.isSyncing = false;
    }

    return this.getAllEvents();
  }

  /**
   * Get all stored real events (No fake seed data)
   */
  public static getAllEvents(): PageViewEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ANALYTICS_EVENTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Calculate 100% Real Aggregated Summary & Chart Data from actual events
   */
  public static getAnalyticsSummary(timeFilter: 'all' | 'today' | '7d' | '30d' = 'all'): AnalyticsSummary {
    const allEvents = this.getAllEvents();
    const now = new Date();

    const filteredEvents = allEvents.filter(evt => {
      if (timeFilter === 'all') return true;
      const evtDate = new Date(evt.timestamp);
      const diffMs = now.getTime() - evtDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (timeFilter === 'today') {
        // Same calendar date or last 24 hours
        return diffHours <= 24;
      }
      if (timeFilter === '7d') {
        return diffHours <= 24 * 7;
      }
      if (timeFilter === '30d') {
        return diffHours <= 24 * 30;
      }
      return true;
    });

    const totalPageViews = filteredEvents.length;
    
    // Unique visitors by visitorId or sessionId
    const visitorIds = new Set(filteredEvents.map(e => e.visitorId || e.sessionId));
    const sessionIds = new Set(filteredEvents.map(e => e.sessionId));
    const uniqueVisitors = visitorIds.size;
    const totalVisitors = sessionIds.size;

    // Time categorizations calculated from real timestamps
    const todayEvents = allEvents.filter(e => {
      const diff = (now.getTime() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60);
      return diff <= 24;
    });
    const todayVisitors = new Set(todayEvents.map(e => e.visitorId || e.sessionId)).size;

    const weeklyEvents = allEvents.filter(e => {
      const diff = (now.getTime() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const weeklyVisitors = new Set(weeklyEvents.map(e => e.visitorId || e.sessionId)).size;

    const monthlyEvents = allEvents.filter(e => {
      const diff = (now.getTime() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });
    const monthlyVisitors = new Set(monthlyEvents.map(e => e.visitorId || e.sessionId)).size;

    // Calculate returning visitors (visitors who had multiple sessions or multiple visits)
    const visitorSessionCounts: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const key = e.visitorId || e.sessionId;
      visitorSessionCounts[key] = (visitorSessionCounts[key] || 0) + 1;
    });
    let returningVisitors = 0;
    Object.values(visitorSessionCounts).forEach(cnt => {
      if (cnt > 1) returningVisitors += 1;
    });

    // Real Avg session duration (seconds)
    let totalDuration = 0;
    filteredEvents.forEach(e => {
      totalDuration += (e.durationSeconds || 15);
    });
    const avgSessionDuration = totalPageViews > 0 ? Math.round(totalDuration / totalPageViews) : 0;

    // Top Pages
    const pageCounts: Record<string, { path: string; title: string; views: number }> = {};
    filteredEvents.forEach(e => {
      const key = e.path || '/';
      if (!pageCounts[key]) {
        pageCounts[key] = { path: key, title: e.title || key, views: 0 };
      }
      pageCounts[key].views += 1;
    });
    const topPages = Object.values(pageCounts).sort((a, b) => b.views - a.views).slice(0, 10);

    // Top Projects (real visits to /project/...)
    const projectCounts: Record<string, { id: string; title: string; views: number }> = {};
    filteredEvents.forEach(e => {
      let pId = e.projectId;
      if (!pId && e.path && e.path.startsWith('/project/')) {
        pId = e.path.replace('/project/', '').split('?')[0];
      }
      if (pId) {
        if (!projectCounts[pId]) {
          const displayTitle = e.title && !e.title.includes('Page View') ? e.title.replace(' | Case Study', '').replace(' | Projects', '') : pId.replace(/-/g, ' ');
          projectCounts[pId] = { id: pId, title: displayTitle, views: 0 };
        }
        projectCounts[pId].views += 1;
      }
    });
    const topProjects = Object.values(projectCounts).sort((a, b) => b.views - a.views);

    // Top Blogs (real visits to /blog/...)
    const blogCounts: Record<string, { slug: string; title: string; views: number }> = {};
    filteredEvents.forEach(e => {
      let bSlug = e.blogSlug;
      if (!bSlug && e.path && e.path.startsWith('/blog/')) {
        bSlug = e.path.replace('/blog/', '').split('?')[0];
      }
      if (bSlug) {
        if (!blogCounts[bSlug]) {
          const displayTitle = e.title && !e.title.includes('Page View') ? e.title.replace(' | Blog', '').replace(' | Blogs', '') : bSlug.replace(/-/g, ' ');
          blogCounts[bSlug] = { slug: bSlug, title: displayTitle, views: 0 };
        }
        blogCounts[bSlug].views += 1;
      }
    });
    const topBlogs = Object.values(blogCounts).sort((a, b) => b.views - a.views);

    // Sources Breakdown
    const sourceCounts: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const src = e.source || 'Direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });
    const sources = Object.entries(sourceCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // If no events yet, provide clean baseline categories
    if (sources.length === 0) {
      sources.push({ name: 'Direct', count: 0, percentage: 0 });
    }

    // Devices Breakdown
    const deviceCounts: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };
    filteredEvents.forEach(e => {
      const dev = (e.deviceType as 'Desktop' | 'Mobile' | 'Tablet') || 'Desktop';
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    });
    const devices = Object.entries(deviceCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : (name === 'Desktop' ? 100 : 0),
    }));

    // Browsers Breakdown
    const browserCounts: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const b = e.browser || 'Chrome';
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const browsers = Object.entries(browserCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Countries & Cities
    const countryCounts: Record<string, { name: string; code: string; count: number }> = {};
    const cityCounts: Record<string, { name: string; country: string; count: number }> = {};
    filteredEvents.forEach(e => {
      const cName = e.country || 'Global';
      const cCode = e.countryCode || 'UN';
      if (!countryCounts[cName]) {
        countryCounts[cName] = { name: cName, code: cCode, count: 0 };
      }
      countryCounts[cName].count += 1;

      const cityName = e.city || 'City';
      const cityKey = `${cityName}-${cName}`;
      if (!cityCounts[cityKey]) {
        cityCounts[cityKey] = { name: cityName, country: cName, count: 0 };
      }
      cityCounts[cityKey].count += 1;
    });

    const countries = Object.values(countryCounts).sort((a, b) => b.count - a.count).slice(0, 10);
    const cities = Object.values(cityCounts).sort((a, b) => b.count - a.count).slice(0, 10);

    // Real Time series for Daily Interactive chart (Last 7 days)
    const dailyMap: Record<string, { visitors: Set<string>; pageViews: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dailyMap[label] = { visitors: new Set(), pageViews: 0 };
    }

    filteredEvents.forEach(e => {
      const d = new Date(e.timestamp);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (dailyMap[label]) {
        dailyMap[label].pageViews += 1;
        dailyMap[label].visitors.add(e.visitorId || e.sessionId);
      }
    });

    const dailyViews = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      visitors: data.visitors.size,
      pageViews: data.pageViews,
    }));

    // Real Weekly series (Last 4 weeks)
    const weeklyMap: Record<string, { visitors: Set<string>; pageViews: number }> = {
      '3 Weeks Ago': { visitors: new Set(), pageViews: 0 },
      '2 Weeks Ago': { visitors: new Set(), pageViews: 0 },
      'Last Week': { visitors: new Set(), pageViews: 0 },
      'This Week': { visitors: new Set(), pageViews: 0 },
    };

    allEvents.forEach(e => {
      const diffDays = (now.getTime() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      const key = diffDays <= 7 ? 'This Week' : diffDays <= 14 ? 'Last Week' : diffDays <= 21 ? '2 Weeks Ago' : diffDays <= 28 ? '3 Weeks Ago' : null;
      if (key && weeklyMap[key]) {
        weeklyMap[key].pageViews += 1;
        weeklyMap[key].visitors.add(e.visitorId || e.sessionId);
      }
    });

    const weeklyViews = Object.entries(weeklyMap).map(([week, data]) => ({
      week,
      visitors: data.visitors.size,
      pageViews: data.pageViews,
    }));

    // Real Monthly series (Last 6 calendar months)
    const monthlyMap: Record<string, { visitors: Set<string>; pageViews: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
      monthlyMap[mLabel] = { visitors: new Set(), pageViews: 0 };
    }

    allEvents.forEach(e => {
      const d = new Date(e.timestamp);
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
      if (monthlyMap[mLabel]) {
        monthlyMap[mLabel].pageViews += 1;
        monthlyMap[mLabel].visitors.add(e.visitorId || e.sessionId);
      }
    });

    const monthlyViews = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      visitors: data.visitors.size,
      pageViews: data.pageViews,
    }));

    return {
      totalVisitors,
      uniqueVisitors,
      todayVisitors,
      weeklyVisitors,
      monthlyVisitors,
      returningVisitors,
      totalPageViews,
      avgSessionDuration,
      topPages,
      topProjects,
      topBlogs,
      sources,
      devices,
      browsers,
      countries,
      cities,
      dailyViews,
      weeklyViews,
      monthlyViews,
    };
  }

  /**
   * Reset/Clear real analytics data
   */
  public static async resetAnalytics(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ANALYTICS_EVENTS_KEY);
    sessionStorage.removeItem(LAST_TRACKED_KEY);
    
    // Clear Supabase
    if (supabase) {
      try {
        await supabase.from('visitor_analytics').delete().neq('id', '0');
      } catch {}
      try {
        await supabase.from('portfolio_configs').upsert({ id: 2, content: { events: [], updatedAt: new Date().toISOString() } });
      } catch {}
    }

    // Call server to clear
    try {
      fetch('/api/analytics/clear', { method: 'POST' }).catch(() => {});
    } catch {}

    window.dispatchEvent(new CustomEvent('portfolio_analytics_updated'));
  }

  /**
   * Export Analytics as JSON string
   */
  public static exportAnalyticsJson(): string {
    const summary = this.getAnalyticsSummary('all');
    return JSON.stringify(summary, null, 2);
  }

  /**
   * Export Analytics as CSV format
   */
  public static exportAnalyticsCsv(): string {
    const events = this.getAllEvents();
    const headers = ['ID', 'Timestamp', 'Path', 'Title', 'Source', 'DeviceType', 'Browser', 'OS', 'Country', 'City', 'DurationSeconds'];
    const rows = events.map(e => [
      e.id,
      e.timestamp,
      `"${(e.path || '').replace(/"/g, '""')}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      e.source,
      e.deviceType,
      e.browser,
      e.os,
      e.country,
      e.city,
      e.durationSeconds || 15,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
