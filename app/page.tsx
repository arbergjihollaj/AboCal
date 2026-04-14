import Link from 'next/link';
import CalendarView from '../src/components/CalendarView';
import TaskFormModal from '../src/components/TaskFormModal';
import { generateDynamicSchedule } from '../src/utils/scheduler';
import prisma from '../src/lib/prisma';
import { dummyPrefs } from '../src/data/mockData';
import { StaticEvent, FlexibleTask, Subject } from '../src/types';

export const revalidate = 0; // Ensure fresh data on nav or reload

function getMonday(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 is Sunday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(date.setDate(diff));
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

export default async function Home(props: { searchParams: Promise<{ w?: string }> }) {
  const searchParams = await props.searchParams;
  const offset = parseInt(searchParams.w || '0', 10);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (offset * 7));
  const weekStartMonday = getMonday(targetDate);

  let isConnected = false;
  let staticEvents: StaticEvent[] = [];
  let flexibleTasks: FlexibleTask[] = [];
  let subjects: Subject[] = [];
  let scheduledTasks: any[] = [];

  try {
    // 1. Connectivity Ping
    await prisma.subject.count();
    isConnected = true;

    // 2. Data Fetch
    const dbStaticEvents = await prisma.staticEvent.findMany();
    const dbFlexibleTasks = await prisma.flexibleTask.findMany();
    const dbSubjects = await prisma.subject.findMany();

    staticEvents = dbStaticEvents.map(ev => ({
      id: ev.id,
      title: ev.title,
      startTime: ev.startTime,
      endTime: ev.endTime,
      isStatic: true,
      requiresTravelTime: ev.requiresTravelTime,
      subjectId: ev.subjectId
    }));

    flexibleTasks = dbFlexibleTasks.map(task => ({
      id: task.id,
      title: task.title,
      subjectId: task.subjectId,
      totalDurationMinutes: task.duration,
      deadline: task.deadline,
      priority: task.priority as 'high' | 'low',
      chunkingRules: {
        minChunkMinutes: task.minChunk,
        maxChunkMinutes: task.maxChunk
      }
    }));

    subjects = dbSubjects.map(s => ({
      id: s.id,
      name: s.name,
      colorCode: s.colorCode,
      textColor: s.textColor
    }));

    // 3. 7-Days Global Schedule Calculation
    scheduledTasks = generateDynamicSchedule(
      weekStartMonday, 
      staticEvents, 
      flexibleTasks, 
      dummyPrefs
    );
  } catch (error) {
    console.error("Datenbankverbindung fehlgeschlagen:", error);
    isConnected = false;
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans pb-16 text-slate-900">
      <header className="w-full max-w-[1400px] mx-auto pt-10 pb-8 px-4 lg:px-6 relative">
        {/* Top Header Row: Pfeil Links, KW Zentriert, Pfeil/Tools Rechts */}
        <div className="flex items-center justify-between mb-2">
          
          {/* Pfeil Zurück - Äußerster Rand Links */}
          <div className="flex items-center">
            <Link 
              href={`/?w=${offset - 1}`} 
              className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-500 hover:text-slate-900 hover:shadow-md transition-all flex items-center justify-center group"
              title="Vorherige Woche"
            >
              <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
            </Link>
          </div>

          {/* Mitte - KW */}
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              KW {getWeekNumber(weekStartMonday)}
            </h1>
            {/* Heute Button direkt unter der Headline */}
            <Link 
              href="/?w=0"
              className="mt-2 text-[11px] font-bold tracking-widest uppercase bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 px-4 py-1.5 rounded-full transition-colors"
            >
              Heute
            </Link>
          </div>

          {/* Pfeil Nächste - Äußerster Rand Rechts inkl Tools */}
          <div className="flex items-center gap-3">
             {/* Status Indicator Clean */}
             <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm" title={isConnected ? "Homelab erreichbar" : "Homelab Offline"}>
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </div>
            </div>

            {isConnected && <TaskFormModal subjects={subjects} />}

            <Link 
              href={`/?w=${offset + 1}`} 
              className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-500 hover:text-slate-900 hover:shadow-md transition-all flex items-center justify-center group"
              title="Nächste Woche"
            >
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

        </div>
      </header>
      
      <main className="w-full flex-1 px-4 lg:px-6 max-w-[1400px] mx-auto">
        <CalendarView 
          staticEvents={staticEvents}
          flexibleTasks={flexibleTasks}
          scheduledTasks={scheduledTasks}
          prefs={dummyPrefs}
          subjects={subjects}
          baseDate={weekStartMonday}
        />
      </main>
    </div>
  );
}
