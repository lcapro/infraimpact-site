# LCA-project-tool – frontend structuur + backend blauwdruk

## Frontend-structuur (React + TS + Vite + Tailwind)
- `src/main.tsx`: bootstrapt `AuthProvider` en `WorkspaceProvider` bovenop React Router.
- `src/context/`: `AuthContext` en `WorkspaceContext` delen auth- en workspace-state zonder props-drilling.
- `src/hooks/`: `useAuthStore`, `useWorkspaceStore` als state-machines bovenop localStorage; later te vervangen door API-clients.
- `src/lib/`: `db` (localStorage), `types`, `calculations` (MKI/GWP totalen), `epdParser` (client-side fallback).
- `src/components/layout/`: `AppLayout`, `Navbar` met sessiestatus.
- `src/components/workspace/`: `ProjectList`, `MaterialForm`, `PhaseInputs`, `EpdUpload`, `MaterialsTable` (herbruikbare blokken).
- `src/pages/`: `AuthPage`, `WorkspacePage` met router-guards.

### AuthContext / WorkspaceContext
- Contexts leveren `{ session, register, login, logout, ... }` en `{ projects, addProject, addMaterial, ... }` via `useAuth()` en `useWorkspace()`.
- Logica zit in hooks (`useAuthStore`, `useWorkspaceStore`) waardoor componenten lean blijven.
- Utility-functies (`calculations`, `epdParser`) centraliseren reken- en parse-logica en zijn makkelijk te verplaatsen naar de backend.

## Backend-stack
- **Keuze:** NestJS + TypeScript bovenop Express voor ingebouwde DI, modules en guards (auth/roles). Express kan ook, maar NestJS past beter bij SaaS schaalbaarheid.
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Auth:** JWT access token (Bearer) + refresh token in HttpOnly cookie (veilig voor B2B webapp, eenvoudig te roteren). Wachtwoorden gehasht met `bcrypt`.

## Prisma schema (multi-tenant)
```prisma
// prisma/schema.prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  users       User[]
  projects    Project[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String
  role           UserRole @default(USER)
  verified       Boolean  @default(false)
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  projects       Project[] @relation("ProjectOwners")
  sessions       Session[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum UserRole {
  ORG_ADMIN
  USER
  VIEWER
}

model Session {
  id           String   @id @default(cuid())
  user         User     @relation(fields: [userId], references: [id])
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

model Project {
  id              String    @id @default(cuid())
  name            String
  client          String?
  organization    Organization @relation(fields: [organizationId], references: [id])
  organizationId  String
  owner           User?     @relation("ProjectOwners", fields: [ownerId], references: [id])
  ownerId         String?
  materials       ProjectMaterial[]
  customFields    ProjectCustomField[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ProjectMaterial {
  id                 String   @id @default(cuid())
  project            Project  @relation(fields: [projectId], references: [id])
  projectId          String
  name               String
  supplier           String?
  quantity           Float?
  unit               String?
  transportDistance  Float?
  transportMode      String?
  fuelType           String?
  mkiPerUnit         Float?
  gwpPerUnit         Float?
  phaseA1Mki         Float?
  phaseA2Mki         Float?
  phaseA3Mki         Float?
  phaseDMki          Float?
  phaseA1Gwp         Float?
  phaseA2Gwp         Float?
  phaseA3Gwp         Float?
  phaseDGwp          Float?
  customValues       ProjectMaterialCustomValue[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model ProjectCustomField {
  id         String   @id @default(cuid())
  project    Project  @relation(fields: [projectId], references: [id])
  projectId  String
  label      String
  createdAt  DateTime @default(now())
}

model ProjectMaterialCustomValue {
  id          String   @id @default(cuid())
  material    ProjectMaterial @relation(fields: [materialId], references: [id])
  materialId  String
  field       ProjectCustomField @relation(fields: [fieldId], references: [id])
  fieldId     String
  value       String?
}

model EpdDocument {
  id             String   @id @default(cuid())
  project        Project? @relation(fields: [projectId], references: [id])
  projectId      String?
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  supplier       String?
  productName    String?
  filePath       String
  parsedData     Json
  validFrom      DateTime?
  validTo        DateTime?
  createdAt      DateTime @default(now())
}
```
**Multi-tenant:** alle queries filteren op `organizationId` (uit `req.user.organizationId`) en autorisatie controleert rol (`ORG_ADMIN`, `USER`, `VIEWER`).

