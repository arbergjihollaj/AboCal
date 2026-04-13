// src/data/mockData.ts
import { StaticEvent, FlexibleTask, UserPreferences, Subject } from '../types';

// Use today's date but fixed to start of day for consistent rendering
export const getTargetDate = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathematik',
    colorCode: 'rgba(59, 130, 246, 0.2)', // Pastel Blue
    textColor: '#1d4ed8' // darker blue
  },
  {
    id: 'german',
    name: 'Deutsch',
    colorCode: 'rgba(239, 68, 68, 0.2)', // Pastel Red
    textColor: '#b91c1c' // darker red
  }
];

export const dummyPrefs: UserPreferences = {
  activeHours: { start: "08:00", end: "22:00" },
  routines: [
    { title: "Morning Routine", startTime: "08:00", endTime: "09:00" }
  ],
  noStudyDays: [0], // 0 = Sonntag
  bufferMinutes: 15
};

export const getStaticEvents = (baseDate: Date): StaticEvent[] => {
  const schuleStart = new Date(baseDate); schuleStart.setHours(9, 30, 0, 0);
  const schuleEnd = new Date(baseDate); schuleEnd.setHours(14, 0, 0, 0);

  const freundeStart = new Date(baseDate); freundeStart.setHours(18, 0, 0, 0);
  const freundeEnd = new Date(baseDate); freundeEnd.setHours(20, 0, 0, 0);

  return [
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
};

export const getFlexibleTasks = (baseDate: Date): FlexibleTask[] => {
  const tomorrow = new Date(baseDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
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
};
