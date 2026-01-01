# 🚀 Releases Branch

Ez a branch a **tesztelésre szánt stabil verziók** gyűjtőhelye.

## 🔧 Szabályok
- Csak a **`develop` branchből** merge-elj ide.
- Közvetlenül **nem commitolunk** semmit ide.
- Minden commitnak stabil, futtatható kódot kell tartalmaznia.
- Verziókat **snapshotként**, **alpha**, **beta** vagy **release candidate** formában jelölünk, pl.:
  - `V0.1 Snapshot`
  - `V0.5 Beta`
  - `V1.0 RC1`

## 🧪 Cél
Innen indul a **tesztelés és minőségellenőrzés (QA)**.  
Ha minden rendben, ebből a branchből készül a **végleges verzió**, ami majd a `main`-be kerül.
