import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useProfileStore from '../store/profileStore';

export default function Home() {
  const [inputVal, setInputVal] = useState('');
  const setUsername = useProfileStore((state) => state.setUsername);
  const resetStore = useProfileStore((state) => state.reset);
  const navigate = useNavigate();

  useEffect(() => {
    resetStore();
  }, [resetStore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = inputVal.trim();
    if (!cleanUsername) return;

    resetStore();
    setUsername(cleanUsername);
    navigate(`/loading`);
  };

  return (
    <main className="min-h-screen bg-[#E3E3E3] text-black font-mono flex items-center justify-center p-4 selection:bg-black selection:text-white relative crt-screen">
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
        className="w-full max-w-lg bg-[#E3E3E3] border-4 border-double border-black p-1 shadow-[6px_6px_0px_#000000] relative z-10 rounded-none"
      >
        {/* Double Frame bezel container */}
        <div className="border border-black p-6 space-y-6">
          {/* Workstation Header */}
          <div className="text-center space-y-2 select-none">
            <h1 className="text-3xl font-extrabold tracking-widest uppercase font-heading">
              * D E V W R A P *
            </h1>
            <p className="text-xs uppercase tracking-widest border-b border-black border-dashed pb-3">
              Monochrome Workstation v1.2.83
            </p>
          </div>

          {/* Console Details / Info Box */}
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <p className="font-bold">SYSTEM STATUS: READY</p>
              <p>MEM FREE: 512 KB</p>
              <p>STORAGE: FLOPPY DRIVE A: (ONLINE)</p>
            </div>
            <div className="border border-black p-3 bg-white/50 text-[11px] leading-relaxed rounded-none">
              <p className="font-bold mb-1">--- NOTICE ---</p>
              <p>
                PROVIDE YOUR GITHUB IDENTIFIER (USERNAME) TO COMPILE A FULL SYSTEM RECAP AND PROFILE TRAIT DIAGNOSTICS.
              </p>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border border-black bg-white px-3 py-2 flex items-center rounded-none">
              <span className="text-neutral-500 text-xs font-bold mr-1 select-none">github.com/</span>
              <input
                type="text"
                placeholder="username"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoFocus
                autoComplete="off"
                spellCheck="false"
                className="flex-1 bg-transparent border-none text-black placeholder-neutral-400 outline-none text-xs font-mono"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-neutral-600 font-bold uppercase select-none">
                SYS.REQ // PORT 5000
              </span>
              <button
                type="submit"
                className="px-6 py-2 btn-retro text-xs rounded-none"
              >
                Compile Traits ▶
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}