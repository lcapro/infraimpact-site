# LCA project tool (React + TypeScript + Vite + Tailwind)

Deze map bevat een moderne SPA-basis voor de LCA-project-tool. De applicatie bevat authenticatie (registratie, login, e-mailverificatie, wachtwoordreset), projectbeheer en materiaalregistratie met EPD-uploadparser op localStorage.

## Aanbevolen mappenstructuur
- `src/pages`: route-level pagina's zoals `AuthPage` en `WorkspacePage`.
- `src/components/layout`: layoutcomponenten (`AppLayout`, `Navbar`).
- `src/components/workspace`: herbruikbare blokken voor projecten, materialen en EPD-upload.
- `src/components/auth`: extra auth-gerelateerde bouwstenen indien nodig.
- `src/lib`: types, localStorage-store en hooks (`useAuth`, `useWorkspace`).
- `public`: statische assets.

## Project opzetten
```bash
cd lca-project-tool-spa
npm install
npm run dev      # start Vite devserver (http://localhost:5173)
npm run build    # type-check + production build
npm run preview  # serve de build lokaal
```

## Tailwind configureren
- `tailwind.config.js` is ingesteld om `index.html` en alle `src/**/*.{ts,tsx}` bestanden te scannen.
- `postcss.config.js` activeert `tailwindcss` en `autoprefixer`.
- `src/index.css` bevat de `@tailwind base/components/utilities` directieven plus globale styling.

## Kerncomponenten
- `AppLayout` en `Navbar`: baselayout en topnavigatie met sessiestatus.
- `AuthPage`: registratie/login/verificatie/reset flows met demo-mailbox.
- `WorkspacePage`: protected area met projecten, materiaalformulier, EPD-upload en overzichtstabel.
- `ProjectList`, `MaterialForm`, `MaterialsTable`, `EpdUpload`: modulaire bouwstenen voor het beheer van projecten en materialen.

De storage blijft voorlopig client-side via localStorage (zie `src/lib/useAuth.ts` en `src/lib/useWorkspace.ts`).
