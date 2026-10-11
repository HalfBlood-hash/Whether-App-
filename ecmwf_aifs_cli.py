#!/usr/bin/env python3
"""
ECMWF AIFS Weather CLI
Command line tool to query ECMWF Artificial Intelligence Forecasting System (AIFS)
data, compare AI vs Physics models, and download forecasts.
"""

import argparse
import io
import json
import sys
import urllib.parse
import urllib.request
from datetime import datetime

# Configure utf-8 stdout safe for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ECMWF_ENDPOINT = "https://api.open-meteo.com/v1/ecmwf"
GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search"


def geocode_city(city_name):
    url = f"{GEOCODING_ENDPOINT}?name={urllib.parse.quote(city_name)}&count=1&language=en&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "AIFS-CLI/1.0"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        results = data.get("results", [])
        if not results:
            print(f"[!] Error: City '{city_name}' not found.", file=sys.stderr)
            sys.exit(1)
        r = results[0]
        return r["name"], r.get("country", ""), r["latitude"], r["longitude"]


def fetch_aifs(lat, lon, compare_ifs=False):
    models = "ecmwf_aifs025_single"
    if compare_ifs:
        models += ",ecmwf_ifs025"

    hourly = "temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m"
    daily = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max"

    url = (
        f"{ECMWF_ENDPOINT}?latitude={lat}&longitude={lon}"
        f"&models={models}&hourly={hourly}&daily={daily}&timezone=auto"
    )

    req = urllib.request.Request(url, headers={"User-Agent": "AIFS-CLI/1.0"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(
        description="Query ECMWF AIFS (Artificial Intelligence Forecasting System) weather predictions"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--city", "-c", type=str, help="City name (e.g. 'London', 'Tokyo')")
    group.add_argument("--coords", nargs=2, type=float, metavar=("LAT", "LON"), help="Coordinates: LAT LON")

    parser.add_argument(
        "--compare", action="store_true", help="Compare ECMWF AIFS (AI) against ECMWF IFS (Physics NWP)"
    )
    parser.add_argument("--json", action="store_true", help="Output raw JSON response")
    parser.add_argument("--days", type=int, default=7, help="Number of forecast days to display (1-7)")

    args = parser.parse_args()

    if args.city:
        name, country, lat, lon = geocode_city(args.city)
        location_str = f"{name}, {country} ({lat:.2f} deg, {lon:.2f} deg)"
    else:
        lat, lon = args.coords
        location_str = f"Coordinates ({lat:.2f} deg, {lon:.2f} deg)"

    data = fetch_aifs(lat, lon, compare_ifs=args.compare)

    if args.json:
        print(json.dumps(data, indent=2))
        return

    print("=" * 72)
    print("  ECMWF AIFS (Artificial Intelligence Forecasting System)")
    print("  Resolution: 0.25 deg | Neural Graph Transformer")
    print(f"  Target: {location_str}")
    print("=" * 72)

    daily = data.get("daily", {})
    times = daily.get("time", [])[: args.days]

    if args.compare:
        aifs_max = daily.get("temperature_2m_max_ecmwf_aifs025_single", [])
        aifs_min = daily.get("temperature_2m_min_ecmwf_aifs025_single", [])
        ifs_max = daily.get("temperature_2m_max_ecmwf_ifs025", [])
        ifs_min = daily.get("temperature_2m_min_ecmwf_ifs025", [])

        print(f"\n{'Date':<12} | {'AIFS Temp (Min/Max)':<22} | {'IFS Temp (Min/Max)':<22} | {'Diff':<8}")
        print("-" * 72)
        for i, d in enumerate(times):
            a_min = aifs_min[i] if i < len(aifs_min) and aifs_min[i] is not None else 0
            a_max = aifs_max[i] if i < len(aifs_max) and aifs_max[i] is not None else 0
            i_min = ifs_min[i] if i < len(ifs_min) and ifs_min[i] is not None else 0
            i_max = ifs_max[i] if i < len(ifs_max) and ifs_max[i] is not None else 0
            diff = abs(a_max - i_max)

            print(
                f"{d:<12} | {a_min:>5.1f}C to {a_max:>5.1f}C         | {i_min:>5.1f}C to {i_max:>5.1f}C         | +/-{diff:.1f}C"
            )
    else:
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precips = daily.get("precipitation_sum", [])
        winds = daily.get("wind_speed_10m_max", [])

        print(f"\n{'Date':<12} | {'Min Temp':<10} | {'Max Temp':<10} | {'Precip':<12} | {'Max Wind':<12}")
        print("-" * 68)
        for i, d in enumerate(times):
            t_min = f"{min_temps[i]:.1f}C" if i < len(min_temps) and min_temps[i] is not None else "--"
            t_max = f"{max_temps[i]:.1f}C" if i < len(max_temps) and max_temps[i] is not None else "--"
            p = f"{precips[i]:.1f} mm" if i < len(precips) and precips[i] is not None else "--"
            w = f"{winds[i]:.1f} km/h" if i < len(winds) and winds[i] is not None else "--"
            print(f"{d:<12} | {t_min:<10} | {t_max:<10} | {p:<12} | {w:<12}")

    print("\n" + "=" * 72)
    print("  Prediction complete. Powered by ECMWF AIFS Open Data & Open-Meteo.")
    print("=" * 72)


if __name__ == "__main__":
    main()

