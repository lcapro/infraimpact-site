# InfraImpact SaaS LCA-platform - Architectuuroverzicht

## Frameworkkeuze
- **Backend: Express + TypeScript** (lichtgewicht, eenvoudig uitbreidbaar met eigen middleware, goed geschikt voor maatwerk multi-tenant logica en het koppelen van parsing/exports). NestJS is een optie voor grote teams, maar Express geeft hier maximale flexibiliteit en minder boilerplate.
- **Frontend: React + TypeScript + Vite + Tailwind** voor snelle DX, componentisatie en theming.
- **Database/ORM: PostgreSQL + Prisma** voor type-safe queries en migrations.

## Mappenstructuur
```
apps/
  frontend/           # Vite + React SPA
    src/
      components/     # herbruikbare UI
      pages/          # route-level pages
      sections/       # samengestelde secties zoals formulieren/tabellen
      routes/         # router-config
      styles/         # tailwind entry
  backend/            # Express API
    src/
      controllers/    # (future) controller laag
      middleware/     # auth / guard
      routes/         # REST endpoints
      services/       # businesslogica (uitbreidbaar)
      templates/      # PDF/HTML templates
      utils/          # prisma, helpers
    prisma/
      schema.prisma   # datamodel + relations
```

## Commandos
- **Frontend**: `cd apps/frontend && npm install && npm run dev`
- **Backend**: `cd apps/backend && npm install && npm run dev`
- **Prisma**: `cd apps/backend && npx prisma migrate dev`

## High-level architectuurschema
```
[React SPA] --axios--> [Express API]
                     |-- Prisma -> PostgreSQL (multi-tenant org -> users -> projects)
                     |-- PDF parse (pdf-parse) -> EPD opslag
                     |-- Excel export (exceljs)
                     |-- PDF rapport (puppeteer)
```

## Kernfeatures (roadmap-ready)
- Multi-tenancy: Organization -> Users -> Projects -> Materials -> CustomFields
- Auth: JWT access/refresh (Bearer) met rollen org_admin/user/viewer.
- EPD upload + parsing: /epds/upload met PDF extractie en opslag in DB.
- MKI/GWP back-end berekeningen: `/projects/:id/summary` aggregaties.
- Exports: `/exports/projects/:id/export.xlsx` en `/exports/projects/:id/report.pdf`.
- Trial/pricing: `Organization.plan` + `trialEndsAt` op schema.

## Deployment
- Backend Dockerfile (node18, build + start)
- Hosting: Render/Railway/Fly met Postgres. Frontend naar Vercel/Netlify, assets via CDN.
- Security: Helmet, rate limiting, bcrypt hashing, auth middleware.
