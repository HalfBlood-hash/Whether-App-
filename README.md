# ECMWF AIFS Weather Prediction App 🌍⚡

An interactive, modern weather forecasting application powered by the **ECMWF Artificial Intelligence Forecasting System (AIFS)** — the European Centre for Medium-Range Weather Forecasts' flagship deep learning neural weather model.

---

## 🌟 Overview & What is ECMWF AIFS?

**ECMWF AIFS** (Artificial Intelligence Forecasting System) is a data-driven numerical weather prediction model built by ECMWF. 
- **Graph Transformer Neural Architecture**: Combines spatial Graph Neural Networks (GNN) on an icosahedral spherical Earth mesh with multi-scale self-attention transformers.
- **Trained on ERA5**: Trained on over 40 years of ECMWF ERA5 reanalysis and fine-tuned on operational ECMWF IFS analysis.
- **Ultra-Fast Inference**: Generates a global 10-day weather forecast at **0.25° spatial resolution (~25 km)** in **under 1 minute on a single GPU**, using 99.9% less compute energy than conventional supercomputers.
- **Unprecedented Accuracy**: Matches or outperforms operational physics-based NWP models (like IFS HRES) across core atmospheric metrics, including 500 hPa geopotential height (Z500) and upper-air temperatures.

---

## 🚀 Features of the Application

1. **Global Search & Geocoding**:
   - Search any city, region, or latitude/longitude worldwide with debounced autocompletion.
   - One-click HTML5 geolocation ("Locate Me").
   - Quick presets for major global cities (Tokyo, London, New York, Paris, New Delhi, Sydney, Berlin, Dubai).

2. **Forecast Overview Dashboard**:
   - **Current Weather Snapshot**: Surface temperature, apparent temperature ("Feels like"), humidity, barometric pressure, dew point, cloud cover, and precipitation sum.
   - **7-Day Medium-Range Cards**: Daily Min/Max temperatures with proportional gradient bars, WMO condition badges, and max wind speed.
   - **Interactive Atmospheric Trajectory Charts**: Hourly progression with tabs for **Temperature**, **Precipitation**, **Wind Speed**, **Pressure**, and **Cloud Cover**, filterable by 24h, 48h, individual days, or full 7-day view.

3. **AI vs Physics Model Comparison Mode**:
   - Directly compares **ECMWF AIFS (Deep Learning)** against **ECMWF IFS (Traditional Physics NWP)**.
   - Dual-line overlaid chart and calculated mean divergence delta (e.g. `±0.5°C`).

4. **50-Member Probabilistic Ensemble View**:
   - Visualizes the ECMWF AIFS 50-member perturbed ensemble.
   - Features confidence interval envelopes (P10 to P90 interdecile bands) and optional individual member "spaghetti plumes" to assess forecast confidence.

5. **Interactive Global Weather Map**:
   - Powered by Leaflet.
   - Click anywhere across the globe to drop a pin and instantly query the ECMWF AIFS model grid at those coordinates.

6. **Inside AIFS (Scientific Deep-Dive)**:
   - Educational breakdown of the spherical GNN encoder, multi-scale transformer core, autoregressive rollout, and verification benchmarks.

7. **Data Export & Code Generator**:
   - Export forecasts directly to **CSV** (for Excel/Pandas) or **JSON**.
   - Copy ready-to-run code snippets in **Python**, **ecmwf-opendata**, **cURL**, and **JavaScript**.

8. **Python Terminal CLI (`ecmwf_aifs_cli.py`)**:
   - Query forecasts directly from the terminal or automate scripts without opening a browser.

---

## 🛠️ Getting Started

### 1. Launch the Web Application

In your terminal:
```bash
cd ecmwf-aifs-weather
npm run dev
```

Then open your browser at the URL shown (typically `http://localhost:5173`).

To build for production:
```bash
npm run build
npm run preview
```

---

### 2. Run the Python CLI

You can also query ECMWF AIFS forecasts directly from your terminal:

```bash
# Query any city
python ecmwf_aifs_cli.py --city "Tokyo"

# Compare AIFS (AI) vs IFS (Physics) side by side
python ecmwf_aifs_cli.py --city "Paris" --compare

# Query specific coordinates
python ecmwf_aifs_cli.py --coords 52.52 13.41

# Output raw JSON
python ecmwf_aifs_cli.py --city "London" --json
```

---

## 📡 ECMWF AIFS API Reference

The app interfaces with ECMWF Open Data via the Open-Meteo ECMWF endpoints:

- **ECMWF AIFS Deterministic Endpoint**:
  ```
  GET https://api.open-meteo.com/v1/ecmwf?latitude={lat}&longitude={lon}&models=ecmwf_aifs025_single&hourly=temperature_2m,precipitation,surface_pressure,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto
  ```

- **ECMWF AIFS 50-Member Ensemble Endpoint**:
  ```
  GET https://ensemble-api.open-meteo.com/v1/ensemble?latitude={lat}&longitude={lon}&models=ecmwf_aifs025&hourly=temperature_2m,precipitation,surface_pressure
  ```

- **Model Comparison (AIFS vs IFS)**:
  ```
  GET https://api.open-meteo.com/v1/ecmwf?latitude={lat}&longitude={lon}&models=ecmwf_aifs025_single,ecmwf_ifs025&hourly=temperature_2m,precipitation&timezone=auto
  ```

---

## 📜 Credits & License
- Model: [ECMWF AIFS (CC-BY 4.0 Open Data)](https://www.ecmwf.int/)
- API: [Open-Meteo ECMWF API](https://open-meteo.com/en/docs/ecmwf-api)
