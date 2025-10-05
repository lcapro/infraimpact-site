
# InfraImpact website

Een lichte, snelle, statische website. Ontworpen voor GitHub Pages.

## Projectstructuur
```
/
├─ index.html
├─ styles.css
├─ script.js
└─ assets/
   ├─ logo_full.png
   ├─ logo_mark.png
   ├─ favicon.png
   └─ favicon.ico
```

## Lokale preview
Open `index.html` direct in je browser, of start een simpele webserver:
```
python3 -m http.server 8080
```

## Deploy naar GitHub Pages
1. Maak een nieuwe GitHub-repository (bijv. `infraimpact-site`) en voeg de bestanden toe.
2. Zet Pages aan: **Settings → Pages**. Kies *Deploy from a branch*, branch `main`, folder `/root`.
3. (Optioneel) Voeg een `CNAME`-bestand toe met daarin `infraimpact.nl` voor een custom domain.
4. Configureer DNS bij je provider:
   - Gebruik **A-records** voor het apex-domein (infraimpact.nl) die naar GitHub Pages IP's wijzen.
   - Gebruik **CNAME** voor `www` → `<username>.github.io`.
5. Wacht op DNS-propagatie. Klaar!

## Content aanpassen
- Tekst: `index.html`
- Styling: `styles.css`
- Klein JS: `script.js`
