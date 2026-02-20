# Finder - Startup Opportunity Discovery

A production-ready SaaS dashboard for startup opportunity discovery and application management, connected to the GrowFast API.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS**
- **ShadCN-style UI** (custom components)
- **React Hook Form** + **Zod** (forms & validation)
- **React Query** (API state)
- **Context API** (auth, notifications, onboarding, saved opportunities)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Optional: Create `.env.local` to override the API base URL:

```env
GROWFAST_API_URL=https://finder.terangacode.com/api
```

If not set, the app uses the default GrowFast API. All API requests go through the Next.js proxy at `/api/growfast` to avoid CORS.

## Project Structure

```
/app
  /auth          - Login, Signup
  /onboarding    - Multi-step onboarding
  /dashboard     - Main dashboard
  /opportunities - Browse & save opportunities
  /suggest       - Suggest a new opportunity
  /applications  - My applications & workspace
  /documents     - Document vault
  /notifications - Notification center
  /profile       - User profile
  /upgrade       - Premium upgrade
/components
  /layout        - Sidebar, Navbar, DashboardLayout
  /ui            - Button, Card, Input, etc.
/lib
  /api           - GrowFast API client, unified layer
  /hooks         - useReferenceData (industries, stages)
  /utils         - cn()
/context         - Auth, Startup, Notification, Onboarding, SavedOpportunities
/types           - Shared TypeScript types
```

## Auth Flow

- **Login/Signup** → Redirects to onboarding (first time) or dashboard
- **Onboarding** creates a startup via the API; completion stored locally
- **Protected routes** redirect unauthenticated users to login

## Backend API (GrowFast)

The app connects to the [GrowFast API](https://finder.terangacode.com/api/documentation) via a CORS proxy at `/api/growfast`.

**Endpoints used:**
- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout`
- **Opportunities:** `GET /opportunities`, `GET /opportunities/{id}`
- **Suggestions:** `POST /opportunity-suggestions` (public)
- **Startups:** `GET /startups`, `POST /startups`, `PUT /startups/{id}`
- **Saved opportunities:** `GET/POST/DELETE /startups/{id}/opportunities/{opp}/save`
- **Matches:** `GET /startups/{id}/matches`
- **Documents:** `GET/POST/DELETE /startups/{id}/documents`
- **Reference:** `GET /industries`, `GET /stages`
- **Notifications:** `GET /notifications`, `PATCH /notifications/{id}/read`, `POST /notifications/mark-all-read`
- **Subscriptions:** `GET /subscriptions`, `GET /subscriptions/my`, `POST /user-subscriptions/subscribe`

## Features

- **Opportunity suggestions:** Submit new funding opportunities via `/suggest`
- **Mark all notifications read:** From the notifications page or navbar dropdown
- **Subscription upgrade:** Fetches plans from API; upgrade flows to `POST /user-subscriptions/subscribe`
- **Saved opportunities:** Synced with API; `refresh()` on context to refetch

## API Integration Tests

Run end-to-end API tests (requires dev server running):

```bash
npm run dev   # in one terminal
npm run test:api   # in another
```

Or: `./scripts/test-api.sh [BASE_URL]` (default: http://localhost:3000)

Tests: public reference data (industries, stages), auth (register/login), opportunities, onboarding, saved opportunities, document upload, suggestions. Some endpoints may return 500 if the GrowFast backend has issues—those are external and not fixable from this repo.

## Deploy to Vercel

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for step-by-step instructions and production checklist.

## Demo Credentials

Register a new account or use your GrowFast backend credentials.
