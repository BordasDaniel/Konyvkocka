# IKTProject2025

## Branch magyarázatok:


- ***main:***
  * Ide kerül a végső, éles verzió.
  * Senki ne commitoljon közvetlenül ide!
  * Csak akkor mergelünk ide, amikor egy teljesen stabil release elkészült.

- ***releases:***
  * Verziók kiadásakor használjuk (pl. release/v1.0-rc3).
  * Ide kerülnek a `develop` és `feature/*` branchekből érkező pull requestek, amikor a kód eléri a **kiadható állapotot**.  
  * Innen ágaznak le az **egyedi verzió branch-ek** (`release/v1.0-rc3`, `release/v1.1`, stb.).

- ***release:***
  * Minden **önálló verzióhoz** külön branch tartozik.  
  * Tartalmazza az adott verzió **befagyasztott (freeze)** állapotát.    
  * A tesztelés lezárása után innen történik a **merge a `main` branchbe** (végleges kiadás).  

- ***develop:***
  * Az aktuális fejlesztési állapot.
  * Minden új feature branch ide merge-elődik, miután review és teszt megtörtént.
  * Innen nyitunk majd release brancheket.

- ***feature:***
  * Új funkciók fejlesztésére szolgál (pl. `feature/login-auth`, `feature/dashboard-ui`).
  * A feature branch a develop-ből indul, és oda merge-elődik vissza.
  * Egy feature branch érintheti a frontend + backend + sql + desktop részeket egyszerre.

- ***hotfix:***
  * Ha a main-ben sürgősen javítani kell egy hibát, innen dolgozunk (pl. `hotfix/fix-login-bug`).
  * A javítást merge-eljük vissza main-be és develop-ba, hogy mindenhol frissüljön.