## Prisma/PostgreSQL setup
```bash
# 1) Postgres draaien (lokaal of Docker)
docker run --name lca-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=lca -p 5432:5432 -d postgres:15

# 2) Prisma initialiseren
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql

# 3) Plaats schema.prisma (zie boven) en draai migratie
npx prisma migrate dev --name init

# 4) Prisma Client genereren
npx prisma generate
```

## Auth implementatie (Express voorbeeld)
Benodigde modellen staan in schema (User + Session). Tokens: access JWT (korte geldigheid) + refresh cookie (`httpOnly`, `secure`, `sameSite='lax'`).

```ts
// auth/service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const ACCESS_TTL = '15m';
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export async function register(email: string, password: string, organizationId: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, passwordHash, organizationId } });
  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  const accessToken = jwt.sign({ sub: user.id, org: user.organizationId, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TTL,
  });
  const refreshToken = crypto.randomUUID();
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return { user, accessToken, refreshToken };
}
```

```ts
// auth/routes.ts (Express)
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { login, register } from './service';
import { prisma } from './prisma';
import { authGuard } from './middleware';

const router = Router();

router.post('/auth/register', async (req, res) => {
  const { email, password, organizationId } = req.body;
  const user = await register(email, password, organizationId);
  res.status(201).json({ user: { id: user.id, email: user.email } });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await login(email, password);
  res
    .cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/auth/refresh' })
    .json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/auth/logout', authGuard, async (req, res) => {
  const refresh = req.cookies['refresh_token'];
  if (refresh) await prisma.session.deleteMany({ where: { refreshToken: refresh, userId: req.user!.id } });
  res.clearCookie('refresh_token').sendStatus(204);
});

router.get('/auth/me', authGuard, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  res.json({ user });
});

router.post('/auth/refresh', async (req, res) => {
  const refresh = req.cookies['refresh_token'];
  const session = await prisma.session.findUnique({ where: { refreshToken: refresh } });
  if (!session || session.expiresAt < new Date()) return res.sendStatus(401);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  const accessToken = jwt.sign({ sub: user.id, org: user.organizationId, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
  res.json({ accessToken });
});

export default router;
```

```ts
// auth/middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; organizationId: string; role: string };
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ')
    ? header.split(' ')[1]
    : undefined;
  if (!token) return res.sendStatus(401);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: payload.sub, organizationId: payload.org, role: payload.role };
    next();
  } catch {
    res.sendStatus(401);
  }
}
```

### Frontend auth-calls (React example)
```ts
// src/lib/api/auth.ts
export async function apiLogin(email: string, password: string) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login mislukt');
  return res.json();
}
```

```ts
// src/hooks/useAuthClient.ts
import { useState } from 'react';
import { apiLogin } from '../lib/api/auth';

export function useAuthClient() {
  const [user, setUser] = useState(null);
  const [accessToken, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    setToken(data.accessToken);
  };

  return { user, accessToken, login };
}
```

## Projecten & materialen API
Routes (allemaal `authGuard` + `organizationId` filter):
- `GET /projects`
- `POST /projects` (name, client)
- `GET /projects/:id`
- `DELETE /projects/:id`
- `GET /projects/:id/materials`
- `POST /projects/:id/materials`
- `DELETE /materials/:id`
- `POST /projects/:id/custom-fields`
- `DELETE /custom-fields/:id`

Express-implementatie schets:
```ts
router.get('/projects', authGuard, async (req: AuthRequest, res) => {
  const projects = await prisma.project.findMany({ where: { organizationId: req.user!.organizationId } });
  res.json({ projects });
});

router.post('/projects', authGuard, async (req: AuthRequest, res) => {
  const project = await prisma.project.create({
    data: { name: req.body.name, client: req.body.client, organizationId: req.user!.organizationId, ownerId: req.user!.id },
  });
  res.status(201).json({ project });
});

router.post('/projects/:id/materials', authGuard, async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
  });
  if (!project) return res.sendStatus(404);
  const material = await prisma.projectMaterial.create({
    data: { projectId: project.id, ...req.body },
  });
  res.status(201).json({ material });
});
```

