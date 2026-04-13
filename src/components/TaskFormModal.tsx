"use client";

import React, { useState } from 'react';
import { Subject } from '../types';
import { createFlexibleTask, createStaticEvent } from '../../app/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskFormModalProps {
  subjects: Subject[];
}

export default function TaskFormModal({ subjects }: TaskFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [mode, setMode] = useState<'static' | 'flexible'>('static');
  
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (mode === 'flexible') {
        await createFlexibleTask(formData);
      } else {
        await createStaticEvent(formData);
      }
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("Es gab einen Fehler beim Speichern.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button 
        title="Termin / Aufgabe hinzufügen"
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95 shadow-sm backdrop-blur-sm"
      >
        <span className="text-xl leading-none font-light mb-0.5">+</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-[#121826] rounded-[24px] sm:rounded-[28px] shadow-2xl w-full max-w-lg p-5 sm:p-7 border border-white/10 text-zinc-100"
            >
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h3 className="text-xl font-medium tracking-tight">Eintrag erstellen</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Toggle Switch */}
              <div className="flex bg-white/5 p-1 rounded-xl mb-6 shadow-inner">
                <button 
                   type="button"
                   onClick={() => setMode('static')}
                   className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${mode === 'static' ? 'bg-[#1F2937] text-white shadow-sm border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                   Fester Termin (Testat)
                </button>
                <button 
                   type="button"
                   onClick={() => setMode('flexible')}
                   className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${mode === 'flexible' ? 'bg-[#1F2937] text-white shadow-sm border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                   Flexible Aufgabe
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Titel</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    placeholder={mode === 'flexible' ? "z.B. Vokabeln lernen, Bio-Referat..." : "z.B. Testat, Praxis, Prüfung..."} 
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white placeholder-zinc-600"
                  />
                </div>

                {mode === 'flexible' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Dauer (Min)</label>
                        <input 
                          type="number" 
                          name="duration" 
                          required 
                          min="15"
                          step="15"
                          defaultValue="60"
                          className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Deadline</label>
                        <input 
                          type="date" 
                          name="deadline" 
                          required 
                          defaultValue={tomorrowStr}
                          className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Priorität</label>
                        <div className="relative">
                          <select 
                            name="priority" 
                            required 
                            defaultValue="high"
                            className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm appearance-none font-medium text-white"
                          >
                            <option value="high">Hoch</option>
                            <option value="low">Niedrig</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Welches Fach?</label>
                        <div className="relative">
                          <select 
                            name="subjectId" 
                            required 
                            className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm appearance-none font-medium text-white"
                          >
                            <option value="none">Allgemein (Kein Fach)</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Datum</label>
                      <input 
                        type="date" 
                        name="date" 
                        required 
                        defaultValue={tomorrowStr}
                        className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white [color-scheme:dark]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider ml-4 mt-2 absolute">Start</label>
                        <input 
                          type="time" 
                          name="startTime" 
                          required 
                          defaultValue="10:00"
                          className="w-full px-4 pt-6 pb-2 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white [color-scheme:dark]"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider ml-4 mt-2 absolute">Ende</label>
                        <input 
                          type="time" 
                          name="endTime" 
                          required 
                          defaultValue="11:30"
                          className="w-full px-4 pt-6 pb-2 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Fach (Optional)</label>
                      <div className="relative">
                        <select 
                          name="subjectId" 
                          className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm appearance-none font-medium text-white"
                        >
                          <option value="none">Allgemein (Kein Fach)</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                           <input type="checkbox" name="requiresTravelTime" value="true" className="w-5 h-5 rounded border border-white/20 bg-white/5 accent-emerald-500 cursor-pointer" />
                           <span className="text-sm font-medium text-zinc-300">Reisezeit einplanen (1 Stunde)</span>
                        </label>
                    </div>
                  </>
                )}

                <div className="mt-4 pt-5 border-t border-white/10 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-semibold transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPending ? "Speichern..." : "Hinzufügen"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
