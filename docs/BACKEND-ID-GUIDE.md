# Backend ID Guide: Industries & Stages

## What the backend expects

**The backend validates by SLUG, not ID.** We send:

- **industry** — slug (e.g. `"technology"`, `"agritech"`)
- **stage** — slug (e.g. `"idea"`, `"seed"`, `"series-a"`)
- **preferred_industries** — array of slugs
- **preferred_stages** — array of slugs

## Flow

1. **Frontend calls `GET /industries` and `GET /stages`** to load options (id, name, slug).
2. **User selects by name** — form stores the ID for display/state.
3. **On submit** — we map IDs to slugs and send slugs to the API.

## Expected payload shape

```json
{
  "name": "My Startup",
  "industry": "technology",
  "stage": "idea",
  "country": "US",
  "preferred_industries": ["technology", "agritech"],
  "preferred_stages": ["idea"],
  "preferred_countries": ["US"],
  "funding_types": ["grant", "equity"]
}
```

## Important for backend

1. **`GET /industries` and `GET /stages` must return** items with `id`, `name`, and `slug` — we use slug for the create payload.

2. **Slug format** — lowercase, hyphenated (e.g. `series-a` not `series_a`).

3. **Reference structure** — each item should have:

   ```json
   { "id": 29, "name": "Aerospace", "slug": "aerospace" }
   ```

   The frontend uses `id` for the API payload and `slug` for matching fallback data.
