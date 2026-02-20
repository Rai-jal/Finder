# Deploy Finder to Vercel

## Prerequisites

- [Vercel account](https://vercel.com)
- GitHub/GitLab/Bitbucket repo (or deploy with Vercel CLI)

## 1. Deploy via Vercel Dashboard

### Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (select the `finder` folder or repo root)
3. **Root Directory:** If your repo root is `/finder`, set it as the project root. If the repo IS the finder project, leave as `.`
4. **Framework Preset:** Next.js (auto-detected)
5. **Build Command:** `npm run build` (default)
6. **Output Directory:** `.next` (default)

### Environment Variables

Add in Vercel → Project → Settings → Environment Variables:

| Variable            | Value                          | Notes                    |
|---------------------|--------------------------------|--------------------------|
| `GROWFAST_API_URL`  | `https://finder.terangacode.com/api` | Backend API base URL     |

If not set, the app uses the default GrowFast API. All API requests go through the Next.js proxy at `/api/growfast`, so no CORS issues.

### Deploy

Click **Deploy**. Vercel will run `npm install` and `npm run build`.

---

## 2. Deploy via Vercel CLI

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# From the finder directory
cd finder
vercel

# Follow prompts (link to existing project or create new)
# Add GROWFAST_API_URL when prompted or in dashboard
```

---

## 3. Production Checklist (Before Go-Live)

- [ ] **Build passes** – `npm run build` succeeds locally
- [ ] **Env vars set** – `GROWFAST_API_URL` configured in Vercel
- [ ] **Auth flow** – Register, login, logout work
- [ ] **Onboarding** – Complete onboarding creates startup via API
- [ ] **API proxy** – `/api/growfast/*` forwards to backend (check Network tab)
- [ ] **Backend reachable** – GrowFast API at finder.terangacode.com is up
- [ ] **HTTPS** – Vercel provides SSL by default

---

## 4. Test Production Build Locally

```bash
npm run build
npm run start
# Open http://localhost:3000
```

## 5. Test Deployed App (Production Smoke Test)

After deploying, verify the proxy and API:

```bash
# Test your Vercel URL (e.g. https://finder-xxx.vercel.app)
VERCEL_URL="https://your-app.vercel.app"
curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL/api/growfast/industries"
# Expect: 200

# Test backend directly (optional)
./scripts/test-api.sh https://finder.terangacode.com/api
```

---

## Troubleshooting

| Issue              | Solution                                                |
|--------------------|---------------------------------------------------------|
| Build fails        | Run `npm run build` locally; fix TypeScript/lint errors |
| API 500 errors     | Check backend health; see `docs/API-TROUBLESHOOTING.md` |
| CORS errors        | API calls use `/api/growfast` proxy; no CORS in browser |
| Env not loading    | Add vars in Vercel dashboard; redeploy                  |
