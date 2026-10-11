import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health Check Endpoint for Render & Uptime Monitors
app.get(['/health', '/healthz'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ecmwf-aifs-weather',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
    version: '1.0.0',
    model: 'ECMWF AIFS 0.25 deg'
  });
});

// Ping endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Serve compiled static Vite assets with caching
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // Assets with content hashes can be cached longer
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// SPA Catch-all: Route all remaining GET requests to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Express server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 ECMWF AIFS Weather App running on port ${PORT}`);
  console.log(`🩺 Health check active at: http://0.0.0.0:${PORT}/health`);
  console.log(`=======================================================`);

  // Start self-pinging keep-alive background worker
  initSelfPing();
});

/**
 * Keep-Alive Self-Pinging Mechanism
 * Prevents Render's free tier web services from spinning down after 15 minutes of inactivity.
 * Pings every 13 minutes (780,000 ms) before the 15-minute idle timeout.
 */
function initSelfPing() {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
  const intervalMinutes = parseInt(process.env.SELF_PING_INTERVAL_MINUTES, 10) || 13;
  const intervalMs = intervalMinutes * 60 * 1000;

  if (targetUrl) {
    const healthUrl = targetUrl.endsWith('/') ? `${targetUrl}health` : `${targetUrl}/health`;
    console.log(`[Keep-Alive] Armed: Self-pinging ${healthUrl} every ${intervalMinutes} minutes.`);

    setInterval(async () => {
      try {
        const response = await fetch(healthUrl);
        console.log(`[Keep-Alive] Ping succeeded at ${new Date().toISOString()} (HTTP ${response.status})`);
      } catch (err) {
        console.warn(`[Keep-Alive] Ping warning at ${new Date().toISOString()}: ${err.message}`);
      }
    }, intervalMs);
  } else {
    console.log(`[Keep-Alive] Note: RENDER_EXTERNAL_URL / APP_URL not detected in local environment.`);
    console.log(`[Keep-Alive] On Render, RENDER_EXTERNAL_URL is automatically populated by Render, activating self-ping.`);
    console.log(`[Keep-Alive] You can also hook up free monitors like Cron-job.org or UptimeRobot to ping /health.`);
  }
}
