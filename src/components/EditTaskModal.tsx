"use client";

import React, { useState, useEffect } from 'react';
import { Subject, StaticEvent, FlexibleTask } from '../types';
import { updateFlexibleTask, deleteFlexibleTask, updateStaticEvent, deleteStaticEvent } from '../../app/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface EditTaskModalProps {
  editingTask: {
    type: 'static' | 'flexible';
    data: StaticEvent | FlexibleTask;
  } | null;
  subjects: Subject[];
  onClose: () => void;
}

export default function EditTaskModal({ editingTask, subjects, onClose }: EditTaskModalProps) {
  const [isPending, setIsPending] = useState(false);

  if (!editingTask) return null;

  const { type, data } = editingTask;

  // Type Guards for easier access
  const isFlexible = type === 'flexible';
  const flexData = isFlexible ? (data as FlexibleTask) : null;
  const staticData = !isFlexible ? (data as StaticEvent) : null;

  // Format Dates
  const getFormattedDate = (d: Date) => {
    const dateObj = new Date(d);
    return dateObj.toISOString().split('T')[0];
  };

  const getFormattedTime = (d: Date) => {
    const dateObj = new Date(d);
    return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (isFlexible) {
        await updateFlexibleTask(data.id, formData);
      } else {
        await updateStaticEvent(data.id, formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Es gab einen Fehler beim Aktualisieren.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Soll dieser Eintrag wirklich gelöscht werden?")) return;
    
    setIsPending(true);
    try {
      if (isFlexible) {
        await deleteFlexibleTask(data.id);
      } else {
        await deleteStaticEvent(data.id);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Es gab einen Fehler beim Löschen.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        key="edit-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div 
          key="edit-modal-content"
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-[#121826] rounded-[24px] sm:rounded-[28px] shadow-2xl w-full max-w-lg p-5 sm:p-7 border border-white/10 text-zinc-100 relative"
        >
          <div className="flex justify-between items-center mb-5 sm:mb-6">
            <h3 className="text-xl font-medium tracking-tight">Eintrag bearbeiten</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Titel</label>
              <input 
                type="text" 
                name="title" 
                required 
                defaultValue={data.title}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white placeholder-zinc-600"
              />
            </div>

            {isFlexible && flexData ? (
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
                      defaultValue={flexData.totalDurationMinutes}
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Deadline</label>
                    <input 
                      type="date" 
                      name="deadline" 
                      required 
                      defaultValue={getFormattedDate(flexData.deadline)}
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
                        defaultValue={flexData.priority}
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
                        defaultValue={flexData.subjectId || 'none'}
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
            ) : staticData ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Datum</label>
                  <input 
                    type="date" 
                    name="date" 
                    required 
                    defaultValue={getFormattedDate(staticData.startTime)}
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
                      defaultValue={getFormattedTime(staticData.startTime)}
                      className="w-full px-4 pt-6 pb-2 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white [color-scheme:dark]"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider ml-4 mt-2 absolute">Ende</label>
                    <input 
                      type="time" 
                      name="endTime" 
                      required 
                      defaultValue={getFormattedTime(staticData.endTime)}
                      className="w-full px-4 pt-6 pb-2 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Fach (Optional)</label>
                  <div className="relative">
                    <select 
                      name="subjectId" 
                      defaultValue={staticData.subjectId || 'none'}
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
                       <input 
                         type="checkbox" 
                         name="requiresTravelTime" 
                         value="true" 
                         defaultChecked={staticData.requiresTravelTime}
                         className="w-5 h-5 rounded border border-white/20 bg-white/5 accent-emerald-500 cursor-pointer" 
                       />
                       <span className="text-sm font-medium text-zinc-300">Reisezeit einplanen (1 Stunde)</span>
                    </label>
                </div>
              </>
            ) : null}

            <div className="mt-4 pt-5 border-t border-white/10 flex justify-between items-center">
              <button 
                type="button" 
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-full font-medium transition-all text-sm disabled:opacity-50"
              >
                Löschen
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-semibold transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isPending ? "Speichern..." : "Aktualisieren"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