### Frontend hooks voor API-data
```ts
// src/hooks/useProjects.ts
import { useEffect, useState } from 'react';

export function useProjects(accessToken: string | null) {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    if (!accessToken) return;
    fetch('/projects', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((data) => setProjects(data.projects));
  }, [accessToken]);
  return { projects };
}
```

## MKI/GWP-berekeningen in de backend
- **Per materiaal:** `mkiTotal = quantity * mkiPerUnit` en idem voor `gwpTotal`. Per fase apart optellen als waarden aanwezig zijn.
- **Per project:** som van materiaal-totalen per fase + overall. Berekening in een service zodat alle exports dezelfde uitkomst hebben.

Endpoint:
```ts
router.get('/projects/:id/summary', authGuard, async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    include: { materials: true },
  });
  if (!project) return res.sendStatus(404);

  const phaseTotals = { A1: 0, A2: 0, A3: 0, D: 0 };
  let mkiTotal = 0;
  let gwpTotal = 0;

  project.materials.forEach((m) => {
    const materialMki = (m.mkiPerUnit ?? 0) * (m.quantity ?? 0);
    const materialGwp = (m.gwpPerUnit ?? 0) * (m.quantity ?? 0);
    mkiTotal += materialMki;
    gwpTotal += materialGwp;
    phaseTotals.A1 += (m.phaseA1Mki ?? 0) * (m.quantity ?? 0);
    phaseTotals.A2 += (m.phaseA2Mki ?? 0) * (m.quantity ?? 0);
    phaseTotals.A3 += (m.phaseA3Mki ?? 0) * (m.quantity ?? 0);
    phaseTotals.D += (m.phaseDMki ?? 0) * (m.quantity ?? 0);
  });

  res.json({ project: { id: project.id, name: project.name }, totals: { mkiTotal, gwpTotal, phaseTotals }, materials: project.materials });
});
```

Voorbeeldresponse:
```json
{
  "project": { "id": "prj_123", "name": "N3 viaduct" },
  "totals": {
    "mkiTotal": 12500.4,
    "gwpTotal": 8420.1,
    "phaseTotals": { "A1": 2100, "A2": 950, "A3": 4300, "D": 600 }
  },
  "materials": [
    { "id": "mat_1", "name": "Beton C35/45", "quantity": 120, "unit": "m3", "mkiPerUnit": 12.3 }
  ]
}
```

Frontend-gebruik: fetch `/projects/:id/summary` en toon de totalen in een tabel of gebruik de faseTotalen voor grafieken.

## EPD-upload en parsing (server-side)
```ts
// epd/routes.ts
import multer from 'multer';
import pdfParse from 'pdf-parse';

const upload = multer({ dest: 'uploads/' });

router.post('/epds/upload', authGuard, upload.single('file'), async (req: AuthRequest, res) => {
  const pdfBuffer = req.file!.buffer ?? await fs.promises.readFile(req.file!.path);
  const parsed = await pdfParse(pdfBuffer);
  const text = parsed.text;
  const extract = (label: RegExp) => {
    const match = label.exec(text.toLowerCase());
    return match ? Number(match[1].replace(',', '.')) : undefined;
  };
  const result = {
    phases: {
      A1: extract(/a1[^0-9]*([0-9.,]+)/),
      A2: extract(/a2[^0-9]*([0-9.,]+)/),
      A3: extract(/a3[^0-9]*([0-9.,]+)/),
      D: extract(/\bd[^0-9]*([0-9.,]+)/),
    },
    mkiPerUnit: extract(/(mki|eci|€)\s*[:=]?\s*([0-9.,]+)/),
    gwpPerUnit: extract(/(gwp(?: total)?|gwp[ -]?t)\s*[:=]?\s*([0-9.,]+)/),
  };

  const doc = await prisma.epdDocument.create({
    data: {
      organizationId: req.user!.organizationId,
      projectId: req.body.projectId ?? null,
      supplier: req.body.supplier,
      productName: req.body.productName,
      filePath: req.file!.path,
      parsedData: result,
    },
  });

  res.status(201).json({ epd: doc, parsed: result });
});
```

Frontend-aanpassing: `EpdUpload` stuurt `FormData` naar `/epds/upload`, ontvangt `parsed` en vult fasevelden + `mkiPerUnit` en `gwpPerUnit` in het materiaalformulier.

