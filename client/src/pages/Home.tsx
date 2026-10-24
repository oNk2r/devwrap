import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import useProfileStore from '../store/profileStore';

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const POPULAR_DEVS = [
  { username: 'torvalds', label: 'Linus Torvalds' },
  { username: 'shadcn', label: 'shadcn' },
  { username: 'leerob', label: 'Lee Robinson' },
  { username: 'gaearon', label: 'Dan Abramov' },
  { username: 'yyx990803', label: 'Evan You' },
];

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

  const handleQuickSelect = (user: string) => {
    setInputVal(user);
    resetStore();
    setUsername(user);
    navigate(`/loading`);
  };

  return (
    <main className="min-h-screen neo-grid-bg text-neutral-900 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFDE59] border-2 border-black shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center font-black text-xl select-none">
            ⚡
          </div>
          <span className="font-extrabold text-xl tracking-tight text-neutral-900 leading-none">
            DevWrap
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="neo-badge bg-[#00F5A0] text-black">
            <Sparkles className="w-3 h-3 text-black" />
            2026 Edition
          </span>
          <a
            href="https://github.com/oNk2r/devwrap"
            target="_blank"
            rel="noreferrer"
            className="neo-btn bg-white px-3.5 py-1.5 text-xs"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-3xl w-full mx-auto my-auto flex flex-col items-center text-center py-8 sm:py-16">
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 leading-[1.1] mb-4"
        >
          Unwrap Your Real{' '}
          <span className="relative inline-block bg-[#00F5A0] px-3 py-0.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] transform -rotate-1">
            Developer Story
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-neutral-600 max-w-lg mb-8 leading-relaxed font-medium"
        >
          Instant GitHub analytics, skill matrix, and developer archetype recap.
        </motion.p>

        {/* Search Input Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-lg bg-white border-[2.5px] border-black rounded-2xl p-2.5 shadow-[5px_5px_0px_#000] mb-5"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full flex items-center px-3 py-2.5 bg-neutral-100 border-2 border-black rounded-xl">
              <span className="font-mono text-xs font-bold text-neutral-500 mr-1 select-none">
                github.com/
              </span>
              <input
                type="text"
                placeholder="username"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoFocus
                autoComplete="off"
                spellCheck="false"
                className="flex-1 bg-transparent border-none text-neutral-900 placeholder-neutral-400 outline-none text-sm font-bold font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto neo-btn neo-btn-primary px-6 py-2.5 text-sm shrink-0"
            >
              <span>Unwrap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>

        {/* Popular Dev Quick Starts */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_DEVS.map((dev) => (
            <button
              key={dev.username}
              onClick={() => handleQuickSelect(dev.username)}
              className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0 active:shadow-none transition-all cursor-pointer"
            >
              @{dev.username}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto flex items-center justify-between pt-4 border-t border-black/10 text-xs text-neutral-500 font-mono">
        <span>DevWrap © 2026</span>
        <span>Clean Neo-Brutalist Analytics</span>
      </footer>
    </main>
  );
}