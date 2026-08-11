import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfileStore from '../store/profileStore';
import type { DevWrapResult } from '../types/github';

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

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

  const [progress, setProgress] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

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
          }, 150);
        } else if (payload.type === 'error') {
          setError(payload.message);
          addLog(payload.message);
          es.close();
        }
      } catch {
        setError('Failed parsing socket event stream');
        addLog(`ERROR: Malformed data stream received.`);
        es.close();
      }
    };

    es.onerror = () => {
      setError('Connection with API stream lost');
      addLog(`ERROR: Connection with DevWrap API gateway lost.`);
      es.close();
    };

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => (prev < 96 ? prev + 8 : prev));
    }, 40);

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
    <main className="min-h-screen bg-[#090909] text-neutral-400 font-mono flex items-center justify-center p-4 selection:bg-[#9FE870]/20 selection:text-[#9FE870] relative scanlines">
      
      <div className="w-full max-w-lg rounded-2xl os-window overflow-hidden flex flex-col fade-in">
        {/* macOS Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a] select-none">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
          </div>
          <span className="text-[11px] text-neutral-500 tracking-wider">
            devwrap // setup
          </span>
          <div className="w-12" />
        </div>

        {/* Content Box */}
        <div className="p-8 space-y-6 bg-[#0d0d0d] min-h-[300px] flex flex-col justify-between">
          
          {/* Scrollable Logs Output */}
          <div className="flex-1 space-y-2 text-xs overflow-y-auto max-h-[180px] pr-2 bg-[#090909] border border-[#1a1a1a] rounded-xl p-4 font-mono">
            <p className="text-neutral-600">Initializing DevWrap virtual environment...</p>
            {logs.map((log, index) => {
              const isError = log.startsWith('ERROR:') || log.includes('error') || log.includes('Failed');
              const isSuccess = log.startsWith('✓');
              let textColor = 'text-neutral-400';
              if (isError) textColor = 'text-rose-500';
              else if (isSuccess) textColor = 'text-[#9FE870]';
              else if (log.startsWith('$')) textColor = 'text-[#9FE870]';

              return (
                <p key={index} className={`${textColor} leading-relaxed`}>
                  {log}
                </p>
              );
            })}
            <div ref={consoleBottomRef} />
          </div>

          {/* Progress Indicator and Controls */}
          <div className="space-y-4 pt-2">
            {error ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-[11px] text-rose-500 uppercase tracking-wider font-semibold">
                  Setup failed.
                </span>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-[#1a1a1a] hover:border-rose-500 text-rose-500 hover:bg-rose-500/5 font-medium rounded-xl text-xs transition-all cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            ) : (
              // Progress Bar
              <div className="space-y-2 select-none">
                <div className="flex justify-between text-[10px] text-neutral-500 font-semibold tracking-wider uppercase">
                  <span>compiling stream</span>
                  <span className="text-[#9FE870]">{progress}%</span>
                </div>
                <div className="w-full bg-[#090909] rounded-full h-1.5 overflow-hidden border border-[#1a1a1a]">
                  <div 
                    className="bg-[#9FE870] h-full transition-all duration-150 rounded-full" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-2.5 bg-[#090909] border-t border-[#1a1a1a] flex justify-between text-[9px] text-neutral-500 tracking-widest uppercase select-none font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#9FE870]" />
              compiling
            </span>
            <span>sse gateway</span>
          </div>
          <span>v1.0</span>
        </div>
      </div>
    </main>
  );
}
