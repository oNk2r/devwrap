import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import useProfileStore from '../store/profileStore';
import type { DevWrapResult } from '../types/github';

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

const DEV_TIPS = [
  "Did you know? Consistent 20-minute daily coding builds stronger neural pathways than weekend marathons.",
  "Coffee is just a mechanism for turning caffeine into pull requests.",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
  "Analyzing your language diversity and stars balance...",
  "Synthesizing your AI cognitive archetype and skill matrix...",
];

export default function Loading() {
  const navigate = useNavigate();
  const username = useProfileStore((s) => s.username);
  const logs = useProfileStore((s) => s.logs);
  const error = useProfileStore((s) => s.error);
  const addLog = useProfileStore((s) => s.addLog);
  const clearLogs = useProfileStore((s) => s.clearLogs);
  const setProfileData = useProfileStore((s) => s.setProfileData);
  const setError = useProfileStore((s) => s.setError);
  const reset = useProfileStore((s) => s.reset);

  const [progress, setProgress] = useState(15);
  const [tipIndex, setTipIndex] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  // Rotate tips
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % DEV_TIPS.length);
    }, 3500);
    return () => clearInterval(tipTimer);
  }, []);

  useEffect(() => {
    if (!username) return;

    queueMicrotask(() => {
      clearLogs();
      setError(null);
      setProfileData(null);
    });

    const streamUrl = `${API_BASE_URL}/api/github/${encodeURIComponent(username)}`;
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'log') {
          addLog(payload.message);
          setProgress((prev) => Math.min(92, prev + 12));
        } else if (payload.type === 'data') {
          const result: DevWrapResult = {
            profile: payload.profile,
            repositories: payload.repositories,
            stats: payload.stats,
            heatmap: payload.heatmap,
            aiSummary: payload.aiSummary,
            archetype: payload.archetype,
            archetypeSentence: payload.archetypeSentence
          };
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setProgress(100);
          setProfileData(result);
          es.close();

          setTimeout(() => {
            navigate(`/user/${encodeURIComponent(username)}`, { replace: true });
          }, 350);
        } else if (payload.type === 'error') {
          setError(payload.message);
          addLog(payload.message);
          es.close();
        }
      } catch {
        setError('Failed parsing API stream response');
        addLog(`ERROR: Malformed event stream received.`);
        es.close();
      }
    };

    es.onerror = () => {
      setError('Connection with API gateway lost. Make sure the backend server is running on port 5000.');
      addLog(`ERROR: Connection with DevWrap API lost.`);
      es.close();
    };

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 3 : prev));
    }, 120);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [username, addLog, setError, setProfileData, clearLogs, navigate]);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleBack = () => {
    reset();
    navigate('/');
  };

  return (
    <main className="min-h-screen neo-grid-bg text-neutral-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-black border-dashed">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00F5A0] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-tight">Unwrapping @{username}</h2>
              <span className="text-xs text-neutral-500 font-mono">Compiling Developer Recap</span>
            </div>
          </div>

          <span className="neo-badge bg-[#FFDE59] text-black">
            {progress}%
          </span>
        </div>

        {error ? (
          /* Error State */
          <div className="space-y-4 py-2">
            <div className="p-4 bg-red-50 border-2 border-red-500 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-red-900 mb-1">Failed to Fetch Profile</h4>
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleBack}
                className="neo-btn bg-white px-4 py-2 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Try Another Username</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="neo-btn neo-btn-primary px-4 py-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Loading State */
          <div className="space-y-5">
            {/* Progress Bar */}
            <div>
              <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden border-2 border-black p-0.5 shadow-[2px_2px_0px_#000]">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#00F5A0] via-[#38BDF8] to-[#FFDE59]"
                />
              </div>
            </div>

            {/* Live Streaming Log Terminal */}
            <div className="bg-[#FAF8F5] border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-500 border-b border-black/10 pb-2 mb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Pipeline Live Stream</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Active</span>
                </span>
              </div>

              <div className="h-32 overflow-y-auto font-mono text-xs space-y-1.5 pr-1">
                {logs.length === 0 ? (
                  <p className="text-neutral-400 italic">Initiating GitHub GraphQL & REST connection...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-1.5 text-neutral-800">
                      <span className="text-[#00F5A0] font-black">✓</span>
                      <span className="leading-tight">{log}</span>
                    </div>
                  ))
                )}
                <div ref={consoleBottomRef} />
              </div>
            </div>

            {/* Rotating Tip */}
            <div className="p-3 bg-neutral-50 border border-black/30 rounded-xl flex items-center gap-2.5 text-xs text-neutral-600">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="line-clamp-2 italic font-medium">"{DEV_TIPS[tipIndex]}"</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleBack}
                className="neo-btn bg-white px-3.5 py-1.5 text-xs text-neutral-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <span className="text-[11px] font-mono text-neutral-500 font-bold">
                Fetching Repositories & Heatmap...
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
