# KÖNYVKOCKA — develop

## Röviden erről az ágról

Ez a branch az aktív fejlesztési vonal, ahol az új funkciók és javítások először összeállnak.

A cél itt a gyors iteráció: stabil alapokon, de fejlesztői tempóban.

## Mit találsz ebben a branchben?

- .dockerignore: a konténer buildből kizárt elemek listája.
- .gitignore: verziókezelésből kizárt fájlok és mappák.
- Backend: ASP.NET Core API réteg, üzleti logikával, végpontokkal és adatkezeléssel.
- Database: SQL scriptek, adatmodell és adatbázis-segédfájlok.
- Dockerfile: konténerkép-építési konfiguráció.
- Frontend: React + Vite kliensalkalmazás, modern felhasználói felülettel.
- README.md: branch-szintű áttekintő dokumentáció.
- docker-compose.yml: több szolgáltatás összehangolt helyi futtatása.
- render.yaml: Render platformos deploy-konfiguráció.

## Kiemelt erősségek

- Átlátható struktúra az adott célterülethez igazítva.
- Könnyű tájékozódás és gyors belépési pont a projektbe.
- A branch funkciója egyértelműen felismerhető a tartalomból.

## Hogyan értelmezd ezt a tartalmat?

- A branch felépítése moduláris: külön rétegben jelenik meg a kliens, a szerver és az adatkezelés.
- A mappastruktúra tudatosan átlátható, így gyorsan megtalálhatók a kulcsfontosságú részek.
- A tartalom a branch nevéhez igazodik, ezért könnyen követhető, hogy ez az ág milyen szerepet tölt be a teljes projektben.

## Kinek ajánlott ez az ág?

- Fejlesztőknek és érdeklődőknek, akik az adott branch célterületét szeretnék átlátni.
- Olyan felhasználóknak, akik a projekt fejlődési lépcsőit követik.

## Miért érdemes ezt megnézni?

- Jól látható rajta a KÖNYVKOCKA projekt fókusza és működési logikája.
- Gyors belépési pontot ad az adott funkcionális területhez.
- Segít abban, hogy pár perc alatt tudd, hol keresd a számodra fontos részeket.
