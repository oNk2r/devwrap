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

    // Reset store and set the target username
    resetStore();
    setUsername(cleanUsername);
    
    // Navigate to loading page
    navigate(`/loading`);
  };

  return (
    <main className="min-h-screen bg-black text-zinc-400 font-mono flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      {/* Subtle background terminal grid/scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl border border-zinc-800 rounded-lg bg-zinc-900 shadow-2xl overflow-hidden"
      >
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-zinc-500 font-semibold select-none">devwrap // guest@terminal</span>
          <div className="w-12" /> {/* spacer */}
        </div>

        {/* Terminal Window Content */}
        <div className="p-6 space-y-6">
          {/* Welcome Messages */}
          <div className="space-y-2 text-sm text-zinc-300">
            <p className="text-zinc-500">DEVWRAP OS [Version 1.0.0]</p>
            <p className="text-zinc-500">(c) 2026 DevWrap. All rights reserved.</p>
            <br />
            <p className="text-emerald-400 font-semibold">
              $ devwrap --init
            </p>
            <p className="pl-4 border-l-2 border-zinc-800 text-zinc-400">
              Welcome to DevWrap, an interactive terminal environment designed to compile your annual developer fingerprint. Please specify a GitHub handle to mount the analytics engine.
            </p>
          </div>

          {/* Form Prompts */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <span className="text-emerald-500 select-none">$</span>
              <span className="text-zinc-300 select-none">fetch --user</span>
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="github_username"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full bg-transparent border-b border-dashed border-zinc-700 focus:border-emerald-500 text-emerald-400 placeholder-zinc-700 outline-none pb-0.5 transition-colors font-mono"
                />
                {inputVal === '' && (
                  <span className="absolute left-0 w-2 h-4 bg-emerald-500/80 animate-pulse ml-0.5 select-none" />
                )}
              </div>
            </div>

            {/* Execute Button */}
            <div className="flex justify-end pt-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded text-sm uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                Execute Analysis
              </motion.button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-800/50 flex justify-between text-[10px] text-zinc-600">
          <span>STATUS: STANDBY</span>
          <span>PORT: 5000</span>
          <span>ESC TO CLEAR</span>
        </div>
      </motion.div>
    </main>
  );
}