# Konyvkocka - Branch dokumentacio: WPF

## Attekintes

A webes platform melle egy asztali (WPF) kliens iranyat is bemutato branch, ahol a ket kliensforma egy kozos backendhez illeszkedik.

## Programtipus

Hibrid branch: webes rendszer + kulon WPF kliens alkalmazas.

## Fo fajlok es mappak leirasa

- .dockerignore: A kontener buildbol kizart fajlok listaja.
- .github: CI/CD es workflow konfiguraciok a GitHub alapu automatizalasokhoz.
- .gitignore: Verzokezelesbol kizart fajlok es mappak szabalyai.
- Backend: ASP.NET Core API projekt, REST vegpontokkal, szolgaltatasokkal, DTO-kal es adateleressel.
- Database: SQL scriptgyujtemeny, adatmodell-leirasok es adatbazis-segedanyagok.
- Dockerfile: Kontener build-definicio a futtathato alkalmazaskep eloallitasahoz.
- Frontend: React/Vite alapokon epulo kliensalkalmazas, felhasznaloi felulettel es oldalnavigacioval.
- WPF: Asztali kliensalkalmazas forrasa (Windows Presentation Foundation) kulon UI-celokra.
- docker-compose.yml: Osszehangolt helyi futtatas tobb szolgaltatassal (app + adatbazis).
- render.yaml: Render platformhoz szolo deploy konfiguracio.

## Mukodes roviden

- A branchben talalhato komponensek egy kozos uzleti celra epulnek: a Konyvkocka platform tartalomfogyasztasi elmenyenek kiszolgalasara.
- A struktura kulon valasztja az alkalmazasretegeket (kliens, szerver, adat), ezert a fejlesztes, teszteles es uzemeltetes kulon-kulon is jol kezelheto.
- A branch neve es tartalma osszhangban van a release/fejlesztesi szerepkorrel, igy a bizottsagi bemutatas soran konnyen indokolhato a branch letjogosultsaga.

## Milyen allapotot kepvisel ez a branch?

Ez a branch a projekt egy jol elkulonitheto szeletet mutatja be. A tartalom ugy van szervezve, hogy szakmai bemutaton, minosegellenorzesen es GitHub-alapu attekintesben egyarant atlathato legyen.

## Legutobbi 5 commit

- d684191 (2026-04-14): Merge pull request #33 from BordasDaniel/develop - cae72a4 (2026-04-14): Merge branch 'kliensWPF' into develop - 275a925 (2026-04-14): rebase - 021c119 (2026-04-14): DB EER, PDF - 28b284f (2026-04-14): Docker f├íjlok.

## GitHub szemlelet

- A branch celja egyertelmu: vagy fejlesztesi fokusz (frontend/backend/database), vagy release/snapshot stabilizalas, vagy dokumentacios/bemutato cel.
- A commitelozmeny kovethetosege tamogatja a transzparens projektkommunikaciot es a visszakeresheto valtozaskezelesi gyakorlatot.
