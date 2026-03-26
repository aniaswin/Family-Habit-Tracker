# Family Habit Tracker

This project serves the front end from [`index.html`](/C:/Family%20Habit%20Tracker/index.html) and keeps the original copy in [`Web-App.html`](/C:/Family%20Habit%20Tracker/Web-App.html). It also adds Vercel API routes that store data in Google Sheets.

## What changed

- The browser now tries to load/save data through `/api/data`, `/api/toggle`, and `/api/save-settings`.
- If the API is unavailable, the app falls back to `localStorage` so the file still works locally.
- Vercel serves `index.html` directly, which is the simplest deployment shape for static hosting.

## Google Sheets setup

1. Create a Google Cloud project.
2. Enable the Google Sheets API.
3. Create a service account.
4. Create a JSON key for that service account.
5. Create a Google Sheet and copy its spreadsheet ID from the URL.
6. Share the sheet with the service account email as an editor.

The API will create these tabs automatically if they do not exist:

- `members`
- `habits`
- `completions`

## Vercel environment variables

Add these in the Vercel project settings:

- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`

For `GOOGLE_SHEETS_PRIVATE_KEY`, paste the private key exactly as provided in the JSON key. If you add it through the Vercel UI, keep the line breaks intact.

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
