// src/utils/testScheduler.ts
import { generateDynamicSchedule } from './scheduler';
import { StaticEvent, FlexibleTask, UserPreferences } from '../types';

const targetDate = new Date(); // Heute
targetDate.setHours(0, 0, 0, 0);

const dummyPrefs: UserPreferences = {
  activeHours: { start: "08:00", end: "22:00" },
  routines: [
    { title: "Morning Routine", startTime: "08:00", endTime: "09:00" }
  ],
  noStudyDays: [0], // 0 = Sonntag
  bufferMinutes: 15 // 15 Min Pause zwischen allem
};

// 09:30 bis 14:00 (Schule) und 18:00 bis 20:00 (Freunde)
const schuleStart = new Date(targetDate); schuleStart.setHours(9, 30, 0, 0);
const schuleEnd = new Date(targetDate); schuleEnd.setHours(14, 0, 0, 0);

const freundeStart = new Date(targetDate); freundeStart.setHours(18, 0, 0, 0);
const freundeEnd = new Date(targetDate); freundeEnd.setHours(20, 0, 0, 0);

const staticEvents: StaticEvent[] = [
  {
    id: "ev1",
    title: "Schule",
    startTime: schuleStart,
    endTime: schuleEnd,
    isStatic: true,
    requiresTravelTime: true
  },
  {
    id: "ev2",
    title: "Treffen mit Freunden",
    startTime: freundeStart,
    endTime: freundeEnd,
    isStatic: true,
    requiresTravelTime: true
  }
];

// 180 Minutes Mathe (Deadline tomorrow, high priority)
const tomorrow = new Date(targetDate);
tomorrow.setDate(tomorrow.getDate() + 1);

const flexibleTasks: FlexibleTask[] = [
  {
    id: "t1",
    title: "Mathe Lernen (Klausur)",
    subjectId: "math",
    totalDurationMinutes: 180,
    deadline: tomorrow,
    priority: 'high',
    chunkingRules: {
      minChunkMinutes: 45,
      maxChunkMinutes: 90
    }
  }
];

const result = generateDynamicSchedule(targetDate, staticEvents, flexibleTasks, dummyPrefs);

console.log("=== ABO-CAL: TETRIS ALGORITHMUS TEST ===");
console.log("\n=== STATISCHE TERMINE ===");
staticEvents.forEach(e => {
  console.log(`- ${e.title}: ${e.startTime.toLocaleTimeString('de-DE')} - ${e.endTime.toLocaleTimeString('de-DE')}`);
});

console.log("\n=== DYNAMISCH BERECHNETER LERNPLAN ===");
if (result.length === 0) {
  console.log("Keine Tasks geplant (evtl. ein noStudyDay).");
} else {
  result.forEach(r => {
    const duration = (r.endTime.getTime() - r.startTime.getTime()) / 60000;
    console.log(`- [${r.title}] ${r.startTime.toLocaleTimeString('de-DE')} - ${r.endTime.toLocaleTimeString('de-DE')} (${duration} Min)`);
  });
}
