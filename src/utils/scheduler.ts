// src/utils/scheduler.ts
import { StaticEvent, FlexibleTask, UserPreferences, ScheduledTask } from '../types';

interface TimeSlot {
  start: Date;
  end: Date;
}

interface TaskChunk {
  task: FlexibleTask;
  durationMinutes: number;
}

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

export function generateDynamicSchedule(
  startDate: Date,
  staticEvents: StaticEvent[],
  flexibleTasks: FlexibleTask[],
  prefs: UserPreferences
): ScheduledTask[] {
  
  const allFreeSlots: TimeSlot[] = [];

  // Generate the 7 days of the week starting from startDate
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startDate);
    currentDay.setDate(currentDay.getDate() + i);
    currentDay.setHours(0, 0, 0, 0);

    const dayOfWeek = currentDay.getDay(); // 0 is Sunday
    if (prefs.noStudyDays.includes(dayOfWeek)) continue;

    const activeStart = parseTimeStr(prefs.activeHours.start, currentDay);
    const activeEnd = parseTimeStr(prefs.activeHours.end, currentDay);
    const dailyBusySlots: TimeSlot[] = [];

    // Add Routines for this day
    for (const r of prefs.routines) {
      dailyBusySlots.push({
        start: parseTimeStr(r.startTime, currentDay),
        end: parseTimeStr(r.endTime, currentDay)
      });
    }

    // Find Custom StaticEvents for this specific day
    const todaysEvents = staticEvents.filter(ev => {
      const evStart = new Date(ev.startTime);
      return evStart.getDate() === currentDay.getDate() && 
             evStart.getMonth() === currentDay.getMonth() && 
             evStart.getFullYear() === currentDay.getFullYear();
    });

    for (const ev of todaysEvents) {
      const startObj = new Date(ev.startTime);
      const endObj = new Date(ev.endTime);

      const bufferStart = ev.requiresTravelTime ? 60 : prefs.bufferMinutes;
      const bufferEnd = ev.requiresTravelTime ? 60 : prefs.bufferMinutes;

      startObj.setMinutes(startObj.getMinutes() - bufferStart);
      endObj.setMinutes(endObj.getMinutes() + bufferEnd);
      dailyBusySlots.push({ start: startObj, end: endObj });
    }

    const mergedBusy = mergeTimeSlots(dailyBusySlots);
    const freeSlots = getFreeSlots(activeStart, activeEnd, mergedBusy);
    allFreeSlots.push(...freeSlots);
  }

  const chunks = chunkTasks(flexibleTasks);
  
  // Sort by priority -> deadline
  chunks.sort((a, b) => {
    if (a.task.priority === 'high' && b.task.priority === 'low') return -1;
    if (a.task.priority === 'low' && b.task.priority === 'high') return 1;
    return new Date(a.task.deadline).getTime() - new Date(b.task.deadline).getTime();
  });

  const schedule: ScheduledTask[] = [];

  // Matching
  for (const chunk of chunks) {
    for (let i = 0; i < allFreeSlots.length; i++) {
      const slot = allFreeSlots[i];
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

        // Domino Effect Array Shrinking
        slot.start = new Date(chunkEnd.getTime() + prefs.bufferMinutes * 60000);
        break; 
      }
    }
  }

  return schedule;
}
