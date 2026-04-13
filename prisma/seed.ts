// prisma/seed.ts
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getMonday(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 is Sunday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

async function main() {
  console.log('Starte Seeding mit dem expliziten Intensiv-Wochenplan...');

  // Tabellen löschen (Reihenfolge wichtig wg. Relationen)
  await prisma.flexibleTask.deleteMany({});
  await prisma.staticEvent.deleteMany({});
  await prisma.subject.deleteMany({});

  // 1. Subjects anlegen (Pastel Dark-Mode Colors)
  const subOs = await prisma.subject.create({
    data: { id: 'os', name: 'Betriebssysteme', colorCode: 'rgba(225, 29, 72, 0.15)', textColor: '#fb7185' } // Rose
  });
  const subMath = await prisma.subject.create({
    data: { id: 'math', name: 'Mathe 2', colorCode: 'rgba(79, 70, 229, 0.15)', textColor: '#818cf8' } // Indigo
  });
  const subProg = await prisma.subject.create({
    data: { id: 'prog', name: 'Prog 2', colorCode: 'rgba(13, 148, 136, 0.15)', textColor: '#2dd4bf' } // Teal
  });
  const subAlgo = await prisma.subject.create({
    data: { id: 'algo', name: 'Algorithmen', colorCode: 'rgba(217, 119, 6, 0.15)', textColor: '#fbbf24' } // Amber
  });
  const subSoft = await prisma.subject.create({
    data: { id: 'soft', name: 'Soft Skills', colorCode: 'rgba(124, 58, 237, 0.15)', textColor: '#a78bfa' } // Violet
  });

  const monday = getMonday(new Date());

  const createDate = (weekOffset: number, dayOffset: number, hours: number, minutes: number) => {
     const d = new Date(monday);
     d.setDate(d.getDate() + (weekOffset * 7) + dayOffset);
     d.setHours(hours, minutes, 0, 0);
     return d;
  };

  for (let w = 0; w < 4; w++) {
     // ================= MONTAG =================
     await prisma.staticEvent.create({
       data: {
         title: 'Mathe 2 – Quiz bearbeiten & Vorlesung nachbereiten',
         startTime: createDate(w, 0, 13, 0),
         endTime: createDate(w, 0, 15, 0),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subMath.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Prog 2 – Testate (Teil 1: Implementierung)',
         startTime: createDate(w, 0, 15, 30),
         endTime: createDate(w, 0, 18, 0),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subProg.id
       }
     });

     // ================= DIENSTAG =================
     await prisma.staticEvent.create({
       data: {
         title: 'Prog 2 – Testate (Teil 2: Finalisierung & Abgabe)',
         startTime: createDate(w, 1, 8, 0),
         endTime: createDate(w, 1, 9, 15),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subProg.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesungen (Prog 2 / Mathe 2)',
         startTime: createDate(w, 1, 9, 45),
         endTime: createDate(w, 1, 13, 0),
         requiresTravelTime: true,
         isStatic: true,
         subjectId: subProg.id // Combined? we just use prog color for now
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'NW Betriebssysteme – Theorie & Begriffe',
         startTime: createDate(w, 1, 13, 15),
         endTime: createDate(w, 1, 14, 45),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subOs.id
       }
     });

     // Nur visuell, kein Event
     await prisma.staticEvent.create({
       data: {
         title: '🚨 Abgabe-Deadline (Prog/Mathe)',
         startTime: createDate(w, 1, 15, 0),
         endTime: createDate(w, 1, 15, 15),
         requiresTravelTime: false,
         isStatic: true,
       }
     });

     // ================= MITTWOCH =================
     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesungen (Soft Skills / Betriebssysteme)',
         startTime: createDate(w, 2, 8, 0),
         endTime: createDate(w, 2, 11, 30),
         requiresTravelTime: true,
         isStatic: true,
         subjectId: subOs.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'NW Soft Skills – Quiz-Vorbereitung',
         startTime: createDate(w, 2, 12, 0),
         endTime: createDate(w, 2, 14, 0),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subSoft.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'NW Mathe 2 – Übungsblätter & Theorie',
         startTime: createDate(w, 2, 14, 30),
         endTime: createDate(w, 2, 16, 30),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subMath.id
       }
     });

     // ================= DONNERSTAG =================
     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesungen (Mathe 2 / Algorithmen)',
         startTime: createDate(w, 3, 8, 0),
         endTime: createDate(w, 3, 11, 15),
         requiresTravelTime: true,
         isStatic: true,
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Soft Skills – Quiz-Abgabe & Pufferzeit',
         startTime: createDate(w, 3, 11, 15),
         endTime: createDate(w, 3, 13, 0),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subSoft.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesungen (Algorithmen / Prog 2)',
         startTime: createDate(w, 3, 13, 15),
         endTime: createDate(w, 3, 17, 15),
         requiresTravelTime: true,
         isStatic: true,
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'NW Algorithmen & Datenstrukturen – Code testen',
         startTime: createDate(w, 3, 17, 15),
         endTime: createDate(w, 3, 19, 0),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subAlgo.id
       }
     });

     // ================= FREITAG =================
     await prisma.staticEvent.create({
       data: {
         title: 'NW Programmierung 2 – Reflektion',
         startTime: createDate(w, 4, 10, 0),
         endTime: createDate(w, 4, 12, 0),
         requiresTravelTime: false,
         isStatic: true,
         subjectId: subProg.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Review – Check der kommenden Woche',
         startTime: createDate(w, 4, 12, 0),
         endTime: createDate(w, 4, 14, 0),
         requiresTravelTime: false,
         isStatic: true,
         // No subject assigned intentionally for variety (general tasks)
       }
     });
     
  }

  console.log('Stundenplan mit festen, farbigen Lern-Blöcken erfolgreich gesät!');
}

main()
  .catch((e) => {
    console.error('Fehler beim Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
