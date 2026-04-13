// src/types/index.ts

export interface StaticEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isStatic: true;
  requiresTravelTime: boolean;
  subjectId?: string | null;
}

export interface ChunkingRules {
  minChunkMinutes: number;
  maxChunkMinutes: number;
}

export interface FlexibleTask {
  id: string;
  title: string;
  subjectId: string;
  totalDurationMinutes: number;
  deadline: Date;
  priority: 'high' | 'low';
  chunkingRules: ChunkingRules;
}

export interface Routine {
  title: string;
  startTime: string; // e.g., "08:00"
  endTime: string;   // e.g., "09:00"
}

export interface UserPreferences {
  activeHours: {
    start: string; // e.g., "08:00"
    end: string;   // e.g., "22:00"
  };
  routines: Routine[];
  noStudyDays: number[]; // 0 for Sunday
  bufferMinutes: number; // e.g., 15 minutes
}

export interface Subject {
  id: string;
  name: string;
  colorCode: string;
  textColor: string;
}

export interface ScheduledTask {
  id: string;
  taskId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isFlexible: true;
  subjectId: string;
}
