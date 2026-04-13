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
    <div className="flex flex-col min-h-screen bg-[#121212] font-sans pb-16 text-zinc-100">
      <header className="w-full max-w-[1200px] mx-auto pt-10 pb-6 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
          
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-4">
              AboCal
            </h1>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2.5 bg-white/5 pl-2 pr-3 py-1.5 rounded-full border border-white/10" title={isConnected ? "Homelab erreichbar" : "Homelab Offline"}>
              <div className="relative flex h-2 w-2 ml-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
              </div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mt-[1px]">Homelab</span>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl shadow-inner mr-2 md:mr-4 border border-white/5">
              <Link 
                href={`/?w=${offset - 1}`} 
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Vorherige Woche"
              >
                &larr;
              </Link>
              <div className="px-3 py-1.5 min-w-[90px] text-center text-sm font-medium text-emerald-400">
                {offset === 0 ? "Aktuell" : offset > 0 ? `+${offset} Woche` : `${offset} Woche`}
              </div>
              <Link 
                href={`/?w=${offset + 1}`} 
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Nächste Woche"
              >
                &rarr;
              </Link>
            </div>

            {isConnected && <TaskFormModal subjects={subjects} />}
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
