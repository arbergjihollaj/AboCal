# AboCal - Smart Scheduler 🧠✨

AboCal ist ein KI- und Tetris-inspirierter Kalender, entworfen, um die harte Realität des Universitäts-Rhythmus zu bändigen. Die Applikation erlaubt harte Blocker (Vorlesungen, Testate) farblich zu priorisieren und flexible Aufgaben (wie Übungsblätter) über einen dynamischen Algorithmus automatisch in Lücken zu pushen.

## Features
- **Dark Mode 121212**: Nativer Glassmorphismus-Look und brillante Pastellfarben.
- **Tetris-Algorithmus**: Plant flexible Lernsitzungen absolut dynamisch basierend auf deinem Stundenplan und Pufferzeiten.
- **Snap-Scrolling UX**: Horizontales iOS-artiges Swipen auf Smartphones.
- **Doppelklick-CRUD**: Blöcke im Browser direkt via Doppelklick aktualisieren oder restlos löschen.

## Homelab Deployment (Docker Compose)

AboCal benötigt eine existierende PostgreSQL Datenbank.

1. `.env` Datei im Hauptverzeichnis (Root) hinterlegen:
   ```env
   DATABASE_URL="postgresql://<USER>:<PASSWORT>@<IP>:5432/abocal"
   ```

2. Initiiere die Datenbank-Struktur (falls Postgres frisch installiert wurde):
   ```bash
   npx prisma db push
   # Optional: Erstelle den perfekten 4-Wochen Uni-Rhythmus
   npx tsx prisma/seed.ts
   ```

3. Docker anfeuern:
   ```bash
   docker compose up -d --build
   ```

Die App ist nach Sekundenbauzeit im Homelab unter `http://[IP]:3000` erreichbar!