**Tip voor betere herkenning:** voeg mapping-tabellen toe per leverancier (bijv. regex-profielen) en valideer eenheden; cache veelgebruikte EPD-profielen in de database.

## Excel-export (exceljs)
```ts
router.get('/projects/:id/export.xlsx', authGuard, async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    include: { materials: true },
  });
  if (!project) return res.sendStatus(404);

  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('Materialen');
  sheet.addRow(['Project', project.name, 'Opdrachtgever', project.client ?? '-']);
  sheet.addRow([]);
  sheet.addRow(['Naam', 'Leverancier', 'Qty', 'Eenheid', 'MKI/eenh', 'GWP/eenh', 'A1', 'A2', 'A3', 'D']);
  project.materials.forEach((m) => {
    sheet.addRow([
      m.name,
      m.supplier ?? '',
      m.quantity ?? '',
      m.unit ?? '',
      m.mkiPerUnit ?? '',
      m.gwpPerUnit ?? '',
      m.phaseA1Mki ?? '',
      m.phaseA2Mki ?? '',
      m.phaseA3Mki ?? '',
      m.phaseDMki ?? '',
    ]);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  res
    .setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    .setHeader('Content-Disposition', `attachment; filename=project-${project.id}.xlsx`)
    .send(buffer);
});
```

Frontend-knop: `<a href="/projects/${id}/export.xlsx" className="button">Exporteer</a>` of fetch + blob download.

## PDF-rapport (Puppeteer)
- HTML-template met titelpagina, methode-uitleg, tabel met MKI/GWP per fase.

```ts
router.get('/projects/:id/report.pdf', authGuard, async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, organizationId: req.user!.organizationId },
    include: { materials: true },
  });
  if (!project) return res.sendStatus(404);

  const html = `<html><body>
    <h1>${project.name}</h1>
    <p>Opdrachtgever: ${project.client ?? '-'}</p>
    <h2>Resultaten</h2>
    <table>
      <tr><th>Materiaal</th><th>MKI/eenh</th><th>GWP/eenh</th><th>A1</th><th>A2</th><th>A3</th><th>D</th></tr>
      ${project.materials
        .map(
          (m) => `<tr><td>${m.name}</td><td>${m.mkiPerUnit ?? ''}</td><td>${m.gwpPerUnit ?? ''}</td><td>${m.phaseA1Mki ?? ''}</td><td>${m.phaseA2Mki ?? ''}</td><td>${m.phaseA3Mki ?? ''}</td><td>${m.phaseDMki ?? ''}</td></tr>`
        )
        .join('')}
    </table>
  </body></html>`;

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=project-${project.id}.pdf`);
  res.send(pdf);
});
```

Frontend-knop: `<button onClick={() => window.open(`/projects/${id}/report.pdf`, '_blank')}>Download PDF-rapport</button>`.

## Hardening, rollen, pricing & onboarding
- **Security:** bcrypt hashing, rate limiting (login/register), input-validatie (zod/yup), audit logging, HTTPS, CSRF-bescherming voor cookies, helmet, CORS beperkt per origin.
- **Backups & monitoring:** dagelijkse Postgres-backups (WAL), uptime-monitoring, log-aggregatie (ELK/Datadog), alerts op 4xx/5xx en performance.
- **Omgevingen:** gescheiden `.env` voor dev/stage/prod, seeddata voor demo, feature-flags voor beta-features.
- **Rollenmodel:**
  - `ORG_ADMIN`: beheert organisatie, gebruikers, billing, alle projecten.
  - `USER`: CRUD op projecten/materialen binnen de organisatie.
  - `VIEWER`: alleen lezen (geen POST/PUT/DELETE). Guards checken `req.user.role`.
- **Pricing-ideeën:**
  - Per gebruiker/maand (staffel): €39 gebruiker, volumekorting vanaf 20 seats.
  - Per project: bundel 10 projecten inbegrepen, daarna €5/project/maand.
  - Add-ons: EPD-profielenpakket, export/rapportage premium.
- **Onboarding-wizard:**
  1) Projectnaam + opdrachtgever.
  2) Upload eerste EPD of kies uit bibliotheek.
  3) Voeg transport & hoeveelheid toe.
  4) Nodig teamleden uit.
- **Trial flow:** 14 dagen gratis, limitering: max 2 projecten, 20 materialen, export watermerk. Na trial: directe upgrade CTA en billing.
