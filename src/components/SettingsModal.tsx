"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 transition-colors"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md min-h-[250px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl z-50 flex flex-col gap-8 justify-between"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">Einstellungen</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="font-semibold text-base text-slate-700 dark:text-zinc-200">Erscheinungsbild</span>
                
                {/* Theme Toggle (Segmented Control Style) */}
                <button 
                  onClick={toggleTheme}
                  className="relative flex items-center w-[140px] h-12 bg-slate-200 dark:bg-black/50 rounded-full p-1"
                >
                  <div className="flex-1 text-center z-10 text-[13px] font-bold text-slate-700 dark:text-zinc-400">Light</div>
                  <div className="flex-1 text-center z-10 text-[13px] font-bold text-slate-500 dark:text-zinc-100">Dark</div>
                  
                  {/* Sliding pill */}
                  <motion.div 
                    layout
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-[#2C2C2E] rounded-full shadow-sm"
                    animate={{ left: isDark ? 'auto' : '4px', right: isDark ? '4px' : 'auto' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Placholder for future settings */}
              <div className="text-center text-xs text-slate-400 dark:text-zinc-500 mt-2">
                AboCal v1.1 - Smart Scheduler
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
