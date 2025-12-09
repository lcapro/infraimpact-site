# EPD database (Next.js + Supabase)

A minimal Next.js 14 application for uploading, parsing and storing Environmental Product Declarations (EPD's) for infrastructure products.

## Features
- PDF upload with Supabase Storage
- Server-side PDF text extraction with `pdf-parse`
- Heuristic parser to propose EPD metadata and MKI/CO2 values
- Editable form with custom fields before saving to Supabase Postgres
- EPD overview with search & pagination
- Detail pages and export to Excel or CSV

## Getting started

### 1. Install dependencies
```bash
cd EPD-database
npm install
```

### 2. Environment variables
Copy `.env.local.example` to `.env.local` and fill in your Supabase project values. All real keys must stay local and must never be committed.

- `NEXT_PUBLIC_SUPABASE_URL` – public Supabase URL used by the client and server.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon key used by the public Supabase client.
- `SUPABASE_SERVICE_ROLE_KEY` – service role key used only in API routes via `getAdminClient`; never expose this to the browser.
- `SUPABASE_STORAGE_BUCKET` – bucket name for uploading PDFs server-side (e.g. `epd-pdfs`).
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` – same bucket name but safe to expose; used to build public download URLs.
- `NEXT_PUBLIC_BASE_URL` – base URL used by server components to call internal API routes (e.g. `http://localhost:3000` in development, or your production domain).

> **Warning:** keep `.env.local` out of version control and populate it with your real Supabase project URL/keys and bucket names. The provided `.env.local.example` only contains placeholders.

### 3. Database schema
Run the migration SQL against your Supabase Postgres (via the SQL editor or `psql`):
```
\i supabase/migrations/001_init.sql
```

### 4. Development server
```bash
npm run dev
```
Open http://localhost:3000.

### 5. Notes
- API routes use the Supabase service role key on the server for inserts/updates.
- Parsing is best effort; fields can be corrected in the UI before saving.
- Exports are available via `/api/epd/export?format=excel` or `format=csv`.
