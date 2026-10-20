# Drift — real-time, scroll-animated E-commerce

Full-stack mini project for **W4 L3: Redux Toolkit, UI Components & Full-Stack E-commerce**.

| Layer | Stack |
|---|---|
| Frontend | React 18 (Vite), **Redux Toolkit** (slices + async thunks), **Tailwind CSS**, **Shadcn/ui**-style components (Radix), Framer Motion |
| Backend | **Spring Boot 3** (Java 21), Spring Data JPA, **Bean Validation**, Server-Sent Events |
| Database | **MySQL** (H2 profile available for zero-setup local runs) |
| Deploy | Backend → **Render** (Docker), frontend → Vercel / Netlify / Render Static Site |

## What's in it

**Scroll-driven UI/UX (Framer Motion `useScroll`)**
- Scroll progress bar, and a navbar that shrinks into a floating pill as you scroll
- Hero with parallax product cards that drift and rotate at different depths
- Marquee whose speed and direction follow your scroll velocity
- Manifesto text that lights up word by word as you scroll
- **Pinned horizontal showcase** — vertical scrolling moves featured products sideways
- Product cards that reveal in a stagger; animated category pill (`layoutId`); counters that count up in view

**Real time**
- `GET /api/stream` pushes `stock` and `purchase` events over SSE
- Stock pills flash green/red when stock changes; cart lines stay in sync; a "Someone in Pune just bought…" pill appears
- Auto-reconnect with exponential backoff, and a catalogue re-sync after an outage
- A demo **simulator** creates random purchases/restocks so the live UI works with no other users

**Redux Toolkit**
- `productsSlice` — `createEntityAdapter`, thunks (`fetchProducts`, `fetchFeatured`, `fetchCategories`), request-id guard against out-of-order responses, memoised selectors
- `cartSlice` — add / quantity / remove, clamped by live stock, persisted to `localStorage`, reacts to `stockUpdated` and `placeOrder.fulfilled` via `extraReducers`
- `ordersSlice` — `placeOrder` thunk with `rejectWithValue`, surfaces per-field server errors
- `liveSlice` — SSE connection state + activity feed

**Admin dashboard (`/#/admin`)**
- Sign in with the secret `ADMIN_KEY` (sent as an `X-Admin-Key` header; kept in `sessionStorage`, so closing the tab signs you out)
- **Create / Read / Update / Delete** products in a side-sheet form with the same validation as the server; quick **+10 restock**; search, category and low-stock filters
- Summary cards (products, units, low stock, inventory value, orders, revenue) and an **Orders** tab with delivery details
- Every change is broadcast over SSE (`catalog` event), so open shop pages update without a refresh, and a deleted product leaves visitors' carts

**Validation**
- Backend: `@Valid` + `@NotBlank`, `@Size`, `@Email`, `@Pattern`, `@NotNull`, `@Min/@Max`, `@NotEmpty` on `OrderRequest` / `OrderItemRequest`; `GlobalExceptionHandler` returns `{ message, errors: { field: message } }`
- Frontend: `lib/validation.js` mirrors the same rules (validated on blur and submit); server field errors are merged into the form
- Overselling is prevented with a pessimistic row lock (`findByIdForUpdate`) inside a transaction

## Project layout

```
backend/   Spring Boot API  (controller / service / repository / dto / event / exception)
frontend/  React app        (features/ = Redux slices, components/ui = Shadcn-style primitives)
render.yaml  Render blueprint for the backend
```

## Run locally

### 1. Backend

Option A — MySQL:
```bash
# create nothing by hand: the URL uses createDatabaseIfNotExist=true
cd backend
DB_USER=root DB_PASSWORD=yourpassword mvn spring-boot:run
```
Option B — no database installed (in-memory H2):
```bash
cd backend
SPRING_PROFILES_ACTIVE=h2 mvn spring-boot:run
```
API at http://localhost:8080 — try `GET /api/products`, `GET /api/health`. The catalogue seeds itself on first start.

### 2. Frontend
```bash
cd frontend
cp .env.example .env.local     # VITE_API_URL=http://localhost:8080
npm install
npm run dev                    # http://localhost:5173
```

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products?category=&q=&sort=` | `sort`: `featured` (default), `newest`, `rating`, `price_asc`, `price_desc` |
| GET | `/api/products/{id}` | 404 if missing |
| GET | `/api/products/categories` | distinct categories |
| POST | `/api/orders` | validated body → `201`; `400` field errors; `409` insufficient stock |
| GET | `/api/stream` | SSE: `hello`, `stock`, `purchase`, `catalog`, `ping` |
| GET | `/api/health` | health check |

Example order:
```json
{
  "customerName": "Aarav Patil", "email": "aarav@example.com", "phone": "9876543210",
  "address": "12 MG Road", "city": "Pune", "postalCode": "411001",
  "items": [{ "productId": 1, "quantity": 2 }]
}
```

### Admin API (needs header `X-Admin-Key: <ADMIN_KEY>`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/verify` | `200` if the key is valid, `401` otherwise |
| POST | `/api/admin/products` | create; `@Valid` body (`ProductRequest`) → `201` / `400` field errors |
| PUT | `/api/admin/products/{id}` | update (full body); `404` if missing |
| DELETE | `/api/admin/products/{id}` | `204`; `404` if missing |
| GET | `/api/admin/orders` | all orders with items and delivery details |

```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "X-Admin-Key: admin123" -H "Content-Type: application/json" \
  -d '{"name":"Zeta Lamp","category":"Lifestyle","price":2499,"stock":20,"rating":4.5,"featured":false}'
```

### Environment variables (backend)

| Variable | Default | Purpose |
|---|---|---|
| `ADMIN_KEY` | `admin123` (dev only) | secret for `/api/admin/**`. **Set a long random value in production**; empty disables the admin API |
| `DB_URL` | local MySQL | JDBC URL, e.g. `jdbc:mysql://host:3306/shopdb?sslMode=REQUIRED` |
| `DB_USER` / `DB_PASSWORD` | `root` / `root` | database credentials |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | comma-separated frontend origins |
| `SIMULATION_ENABLED` | `true` | demo traffic simulator on/off |
| `PORT` | `8080` | injected by Render |

## Deploy

### Backend → Render
Render does not host MySQL, so first create a free/cheap MySQL database somewhere reachable (Aiven, TiDB Cloud, Railway, etc.) and note its host, port, database name, user and password.

1. Push this repo to GitHub.
2. Render → **New → Blueprint** and pick the repo (it reads `render.yaml`), or **New → Web Service**, runtime **Docker**, Dockerfile path `./backend/Dockerfile`, context `./backend`.
3. Set environment variables: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGINS` (your frontend URL, no trailing slash). The blueprint auto-generates `ADMIN_KEY`: copy it from the service's *Environment* tab, it is your admin password.
4. Health check path: `/api/health`. Deploy; tables are created automatically (`ddl-auto=update`) and the catalogue is seeded.

> Free Render services sleep when idle, so the first request can take ~30–60 s. The live stream reconnects automatically.

### Frontend → Vercel / Netlify
Root directory `frontend`, build command `npm run build`, output `dist`, and set `VITE_API_URL=https://<your-service>.onrender.com`. Then add that frontend URL to `CORS_ORIGINS` on Render.

## Notes
- Product photos are Unsplash URLs; each card falls back to a gradient if a photo fails to load.
- Checkout is a demo: no payment is processed.
- Animations respect the OS "reduce motion" setting (`MotionConfig reducedMotion="user"`).
- Add more Shadcn components any time with `npx shadcn@latest add <name>` — `components.json` is already configured.
