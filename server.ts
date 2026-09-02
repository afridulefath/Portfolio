import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// ----------------------------------------------------
// Supabase Server Client Setup (Optional Cloud Sync)
// ----------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ----------------------------------------------------
// In-Memory Rate Limiter for Security & Spam Protection
// ----------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const ipRateLimits = new Map<string, RateLimitRecord>();
const recipientRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(
  map: Map<string, RateLimitRecord>,
  key: string,
  maxCount: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = map.get(key) || { timestamps: [] };
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxCount) {
    return false;
  }

  record.timestamps.push(now);
  map.set(key, record);
  return true;
}

// ----------------------------------------------------
// HTML Email Template Generator
// ----------------------------------------------------
function generateReplyHtmlEmail(params: {
  recipientName: string;
  senderName: string;
  senderEmail: string;
  replySubject: string;
  replyBody: string;
  originalMessageText?: string;
}): string {
  const { recipientName, senderName, senderEmail, replySubject, replyBody, originalMessageText } = params;

  // Convert plain text newlines to formatted HTML paragraphs
  const formattedReply = replyBody
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p style="margin: 0 0 16px 0; line-height: 1.6; color: #1e293b;">')
    .replace(/\n/g, '<br />');

  const formattedOriginal = originalMessageText
    ? originalMessageText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br />')
    : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replySubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">
                      ${senderName}
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #e0e7ff; opacity: 0.9;">
                      Response to your inquiry
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #0f172a;">
                Hello ${recipientName || 'there'},
              </p>
              
              <div style="font-size: 14px; line-height: 1.65; color: #334155; margin-bottom: 28px;">
                <p style="margin: 0 0 16px 0;">${formattedReply}</p>
              </div>

              <!-- Quoted Original Message -->
              ${
                formattedOriginal
                  ? `
              <div style="margin-top: 24px; padding: 16px; background-color: #f1f5f9; border-left: 3px solid #6366f1; border-radius: 6px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">
                  Original Inquiry:
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569; font-style: italic;">
                  "${formattedOriginal}"
                </p>
              </div>
              `
                  : ''
              }

              <!-- Divider -->
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

              <!-- Sign-off -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                      ${senderName}
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">
                      Direct Contact: <a href="mailto:${senderEmail}" style="color: #4f46e5; text-decoration: none;">${senderEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                This message was sent directly from the portfolio management console via Gmail SMTP in response to your inquiry.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check Email Config Status
app.get('/api/email-config-status', (req, res) => {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || '';
  const hasGmailPass = Boolean(process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS);
  const hasGmail = Boolean(gmailUser && hasGmailPass);
  const hasSupabase = Boolean(supabase);

  res.json({
    hasGmail,
    gmailUser: gmailUser ? `${gmailUser.substring(0, 3)}***@${gmailUser.split('@')[1] || 'gmail.com'}` : '',
    hasSupabase,
    defaultProvider: hasGmail ? 'gmail_smtp' : 'direct',
    senderName: process.env.GMAIL_FROM_NAME || 'Alex Vance',
  });
});

// ----------------------------------------------------
// Real-Time Visitor Analytics Endpoints (Server & Supabase)
// ----------------------------------------------------
interface ServerAnalyticsEvent {
  id: string;
  path: string;
  title: string;
  timestamp: string;
  sessionId: string;
  visitorId?: string;
  referrer: string;
  source: string;
  deviceType: string;
  browser: string;
  os: string;
  country: string;
  countryCode: string;
  city: string;
  durationSeconds?: number;
  projectId?: string;
  blogSlug?: string;
  clientIp?: string;
}

const ANALYTICS_DATA_FILE = path.join(process.cwd(), 'data_analytics_events.json');
let serverAnalyticsBuffer: ServerAnalyticsEvent[] = [];
const MAX_SERVER_ANALYTICS = 5000;

// Load persisted events from disk on startup
try {
  if (fs.existsSync(ANALYTICS_DATA_FILE)) {
    const raw = fs.readFileSync(ANALYTICS_DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      serverAnalyticsBuffer = parsed.slice(0, MAX_SERVER_ANALYTICS);
    }
  }
} catch (err) {
  console.warn('Could not read analytics file on startup:', err);
}

function saveAnalyticsToDisk() {
  try {
    fs.writeFileSync(ANALYTICS_DATA_FILE, JSON.stringify(serverAnalyticsBuffer.slice(0, MAX_SERVER_ANALYTICS)), 'utf-8');
  } catch (err) {
    console.warn('Could not save analytics to disk:', err);
  }
}

// 1. Ingest Page View Event
app.post('/api/analytics/track', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const payload = req.body || {};

    if (!payload.path) {
      return res.status(400).json({ success: false, error: 'Path is required' });
    }

    const event: ServerAnalyticsEvent = {
      id: payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      path: String(payload.path).substring(0, 300),
      title: String(payload.title || 'Page View').substring(0, 200),
      timestamp: payload.timestamp || new Date().toISOString(),
      sessionId: String(payload.sessionId || 'ses_anon').substring(0, 100),
      visitorId: payload.visitorId ? String(payload.visitorId).substring(0, 100) : undefined,
      referrer: String(payload.referrer || '').substring(0, 500),
      source: String(payload.source || 'Direct').substring(0, 50),
      deviceType: String(payload.deviceType || 'Desktop').substring(0, 50),
      browser: String(payload.browser || 'Chrome').substring(0, 50),
      os: String(payload.os || 'Unknown').substring(0, 50),
      country: String(payload.country || 'Global').substring(0, 100),
      countryCode: String(payload.countryCode || 'UN').substring(0, 10),
      city: String(payload.city || 'City').substring(0, 100),
      durationSeconds: Number(payload.durationSeconds) || 15,
      projectId: payload.projectId ? String(payload.projectId).substring(0, 100) : undefined,
      blogSlug: payload.blogSlug ? String(payload.blogSlug).substring(0, 100) : undefined,
      clientIp: clientIp.replace('::ffff:', ''),
    };

    // Store in circular in-memory buffer and persist to disk
    const existingIdx = serverAnalyticsBuffer.findIndex(e => e.id === event.id);
    if (existingIdx === -1) {
      serverAnalyticsBuffer.unshift(event);
      if (serverAnalyticsBuffer.length > MAX_SERVER_ANALYTICS) {
        serverAnalyticsBuffer.pop();
      }
      saveAnalyticsToDisk();
    }

    // Optionally sync to Supabase visitor_analytics table or portfolio_configs id: 2
    if (supabase) {
      try {
        const { error: tableErr } = await supabase.from('visitor_analytics').insert({
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

        // Also sync to portfolio_configs id: 2 as unified multi-platform cloud store
        try {
          const { data: configData } = await supabase
            .from('portfolio_configs')
            .select('content')
            .eq('id', 2)
            .single();

          let remoteEvents: any[] = [];
          if (configData && configData.content && Array.isArray(configData.content.events)) {
            remoteEvents = configData.content.events;
          }
          remoteEvents.unshift(event);
          if (remoteEvents.length > 5000) {
            remoteEvents = remoteEvents.slice(0, 5000);
          }
          await supabase
            .from('portfolio_configs')
            .upsert({ id: 2, content: { events: remoteEvents, updatedAt: new Date().toISOString() } });
        } catch {}
      } catch (dbErr) {
        // Table may not exist yet in user's Supabase project, fallback cleanly to memory buffer
      }
    }

    res.json({ success: true, eventId: event.id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Tracking error' });
  }
});

// 2. Get Global Analytics Events
app.get('/api/analytics/events', async (req, res) => {
  try {
    if (supabase) {
      // Try dedicated table first
      try {
        const { data, error } = await supabase
          .from('visitor_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);

        if (!error && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any) => ({
            id: d.id,
            path: d.path,
            title: d.title,
            timestamp: d.created_at,
            sessionId: d.session_id,
            visitorId: d.visitor_id,
            referrer: d.referrer || '',
            source: d.source || 'Direct',
            deviceType: d.device_type || 'Desktop',
            browser: d.browser || 'Chrome',
            os: d.os || 'Windows',
            country: d.country || 'Global',
            countryCode: d.country_code || 'UN',
            city: d.city || 'City',
            durationSeconds: d.duration_seconds || 15,
            projectId: d.project_id,
            blogSlug: d.blog_slug,
          }));
          return res.json({ success: true, events: formatted, source: 'supabase_table' });
        }
      } catch {}

      // Try portfolio_configs id: 2
      try {
        const { data: configData } = await supabase
          .from('portfolio_configs')
          .select('content')
          .eq('id', 2)
          .single();

        if (configData && configData.content && Array.isArray(configData.content.events) && configData.content.events.length > 0) {
          return res.json({ success: true, events: configData.content.events, source: 'supabase_config' });
        }
      } catch {}
    }

    res.json({ success: true, events: serverAnalyticsBuffer, source: 'server_memory' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Bulk Sync Analytics Events from Client/Local
app.post('/api/analytics/bulk-sync', async (req, res) => {
  try {
    const { events } = req.body || {};
    if (Array.isArray(events) && events.length > 0) {
      let addedCount = 0;
      const existingIds = new Set(serverAnalyticsBuffer.map(e => e.id));
      events.forEach((evt: any) => {
        if (evt && evt.id && !existingIds.has(evt.id)) {
          serverAnalyticsBuffer.push({
            id: evt.id,
            path: String(evt.path || '/').substring(0, 300),
            title: String(evt.title || 'Page View').substring(0, 200),
            timestamp: evt.timestamp || new Date().toISOString(),
            sessionId: String(evt.sessionId || 'ses_anon').substring(0, 100),
            visitorId: evt.visitorId ? String(evt.visitorId).substring(0, 100) : undefined,
            referrer: String(evt.referrer || '').substring(0, 500),
            source: String(evt.source || 'Direct').substring(0, 50),
            deviceType: String(evt.deviceType || 'Desktop').substring(0, 50),
            browser: String(evt.browser || 'Chrome').substring(0, 50),
            os: String(evt.os || 'Windows').substring(0, 50),
            country: String(evt.country || 'Global').substring(0, 100),
            countryCode: String(evt.countryCode || 'UN').substring(0, 10),
            city: String(evt.city || 'City').substring(0, 100),
            durationSeconds: Number(evt.durationSeconds) || 15,
            projectId: evt.projectId ? String(evt.projectId).substring(0, 100) : undefined,
            blogSlug: evt.blogSlug ? String(evt.blogSlug).substring(0, 100) : undefined,
          });
          existingIds.add(evt.id);
          addedCount++;
        }
      });

      if (addedCount > 0) {
        // Sort descending
        serverAnalyticsBuffer.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (serverAnalyticsBuffer.length > MAX_SERVER_ANALYTICS) {
          serverAnalyticsBuffer = serverAnalyticsBuffer.slice(0, MAX_SERVER_ANALYTICS);
        }
        saveAnalyticsToDisk();
      }
    }
    res.json({ success: true, count: serverAnalyticsBuffer.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Clear Analytics Buffer
app.post('/api/analytics/clear', async (req, res) => {
  try {
    serverAnalyticsBuffer.length = 0;
    saveAnalyticsToDisk();
    if (supabase) {
      try {
        await supabase.from('visitor_analytics').delete().neq('id', '0');
      } catch {}
    }
    res.json({ success: true, message: 'Analytics cleared' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send Reply Endpoint (Gmail SMTP + Supabase Sent Status Store)
app.post('/api/send-reply', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

  try {
    const {
      originalMessageId,
      originalMessageText,
      recipientEmail,
      recipientName,
      replySubject,
      replyBody,
      senderName = 'Alex Vance',
      senderEmail = 'alex.vance@architect.io',
      customConfig = {},
    } = req.body;

    // 1. Validation & Input Sanitization
    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return res.status(400).json({ success: false, error: 'Recipient email is required.' });
    }

    if (!replySubject || typeof replySubject !== 'string') {
      return res.status(400).json({ success: false, error: 'Reply subject is required.' });
    }

    if (!replyBody || typeof replyBody !== 'string') {
      return res.status(400).json({ success: false, error: 'Reply body is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid recipient email format.' });
    }

    // Header Injection Defense (strip / check for CR / LF in headers)
    if (
      /[\r\n]/.test(recipientEmail) ||
      /[\r\n]/.test(replySubject) ||
      /[\r\n]/.test(senderEmail) ||
      /[\r\n]/.test(senderName)
    ) {
      return res.status(400).json({ success: false, error: 'Security violation: newline in email header fields.' });
    }

    if (replySubject.length > 200) {
      return res.status(400).json({ success: false, error: 'Subject is too long (max 200 characters).' });
    }
    if (replyBody.length > 30000) {
      return res.status(400).json({ success: false, error: 'Message body exceeds maximum size (30KB).' });
    }

    // 2. Rate Limiting Protection (Spam Defense)
    const ipAllowed = checkRateLimit(ipRateLimits, clientIp, 20, 5 * 60 * 1000);
    if (!ipAllowed) {
      return res.status(429).json({
        success: false,
        error: 'Too many email requests from this IP. Please wait a few minutes before sending more replies.',
      });
    }

    const recipientKey = recipientEmail.trim().toLowerCase();
    const recipientAllowed = checkRateLimit(recipientRateLimits, recipientKey, 6, 10 * 60 * 1000);
    if (!recipientAllowed) {
      return res.status(429).json({
        success: false,
        error: `Rate limit: Already sent multiple replies to ${recipientEmail} recently. Please wait before retrying.`,
      });
    }

    // 3. Prepare Email Content
    const cleanSubject = replySubject.trim();
    const cleanBody = replyBody.trim();
    const cleanRecipient = recipientEmail.trim();
    const cleanRecipientName = (recipientName || 'Visitor').trim();
    const cleanSenderName = (customConfig.gmailFromName || senderName || process.env.GMAIL_FROM_NAME || 'Alex Vance').trim();
    const cleanSenderEmail = (senderEmail || 'alex.vance@architect.io').trim();

    // 4. Resolve Gmail Credentials from environment variables or custom config
    const gmailUser = customConfig.gmailUser || process.env.GMAIL_USER || customConfig.smtpUser || process.env.SMTP_USER;
    const rawGmailPass = customConfig.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || customConfig.smtpPass || process.env.SMTP_PASS;
    // Strip spaces from Google 16-character App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
    const gmailAppPassword = rawGmailPass ? rawGmailPass.replace(/\s+/g, '') : '';

    const customHost = customConfig.smtpHost || process.env.SMTP_HOST;
    const customPort = Number(customConfig.smtpPort || process.env.SMTP_PORT || 587);
    const customSecure = customConfig.smtpSecure ?? (process.env.SMTP_SECURE === 'true');

    const effectiveSenderEmail = gmailUser || cleanSenderEmail;

    const htmlContent = generateReplyHtmlEmail({
      recipientName: cleanRecipientName,
      senderName: cleanSenderName,
      senderEmail: effectiveSenderEmail,
      replySubject: cleanSubject,
      replyBody: cleanBody,
      originalMessageText,
    });

    let messageId = '';
    let providerUsed = 'gmail_smtp';
    let isSimulated = false;

    // 5. Send Email via Gmail SMTP
    if (gmailUser && gmailAppPassword) {
      try {
        let transporter: nodemailer.Transporter;

        if (customHost && !customHost.includes('gmail')) {
          transporter = nodemailer.createTransport({
            host: customHost,
            port: customPort,
            secure: customSecure,
            auth: {
              user: gmailUser,
              pass: gmailAppPassword,
            },
          });
        } else {
          // Standard Gmail SMTP Transport
          transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: gmailUser,
              pass: gmailAppPassword,
            },
          });
        }

        const info = await transporter.sendMail({
          from: `"${cleanSenderName}" <${gmailUser}>`,
          to: cleanRecipient,
          subject: cleanSubject,
          text: `${cleanBody}\n\n---\n${cleanSenderName} (${effectiveSenderEmail})`,
          html: htmlContent,
          replyTo: effectiveSenderEmail,
        });

        messageId = info.messageId || `gmail_${Date.now()}`;
        providerUsed = 'gmail_smtp';
        console.log(`[Gmail SMTP] Sent reply to ${cleanRecipient}, messageId: ${messageId}`);
      } catch (smtpErr: any) {
        console.error('Gmail SMTP delivery error:', smtpErr);
        return res.status(502).json({
          success: false,
          error: `Gmail SMTP Error: ${smtpErr.message || 'Authentication failed or SMTP connection rejected. Verify GMAIL_USER and GMAIL_APP_PASSWORD.'}`,
        });
      }
    } else {
      // Direct Simulation Mode (when GMAIL_APP_PASSWORD not yet set)
      messageId = `gmail_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      providerUsed = 'simulation';
      isSimulated = true;
      console.log(`[Gmail Simulator] Simulating reply to ${cleanRecipient} with subject "${cleanSubject}"`);
    }

    // 6. Store Sent Status in Supabase (Cloud Persistence)
    let supabaseSynced = false;
    if (supabase) {
      try {
        const sentRecord = {
          message_id: originalMessageId || null,
          recipient_email: cleanRecipient,
          recipient_name: cleanRecipientName,
          reply_subject: cleanSubject,
          reply_body: cleanBody,
          sender_name: cleanSenderName,
          sender_email: effectiveSenderEmail,
          delivery_receipt_id: messageId,
          provider: providerUsed,
          status: 'sent',
          sent_at: new Date().toISOString(),
        };

        // Try inserting into contact_replies table
        const { error: replyInsertError } = await supabase
          .from('contact_replies')
          .insert([sentRecord]);

        if (!replyInsertError) {
          supabaseSynced = true;
        }

        // Try updating message row if contact_messages table exists
        if (originalMessageId) {
          await supabase
            .from('contact_messages')
            .update({
              replied: true,
              last_replied_at: new Date().toISOString(),
            })
            .eq('id', originalMessageId);
        }
      } catch (dbErr) {
        console.warn('Supabase sent status logging error (non-fatal):', dbErr);
      }
    }

    return res.json({
      success: true,
      provider: providerUsed,
      messageId,
      recipient: cleanRecipient,
      simulated: isSimulated,
      supabaseSynced,
      timestamp: new Date().toISOString(),
      note: isSimulated
        ? 'Simulation mode active. To send live emails, define GMAIL_USER and GMAIL_APP_PASSWORD in environment variables or Settings.'
        : 'Dispatched via Gmail SMTP and synced.',
    });
  } catch (err: any) {
    console.error('Unhandled email reply error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing email reply.',
    });
  }
});

// ----------------------------------------------------
// Vite Middleware / Static Production Assets
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
