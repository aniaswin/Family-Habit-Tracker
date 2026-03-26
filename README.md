# Family Habit Tracker

This project serves the front end from [`index.html`](/C:/Family%20Habit%20Tracker/index.html) and keeps the original copy in [`Web-App.html`](/C:/Family%20Habit%20Tracker/Web-App.html). It also adds Vercel API routes that store data in Supabase.

## What changed

- The browser now tries to load/save data through `/api/data`, `/api/toggle`, and `/api/save-settings`.
- If the API is unavailable, the app falls back to `localStorage` so the file still works locally.
- Vercel serves `index.html` directly, which is the simplest deployment shape for static hosting.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run the SQL in [`supabase-schema.sql`](/C:/Family%20Habit%20Tracker/supabase-schema.sql).
4. Copy your project URL and service role key from the Supabase dashboard.

## Vercel environment variables

Add these in the Vercel project settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Keep the service role key only in Vercel server-side environment variables. Do not expose it in browser code.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables listed above.
4. Deploy.

## Local development

After pulling the repo locally:

```bash
npm install
vercel dev
```

If you open `index.html` or `Web-App.html` directly in the browser, the app will fall back to local storage when the API is not reachable.
