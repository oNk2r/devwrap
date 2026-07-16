import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useProfileStore from '../store/profileStore';

export default function Home() {
  const [inputVal, setInputVal] = useState('');
  const setUsername = useProfileStore((state) => state.setUsername);
  const resetStore = useProfileStore((state) => state.reset);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = inputVal.trim();
    if (!cleanUsername) return;

    resetStore();
    setUsername(cleanUsername);
    navigate(`/loading`);
  };

  return (
    <main className="min-h-screen bg-[#090909] text-neutral-400 font-mono flex items-center justify-center p-4 selection:bg-[#9FE870]/20 selection:text-[#9FE870] relative scanlines">
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg rounded-2xl os-window overflow-hidden flex flex-col fade-in"
      >
        {/* macOS Window Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a] select-none">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
          </div>
          <span className="text-[11px] text-neutral-500 tracking-wider">
            devwrap // init
          </span>
          <div className="w-12" />
        </div>

        {/* Console Box */}
        <div className="p-8 space-y-6 bg-[#0d0d0d]">
          {/* Prompt line */}
          <div className="space-y-2 text-xs leading-relaxed">
            <div className="flex items-center space-x-2 text-[#9FE870]">
              <span>$</span>
              <span className="cursor-blink">devwrap --init</span>
            </div>
            <p className="text-neutral-500 font-sans max-w-sm">
              An operating system built for developers to mount their analytical dashboard environment.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center space-x-2 border border-[#1a1a1a] bg-[#090909] px-4 py-3 rounded-xl focus-within:border-[#9FE870] transition-all">
              <span className="text-neutral-600 text-xs select-none">github.com/</span>
              <input
                type="text"
                placeholder="username"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoFocus
                autoComplete="off"
                spellCheck="false"
                className="flex-1 bg-transparent border-none text-[#9FE870] placeholder-neutral-700 outline-none text-xs font-mono"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 border border-[#1a1a1a] hover:border-[#9FE870] text-[#9FE870] bg-[#0d0d0d] text-xs font-medium rounded-xl transition-all cursor-pointer select-none uppercase tracking-wide"
              >
                Compile
              </button>
            </div>
          </form>
        </div>

        {/* VS Code Style Status Bar */}
        <div className="px-6 py-2.5 bg-[#090909] border-t border-[#1a1a1a] flex justify-between text-[9px] text-neutral-500 tracking-widest uppercase select-none">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#9FE870]" />
              connected
            </span>
            <span>github api</span>
          </div>
          <span>v1.0</span>
        </div>
      </motion.div>
    </main>
  );
}