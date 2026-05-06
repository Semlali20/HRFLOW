# HRFLOW k6 Load Testing Suite

Production-ready k6 test suite for the HRFLOW Spring Boot API.  
Covers authentication, departments, positions, employees, interns, leaves, planning, notifications, reports, and admin operations.

---

## Prerequisites

Install k6 (v0.52+):

```bash
# Windows (Chocolatey)
choco install k6

# Windows (winget)
winget install k6 --source winget

# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

> All commands below assume you are in the **project root** (`HRFLOW/`).  
> The API must be running on `http://localhost:8090` (default) before running any test.

---

## Quick Start

```bash
# 1. Verify the API is alive (1 VU, 30 s)
k6 run k6/tests/smoke.js

# 2. Full journey test with default load profile
k6 run k6/main.js
```

---

## Environment Variables

| Variable         | Default                   | Description                           |
|------------------|---------------------------|---------------------------------------|
| `BASE_URL`       | `http://localhost:8090`   | API base URL                          |
| `ADMIN_EMAIL`    | `houarimehdi7@gmail.com`        | Admin account email                   |
| `ADMIN_PASSWORD` | `39EAFC8e6e@Rh464`              | Admin account password                |
| `LOG_LEVEL`      | `info`                    | Set to `debug` for verbose output     |

Pass via `--env`:

```bash
k6 run --env BASE_URL=https://api.staging.example.com \
       --env ADMIN_EMAIL=admin@company.com \
       --env ADMIN_PASSWORD=Secret123 \
       k6/tests/smoke.js
```

---

## Test Profiles

### Smoke — Sanity check (1 VU, 30 s)

Verifies all critical endpoints return 2xx. Run before every deployment.

```bash
k6 run k6/tests/smoke.js

# Against staging
k6 run --env BASE_URL=https://api.staging.example.com k6/tests/smoke.js
```

---

### Load — Normal production traffic (~10 min)

Simulates realistic concurrent usage: ramps to 10 VUs, then 25 VUs.  
All user roles are exercised (ADMIN, COLLABORATEUR_RH, MANAGER, EMPLOYEE).

```bash
k6 run k6/tests/load.js

# With custom URL
k6 run --env BASE_URL=http://localhost:8090 k6/tests/load.js

# Override stages from CLI (2 min ramp, 5 min steady, 1 min down)
k6 run --stage 2m:10,5m:10,1m:0 k6/tests/load.js
```

---

### Stress — Find the breaking point (~23 min)

Aggressively ramps to 200 VUs in stages. Thresholds are relaxed (p95 < 3 s, errors < 5%).  
Watch logs for HikariCP timeouts and Spring Boot 503s.

```bash
k6 run k6/tests/stress.js

# With debug logging
k6 run --env LOG_LEVEL=debug k6/tests/stress.js
```

---

### Spike — Flash-crowd simulation (~3 min)

Jumps from 5 → 200 VUs in 30 seconds, holds for 1 min, then drops back.  
Tests whether the system recovers gracefully after a sudden burst.

```bash
k6 run k6/tests/spike.js
```

---

### Soak — Memory & resource leak detection (~2 h 4 min)

Holds 20 VUs for 2 hours. Use a time-series backend to monitor latency drift.

```bash
# Basic run (results printed to terminal at the end)
k6 run k6/tests/soak.js

# Stream metrics to InfluxDB + view in Grafana
k6 run --out influxdb=http://localhost:8086/k6 k6/tests/soak.js

# Stream to Grafana Cloud k6
K6_CLOUD_TOKEN=<your-token> k6 run --out cloud k6/tests/soak.js
```

---

### Endpoint Scan — POST-deploy availability sweep

Hits every GET endpoint in `data/endpoints.json` once and verifies non-5xx status.

```bash
k6 run k6/tests/endpoints-scan.js

# Custom admin credentials
k6 run --env ADMIN_EMAIL=admin@example.com \
       --env ADMIN_PASSWORD=39EAFC8e6e@Rh464 \
       k6/tests/endpoints-scan.js
```

---

### Full Journey (main.js) — Complete HR workflow

Orchestrates all 10 phases (auth → dashboard → org → employees → interns → leaves → planning → reports → admin → logout).  
Uses `setup()` to seed shared data before VUs start.

```bash
# Default (uses LOAD_OPTIONS)
k6 run k6/main.js

# Custom stages
k6 run --stage 2m:5,5m:5,1m:0 k6/main.js

# Full environment override
k6 run --env BASE_URL=http://staging:8090 \
       --env ADMIN_EMAIL=houarimehdi7@gmail.com \
       --env ADMIN_PASSWORD=39EAFC8e6e@Rh464 \
       --env LOG_LEVEL=debug \
       k6/main.js
```

---

## Output Options

