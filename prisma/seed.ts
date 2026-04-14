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
  console.log('Starte Seeding mit dem Clean-Design Flow (Spaced Repetition)...');

  // Tabellen löschen
  await prisma.flexibleTask.deleteMany({});
  await prisma.staticEvent.deleteMany({});
  await prisma.subject.deleteMany({});

  // 1. Subjects anlegen (Dark/Light kompatibel, hier für Clean Design)
  const subOs = await prisma.subject.create({
    data: { id: 'os', name: 'Betriebssysteme', colorCode: 'rgba(244, 63, 94, 0.15)', textColor: '#e11d48' } // Rose stark für Light Mode Text
  });
  const subMath = await prisma.subject.create({
    data: { id: 'math', name: 'Mathe 2', colorCode: 'rgba(99, 102, 241, 0.15)', textColor: '#4f46e5' } // Indigo starik
  });
  const subProg = await prisma.subject.create({
    data: { id: 'prog', name: 'Prog 2', colorCode: 'rgba(20, 184, 166, 0.15)', textColor: '#0d9488' } // Teal stark
  });
  const subAlgo = await prisma.subject.create({
    data: { id: 'algo', name: 'Algorithmen', colorCode: 'rgba(245, 158, 11, 0.15)', textColor: '#d97706' } // Amber stark
  });
  const subSoft = await prisma.subject.create({
    data: { id: 'soft', name: 'Soft Skills', colorCode: 'rgba(139, 92, 246, 0.15)', textColor: '#7c3aed' } // Violet stark
  });

  const monday = getMonday(new Date());

  const createDate = (weekOffset: number, dayOffset: number, hours: number, minutes: number) => {
     const d = new Date(monday);
     d.setDate(d.getDate() + (weekOffset * 7) + dayOffset);
     d.setHours(hours, minutes, 0, 0);
     return d;
  };

  for (let w = 0; w < 4; w++) {
     // ================= STATISCHE VORLESUNGEN (Anker) =================
     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesung Betriebssysteme',
         startTime: createDate(w, 1, 11, 30), // Di 11:30 (Beispiel User Prompt)
         endTime: createDate(w, 1, 13, 0),
         requiresTravelTime: true,
         isStatic: true,
         subjectId: subOs.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesung Algorithmen',
         startTime: createDate(w, 3, 13, 15), // Do 13:15
         endTime: createDate(w, 3, 15, 0),
         requiresTravelTime: true,
         isStatic: true,
         subjectId: subAlgo.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesung Mathe 2',
         startTime: createDate(w, 0, 10, 0), // Mo 10:00 (Angenommen)
         endTime: createDate(w, 0, 11, 30),
         requiresTravelTime: true,
         isStatic: true,
         subjectId: subMath.id
       }
     });

     await prisma.staticEvent.create({
       data: {
         title: 'Vorlesung Prog 2',
         startTime: createDate(w, 2, 9, 30), // Mi 9:30 (Angenommen)
         endTime: createDate(w, 2, 11, 30),
         requiresTravelTime: true,
         isStatic: true,
         subjectId: subProg.id
       }
     });

     // ================= FLEXIBLE LERNAUFGABEN (Flow & Spaced Repetition) =================

     // Prog 2 Testate & Mathe Quiz -> Deadline: Dienstag 23:59. Hohe Prio zwingt sie auf Mo/Di!
     await prisma.flexibleTask.create({
       data: {
         title: `Prog 2 Testate (Teil 1 & 2)`,
         subjectId: subProg.id,
         duration: 180, // 3h total
         minChunk: 60,
         maxChunk: 120, // Tetris teilt es automatisch auf
         priority: 'high',
         deadline: createDate(w, 1, 23, 59), // Dienstag
       }
     });

     await prisma.flexibleTask.create({
       data: {
         title: `Mathe Quiz (Woche ${w+1})`,
         subjectId: subMath.id,
         duration: 90, 
         minChunk: 45,
         maxChunk: 90,
         priority: 'high',
         deadline: createDate(w, 1, 23, 59), // Dienstag
       }
     });

     // Soft Skills Quiz Vorbereitung -> Soll Mittwoch stattfinden, Quiz ist Donnerstag (Angenommen Do 10:00)
     await prisma.flexibleTask.create({
       data: {
         title: `Soft Skills Vorbereitung`,
         subjectId: subSoft.id,
         duration: 120, 
         minChunk: 60,
         maxChunk: 120,
         priority: 'high',
         deadline: createDate(w, 3, 9, 0), // Donnerstag früh fällig -> rutscht auf Mittwoch!
       }
     });

     // Spaced Repetition: Mathe Nacharbeit -> Soll bewusst Freitag/Samstag stattfinden.
     // Trick: Prio Low, Deadline späte Woche (Samstag).
     await prisma.flexibleTask.create({
       data: {
         title: `Mathe NW (Spaced Repetition)`,
         subjectId: subMath.id,
         duration: 120, 
         minChunk: 60,
         maxChunk: 90,
         priority: 'low', // Low Priority drückt es nach hinten
         deadline: createDate(w, 5, 23, 59), // Samstag Abend
       }
     });

     // Allgemeine Weekly Review (Immer am Ende der Woche)
     await prisma.flexibleTask.create({
       data: {
         title: `Wochen-Review & Planung`,
         duration: 60, 
         minChunk: 60,
         maxChunk: 60,
         priority: 'low',
         deadline: createDate(w, 6, 20, 0), // Sonntag Abend
       }
     });
  }

  console.log('Stundenplan im Clean-Flow Format erfolgreich gesät!');
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
