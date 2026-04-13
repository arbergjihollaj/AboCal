// src/utils/scheduler.ts
import { StaticEvent, FlexibleTask, UserPreferences, ScheduledTask } from '../types';

// Internal Interface for Time Slots
interface TimeSlot {
  start: Date;
  end: Date;
}

interface TaskChunk {
  task: FlexibleTask;
  durationMinutes: number;
}

// 1. Helpers for White Space Analyse
function parseTimeStr(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function mergeTimeSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.length === 0) return [];
  const sorted = slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: TimeSlot[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current.start.getTime() <= last.end.getTime()) {
      if (current.end.getTime() > last.end.getTime()) {
        last.end = current.end;
      }
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function getFreeSlots(activeStart: Date, activeEnd: Date, busySlots: TimeSlot[]): TimeSlot[] {
  const freeSlots: TimeSlot[] = [];
  let currentStart = new Date(activeStart);

  for (const busy of busySlots) {
    if (busy.start.getTime() > currentStart.getTime()) {
      freeSlots.push({
        start: new Date(currentStart),
        end: new Date(busy.start)
      });
    }
    if (busy.end.getTime() > currentStart.getTime()) {
      currentStart = new Date(busy.end);
    }
  }

  if (currentStart.getTime() < activeEnd.getTime()) {
    freeSlots.push({
      start: new Date(currentStart),
      end: new Date(activeEnd)
    });
  }

  return freeSlots;
}

// 2. Helpers for Chunking
function chunkTasks(tasks: FlexibleTask[]): TaskChunk[] {
  const chunks: TaskChunk[] = [];
  for (const task of tasks) {
    let remaining = task.totalDurationMinutes;
    const { minChunkMinutes, maxChunkMinutes } = task.chunkingRules;
    while (remaining > 0) {
      if (remaining >= maxChunkMinutes) {
        chunks.push({ task, durationMinutes: maxChunkMinutes });
        remaining -= maxChunkMinutes;
      } else if (remaining >= minChunkMinutes) {
        chunks.push({ task, durationMinutes: remaining });
        remaining = 0;
      } else {
        chunks.push({ task, durationMinutes: remaining });
        remaining = 0;
      }
    }
  }
  return chunks;
}

// Main Algorithm Function - 4. Stateless Design
export function generateDynamicSchedule(
  targetDate: Date,
  staticEvents: StaticEvent[],
  flexibleTasks: FlexibleTask[],
  prefs: UserPreferences
): ScheduledTask[] {
  const dayOfWeek = targetDate.getDay();
  if (prefs.noStudyDays.includes(dayOfWeek)) {
    return []; // No studying today!
  }

  // 1. White Space Analyse
  const activeStart = parseTimeStr(prefs.activeHours.start, targetDate);
  const activeEnd = parseTimeStr(prefs.activeHours.end, targetDate);
  const busySlots: TimeSlot[] = [];

  // Add routines to busy slots
  for (const r of prefs.routines) {
    busySlots.push({
      start: parseTimeStr(r.startTime, targetDate),
      end: parseTimeStr(r.endTime, targetDate)
    });
  }

  // Add static events to busy slots with buffer
  for (const ev of staticEvents) {
    const startObj = new Date(ev.startTime);
    const endObj = new Date(ev.endTime);

    // Apply buffer before and after static events
    startObj.setMinutes(startObj.getMinutes() - prefs.bufferMinutes);
    endObj.setMinutes(endObj.getMinutes() + prefs.bufferMinutes);

    busySlots.push({ start: startObj, end: endObj });
  }

  const mergedBusy = mergeTimeSlots(busySlots);
  const freeSlots = getFreeSlots(activeStart, activeEnd, mergedBusy);

  // 2. Chunking
  const chunks = chunkTasks(flexibleTasks);

  // 3. Matching
  // Sort chunks by priority ('high' first) then deadline (earliest first)
  chunks.sort((a, b) => {
    if (a.task.priority === 'high' && b.task.priority === 'low') return -1;
    if (a.task.priority === 'low' && b.task.priority === 'high') return 1;
    return a.task.deadline.getTime() - b.task.deadline.getTime();
  });

  const schedule: ScheduledTask[] = [];

  for (const chunk of chunks) {
    for (let i = 0; i < freeSlots.length; i++) {
      const slot = freeSlots[i];
      const slotDuration = (slot.end.getTime() - slot.start.getTime()) / 60000;

      const timeNeeded = chunk.durationMinutes;

      if (slotDuration >= timeNeeded) {
        const chunkEnd = new Date(slot.start.getTime() + timeNeeded * 60000);

        schedule.push({
          id: Math.random().toString(36).substr(2, 9),
          taskId: chunk.task.id,
          title: chunk.task.title,
          startTime: new Date(slot.start),
          endTime: chunkEnd,
          isFlexible: true,
          subjectId: chunk.task.subjectId
        });

        // 4. Update state / Domino-Effekt-Vorbereitung (stateless update)
        // Shrink the free slot to make room for the next task
        // We add the bufferMinutes AFTER each study chunk so there's a break
        slot.start = new Date(chunkEnd.getTime() + prefs.bufferMinutes * 60000);
        break; // Match found, break to next chunk
      }
    }
  }

  return schedule;
}
