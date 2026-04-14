"use client";

import React, { useState, useEffect } from 'react';
import { StaticEvent, ScheduledTask, FlexibleTask, UserPreferences, Subject } from '../types';
import { motion } from 'framer-motion';
import EditTaskModal from './EditTaskModal';

interface CalendarViewProps {
  staticEvents: StaticEvent[];
  scheduledTasks: ScheduledTask[];
  flexibleTasks: FlexibleTask[];
  prefs: UserPreferences;
  subjects: Subject[];
  baseDate: Date; // Should be the Monday of the current week
}

export default function CalendarView({
  staticEvents,
  scheduledTasks,
  flexibleTasks,
  prefs,
  subjects,
  baseDate,
}: CalendarViewProps) {
  const [editingTask, setEditingTask] = useState<{ type: 'static' | 'flexible', data: StaticEvent | FlexibleTask } | null>(null);

  const parseHour = (timeStr: string) => {
    const [h] = timeStr.split(':').map(Number);
    return h;
  };

  // Force 24h View (0 to 24)
  const startHour = 0; 
  const endHour = 24;     
  const totalHours = endHour - startHour;

  // Live Current Time State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000); // 1-minute ticker
    return () => clearInterval(interval);
  }, []);
  
  // Height configuration
  const PIXELS_PER_HOUR = 50; 
  
  const calculatePosition = (start: Date, end: Date) => {
    const startH = start.getHours() + start.getMinutes() / 60;
    const endH = end.getHours() + end.getMinutes() / 60;
    
    const clampedStart = Math.max(startHour, Math.min(startH, endHour));
    const clampedEnd = Math.max(startHour, Math.min(endH, endHour));
    
    const top = (clampedStart - startHour) * PIXELS_PER_HOUR;
    const height = (clampedEnd - clampedStart) * PIXELS_PER_HOUR;
    
    return { top, height };
  };

  const hoursList = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  // Generate the 7 days array
  const daysList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    d.setHours(0,0,0,0);
    return d;
  });

  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  // Helper to check if two dates are same day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden">
      
      {/* 7-Tage Header Reihe - Clean Design */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <div className="w-14 flex-shrink-0 border-r border-slate-100" />
        <div className="flex-1 grid grid-cols-7">
          {daysList.map((day, idx) => (
            <div key={idx} className="text-center py-4 border-r border-slate-100 last:border-0 relative">
               <div className={`text-[10px] font-bold tracking-widest uppercase mb-1.5 ${isSameDay(day, new Date()) ? 'text-blue-500' : 'text-slate-400'}`}>
                 {dayNames[day.getDay()]}
               </div>
               <div className={`text-xl font-semibold tracking-tight ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-700'}`}>
                 {day.getDate()}
               </div>
               {isSameDay(day, new Date()) && (
                  <motion.div layoutId="today-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-t-full" />
               )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex">
        {/* Time Axis */}
        <div className="w-14 flex-shrink-0 border-r border-slate-100 relative z-20 bg-slate-50/30">
          {hoursList.map((hour) => (
            <div 
              key={hour} 
              className="text-[10px] font-semibold text-slate-400 text-center relative"
              style={{ height: `${PIXELS_PER_HOUR}px`, top: '-7px' }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        
        {/* Calendar Grid (7 Columns) */}
        <div className="flex-1 relative overflow-x-auto snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Background horizontal lines that span all 7 days */}
          <div className="absolute inset-0 pointer-events-none min-w-[800px] md:min-w-0">
            {hoursList.slice(0, -1).map((hour, idx) => (
              <div 
                key={hour}
                className="absolute w-full border-t border-slate-100"
                style={{ top: `${idx * PIXELS_PER_HOUR}px` }}
              />
            ))}
          </div>

          <div className="min-w-[800px] md:min-w-0 grid grid-cols-7 h-full relative z-10 w-full" style={{ height: `${totalHours * PIXELS_PER_HOUR}px` }}>

            {daysList.map((currentDay, dayIdx) => {
              // Filtere Events für diese Tagesspalte
              const todaysStatics = staticEvents.filter(ev => isSameDay(new Date(ev.startTime), currentDay));
              const todaysScheduled = scheduledTasks.filter(tsk => isSameDay(new Date(tsk.startTime), currentDay));
              
              const dayOfWeek = currentDay.getDay();
              const isStudyDay = !prefs.noStudyDays.includes(dayOfWeek);

              return (
                <div key={dayIdx} className="relative border-r border-slate-100 last:border-0 h-full p-1.5 snap-start scroll-ml-[56px] md:scroll-ml-0">
                  
                  {/* Live Indicator (Current Time Line) */}
                  {isSameDay(currentDay, currentTime) && (
                    <div 
                      className="absolute left-0 right-0 z-40 flex items-center shadow-sm"
                      style={{ 
                        top: `${(Math.max(startHour, Math.min(currentTime.getHours() + currentTime.getMinutes() / 60, endHour)) - startHour) * PIXELS_PER_HOUR}px`,
                        height: '2px',
                        transform: 'translateY(-1px)',
                        pointerEvents: 'none'
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] -ml-1"></div>
                      <div className="flex-1 h-[2px] bg-red-500" />
                    </div>
                  )}
                  
                  {isStudyDay && prefs.routines.map((routine, idx) => {
                     const [stHr, stMin] = routine.startTime.split(':').map(Number);
                     const [enHr, enMin] = routine.endTime.split(':').map(Number);
                     
                     const sDate = new Date(currentDay); sDate.setHours(stHr, stMin, 0, 0);
                     const eDate = new Date(currentDay); eDate.setHours(enHr, enMin, 0, 0);
                     
                     const pos = calculatePosition(sDate, eDate);
                     if (pos.height <= 0) return null;
                     
                     return (
                       <div
                         key={`routine-${idx}`}
                         className="absolute left-1.5 right-1.5 bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center rounded-2xl pointer-events-none overflow-hidden"
                         style={{ top: `${pos.top}px`, height: `${pos.height}px`, zIndex: 1 }}
                       >
                         <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">{routine.title}</span>
                       </div>
                     );
                  })}

                  {todaysStatics.map(event => {
                    const pos = calculatePosition(event.startTime, event.endTime);
                    if (pos.height <= 0) return null;
                    
                    const subject = subjects.find(s => s.id === event.subjectId);
                    const bgColor = subject?.colorCode ? subject.colorCode.replace('0.15', '0.08') : '#f8fafc'; // Extra Light for Clean Design
                    const textColor = subject?.textColor || '#475569';
                    
                    return (
                      <motion.div
                        key={event.id}
                        onDoubleClick={() => setEditingTask({ type: 'static', data: event })}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute left-1.5 right-1.5 rounded-[18px] shadow-sm flex flex-col justify-start overflow-hidden z-20 cursor-pointer"
                        style={{ 
                          top: `${pos.top}px`, 
                          height: `${pos.height}px`,
                          backgroundColor: bgColor,
                          padding: '10px'
                        }}
                      >
                        <h3 className="font-bold text-[11px] leading-tight tracking-tight" style={{ color: textColor }}>{event.title}</h3>
                      </motion.div>
                    );
                  })}

                  {/* Render Scheduled Tasks */}
                  {todaysScheduled.map(task => {
                    const pos = calculatePosition(task.startTime, task.endTime);
                    if (pos.height <= 0) return null;
                    
                    const subject = subjects.find(s => s.id === task.subjectId);
                    const bgColor = subject?.colorCode ? subject.colorCode.replace('0.15', '0.08') : '#f8fafc'; // Extra light pastel
                    const textColor = subject?.textColor || '#475569';

                    return (
                      <motion.div
                        key={task.id}
                        onDoubleClick={() => {
                          const originalTask = flexibleTasks.find(ft => ft.id === task.taskId);
                          if (originalTask) {
                            setEditingTask({ type: 'flexible', data: originalTask });
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute left-1.5 right-1.5 rounded-[18px] shadow-sm flex flex-col justify-start overflow-hidden z-30 cursor-pointer"
                        style={{ 
                          top: `${pos.top}px`, 
                          height: `${pos.height}px`, 
                          backgroundColor: bgColor,
                          padding: '10px'
                        }}
                      >
                        <h3 className="font-bold text-[11px] leading-tight tracking-tight" style={{ color: textColor }}>{task.title}</h3>
                      </motion.div>
                    );
                  })}

                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EditTaskModal 
        editingTask={editingTask}
        subjects={subjects}
        onClose={() => setEditingTask(null)}
      />

    </div>
  );
}
