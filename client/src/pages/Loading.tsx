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
          }, 400); // slightly longer delay for full 80s immersive experience
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
      setProgress((prev) => (prev < 96 ? prev + 4 : prev));
    }, 80);

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

  // Character progress bar calculation: 20 blocks total
  const totalBlocks = 20;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);
  const characterProgressBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <main className="min-h-screen bg-[#E3E3E3] text-black font-mono flex items-center justify-center p-4 selection:bg-black selection:text-white relative crt-screen">
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      <div className="w-full max-w-lg bg-[#E3E3E3] border-4 border-double border-black p-1 shadow-[6px_6px_0px_#000000] relative z-10 rounded-none">
        
        {/* Double Frame bezel container */}
        <div className="border border-black p-6 space-y-6">
          
          {/* Header */}
          <div className="text-center select-none">
            <h1 className="text-2xl font-bold tracking-widest font-heading uppercase">
              * PROGRAM LOADER *
            </h1>
            <p className="text-[11px] uppercase tracking-wider border-b border-black border-dashed pb-3">
              Compiling DevWrap User: {username}
            </p>
          </div>

          {error ? (
            /* Fatal System Error Panel */
            <div className="space-y-4">
              <div className="border-2 border-black p-4 bg-black text-white rounded-none">
                <p className="font-bold text-center tracking-widest mb-2 font-heading text-lg">
                  *** FATAL SYSTEM ERROR ***
                </p>
                <p className="text-xs text-center">
                  DIAGNOSTIC FAULT DETECTED DURING USER RECORD FETCH
                </p>
              </div>

              <div className="border border-black p-3 bg-white/50 text-xs min-h-[80px] font-mono leading-relaxed rounded-none">
                <p className="font-bold uppercase text-[10px] text-neutral-600 mb-1">Error Dump:</p>
                <p>{error}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 btn-retro text-xs rounded-none"
                >
                  ◀ Main Menu
                </button>
              </div>
            </div>
          ) : (
            /* Standard Loading Progress Panel */
            <div className="space-y-5">
              <div className="space-y-1 text-xs select-none">
                <p className="font-bold uppercase">TRACKING STATUS: READING SECTORS</p>
                <p>SECTOR ADDR: 0x{progress.toString(16).toUpperCase()}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-mono text-[11px] font-bold tracking-wider">
                    [{characterProgressBar}]
                  </span>
                  <span className="font-bold">{progress}%</span>
                </div>
              </div>

              {/* Scrollable Logs Output */}
              <div className="space-y-1.5 text-xs overflow-y-auto h-[140px] pr-2 bg-white/80 border border-black p-3 font-mono rounded-none">
                <p className="text-neutral-500">// Initiating workstation pipeline...</p>
                {logs.map((log, index) => {
                  const isError = log.startsWith('ERROR:') || log.includes('error') || log.includes('Failed');
                  const isSuccess = log.startsWith('✓');
                  let prefix = '> ';
                  if (log.startsWith('$')) {
                    prefix = '';
                  }
                  
                  return (
                    <p key={index} className={`${isError ? 'text-red-600 font-bold' : isSuccess ? 'text-black font-bold' : 'text-neutral-800'} leading-normal`}>
                      {prefix}{log}
                    </p>
                  );
                })}
                <div ref={consoleBottomRef} />
              </div>

              {/* Loader Status Bar */}
              <div className="pt-2 border-t border-black border-dashed flex justify-between text-[9px] text-neutral-600 tracking-wider uppercase select-none">
                <span>PORT: 5000</span>
                <span>BAUD: 9600</span>
                <span>SYS_OP LOGGED IN</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