### Terminal summary (default)

```bash
k6 run k6/tests/load.js
```

### JSON results file

```bash
k6 run --out json=results/load-run.json k6/tests/load.js
```

### InfluxDB + Grafana (local)

```bash
# Start InfluxDB + Grafana (docker-compose)
docker run -d -p 8086:8086 --name influxdb influxdb:1.8
docker run -d -p 3000:3000 --name grafana grafana/grafana

k6 run --out influxdb=http://localhost:8086/k6 k6/tests/load.js
```

Import the official k6 Grafana dashboard: **ID 2587** from grafana.com/dashboards.

### Grafana Cloud k6

```bash
export K6_CLOUD_TOKEN=<token-from-grafana-cloud>
k6 run --out cloud k6/tests/load.js
```

### Custom trend stats

```bash
k6 run \
  --summary-trend-stats="avg,min,med,max,p(90),p(95),p(99)" \
  k6/tests/load.js
```

---

## Thresholds Reference

| Profile  | p(95) latency | p(99) latency | Error rate | Check pass rate |
|----------|---------------|---------------|------------|-----------------|
| Smoke    | < 2 000 ms    | —             | < 1%       | > 99%           |
| Load     | < 800 ms      | < 1 500 ms    | < 1%       | > 99%           |
| Stress   | < 3 000 ms    | —             | < 5%       | —               |
| Spike    | < 5 000 ms    | —             | < 10%      | —               |
| Soak     | < 800 ms      | < 1 500 ms    | < 1%       | > 99%           |
| Scan     | < 2 000 ms    | —             | < 5%       | —               |

---

## File Structure

```
k6/
├── config/
│   ├── options.js          # All load profiles (SMOKE, LOAD, STRESS, SOAK, SPIKE, SCAN)
│   └── constants.js        # BASE_URL, API paths, header factories
├── helpers/
│   ├── http.js             # Thin wrappers: get(), post(), put(), patch(), del()
│   ├── checks.js           # expectStatus(), expectFastResponse(), extractId(), ...
│   ├── logger.js           # logOk(), logFail(), logScenario() — env-controlled
│   └── sleep.js            # thinkShort(), thinkMedium(), thinkLong()
├── data/
│   ├── users.json          # Test users (ADMIN, RH, MANAGER, EMPLOYEE)
│   ├── payloads.js         # Unique payload factories using VU + timestamp
│   └── endpoints.json      # GET endpoint manifest for the scan test
├── modules/
│   ├── auth.js             # login(), logout(), refreshToken(), changePassword()
│   ├── departments.js      # CRUD + departmentFlow()
│   ├── positions.js        # CRUD + positionFlow()
│   ├── employees.js        # CRUD + search + employeeFlow()
│   ├── interns.js          # CRUD + internFlow()
│   ├── leaves.js           # Types, requests, lifecycle, balances + leaveLifecycleFlow()
│   ├── planning.js         # CRUD + range query + planningFlow()
│   ├── notifications.js    # list, count, markRead + notificationFlow()
│   ├── admin.js            # users, roles, permissions, audit + adminFlow()
│   └── reports.js          # KPI, Excel, PDF exports + reportsFlow()
├── tests/
│   ├── smoke.js            # 1 VU / 30 s sanity check
│   ├── load.js             # Normal traffic ramp test
│   ├── stress.js           # Break-point ramp to 200 VUs
│   ├── spike.js            # Flash-crowd burst simulation
│   ├── soak.js             # 2-hour memory/resource leak test
│   └── endpoints-scan.js   # POST-deploy availability sweep
└── main.js                 # Full HR workflow orchestrator (10 phases)
```

---

## CI/CD Integration

The GitHub Actions workflow at `.github/workflows/k6-load-test.yml` provides:

| Job            | Trigger                                  | Duration  |
|----------------|------------------------------------------|-----------|
| `smoke`        | Every push / PR to `main` or `develop`  | ~30 s     |
| `scan`         | After successful CI build on `main`      | ~1 min    |
| `load`         | After successful CI build on `main`      | ~10 min   |
| `stress`       | Every Saturday at 01:00 UTC              | ~23 min   |
| `spike`        | Manual dispatch only                     | ~3 min    |
| `soak`         | Manual dispatch only                     | ~2 h      |

Required GitHub secrets:

```
BASE_URL           https://api.yourapp.com
ADMIN_EMAIL        houarimehdi7@gmail.com
ADMIN_PASSWORD     <password>
K6_CLOUD_TOKEN     <optional — for Grafana Cloud streaming>
```

Run any profile manually:

1. Go to **Actions → k6 Load Tests → Run workflow**
2. Select the `test_profile` (smoke / load / stress / soak / spike / scan)
3. Optionally override `base_url`
4. Click **Run workflow**
