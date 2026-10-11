# Render Deployment & Keep-Alive Guide 🚀

This guide walks you through deploying the **ECMWF AIFS Weather App** on Render with zero-downtime health checking.

---

## 🎯 Quick Overview of What Has Been Configured

1. **`server.js`**: Production Node.js server serving compiled assets, SPA routing, and:
   - **`/health` & `/healthz`**: Returns `200 OK` with JSON health metrics (uptime, memory, model status).
   - **`/ping`**: Returns `pong`.
   - **Automatic Keep-Alive Pinger**: Self-pings its own `/health` endpoint every 13 minutes (before Render's 15-minute idle cutoff).
2. **`render.yaml`**: Infrastructure-as-code Blueprint for 1-click deployment on Render with `healthCheckPath: /health`.
3. **`package.json`**: Configured with `"start": "node server.js"`.

---

## 🚀 Step 1: Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `ecmwf-aifs-weather`).
2. Run the following commands in your project folder (`C:\Users\Satyam\Desktop\ecmwf-aifs-weather`):

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/ecmwf-aifs-weather.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy on Render

### Method A: Web Service (Recommended for Live Health Check & Pinger)

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `ecmwf-aifs-weather`.
4. Configure the settings:
   - **Name**: `ecmwf-aifs-weather` (or any custom name)
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Advanced Settings**:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: `Yes`
6. Click **Create Web Service**.

> Render will build the Vite app, start the Express server, and verify the `/health` endpoint before bringing traffic live.

---

### Method B: Render Static Site (Alternative: 100% CDN, Never Sleeps)

If you only need the frontend static files without a Node server:
1. Click **New +** -> **Static Site**.
2. Connect your repository.
3. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Render Static Sites **never sleep** on the free tier because they are hosted on Render's global CDN.

---

## 🛡️ Step 3: Ensure Your Website Never Turns Off (Keep-Alive Setup)

Render's free Web Services sleep after 15 minutes of zero traffic. We have implemented a two-tier strategy to keep it awake 24/7:

### Tier 1: Built-In Self-Ping (Automatic on Render)
`server.js` automatically detects `process.env.RENDER_EXTERNAL_URL` (provided by Render) and pings `https://<your-app>.onrender.com/health` every **13 minutes**.
- You don't need to do anything; it activates automatically on Render!

### Tier 2: Free External Health Monitor (100% Reliable 24/7 Safeguard)
Render occasionally treats external traffic differently from internal self-loops. Setting up a free external monitor guarantees 100% uptime:

#### Option 1: Using Cron-Job.org (Free, takes 1 minute)
1. Register a free account at [cron-job.org](https://cron-job.org).
2. Click **Create Cronjob**.
3. **Title**: `ECMWF AIFS Keep Alive`
4. **URL**: `https://<your-app-name>.onrender.com/health`
5. **Schedule**: Every `10 minutes`.
6. Click **Create**.

#### Option 2: Using UptimeRobot (Free)
1. Register at [uptimerobot.com](https://uptimerobot.com).
2. Click **Add New Monitor**.
3. **Monitor Type**: `HTTP(s)`
4. **Friendly Name**: `ECMWF AIFS App`
5. **URL**: `https://<your-app-name>.onrender.com/health`
6. **Monitoring Interval**: `5 minutes`.
7. Click **Create Monitor**.

---

## 🩺 Testing Your Health Check

Once deployed, you can verify your health check anytime:

```bash
# In your terminal or browser:
curl https://<your-app-name>.onrender.com/health
```

Expected JSON Response:
```json
{
  "status": "healthy",
  "service": "ecmwf-aifs-weather",
  "uptime": 3600,
  "timestamp": "2026-10-11T10:30:00.000Z",
  "memory": {
    "rss": "52 MB",
    "heapUsed": "8 MB"
  },
  "version": "1.0.0",
  "model": "ECMWF AIFS 0.25 deg"
}
```
