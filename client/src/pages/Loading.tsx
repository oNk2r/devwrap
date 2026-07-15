import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfileStore from '../store/profileStore';
import type { DevWrapResult } from '../types/github';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Loading() {
  const navigate = useNavigate();
  const { 
    username, 
    logs, 
    addLog, 
    clearLogs, 
    setProfileData, 
    setError, 
    error,
    reset 
  } = useProfileStore();

  const [progress, setProgress] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [fetchedData, setFetchedData] = useState<DevWrapResult | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  // Redirect to home if no username is present
  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  // Handle EventSource connection and progress animation
  useEffect(() => {
    if (!username) return;

    // Reset local/global state for fresh load
    clearLogs();
    setError(null);
    setProfileData(null);
    setProgress(0);
    setApiDone(false);
    setFetchedData(null);

    // 1. Establish EventSource connection
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
            stats: payload.stats
          };
          setFetchedData(result);
          setApiDone(true);
          es.close();
        } else if (payload.type === 'error') {
          setError(payload.message);
          addLog(payload.message);
          es.close();
        }
      } catch (err: any) {
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

    // 2. Start progress animation in parallel (0 to 100)
    // Runs over 2.5 seconds (25 ticks of 100ms, incrementing 4% each tick)
    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev < 96) {
          return prev + 4;
        } else if (prev === 96) {
          // If we reach 96% and the API isn't done yet, wait
          return prev;
        }
        return prev;
      });
    }, 100);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [username, addLog, setError, setProfileData, clearLogs]);

  // Synchronizer: Check if both API is done and Progress has finished (or almost finished)
  useEffect(() => {
    if (apiDone && fetchedData) {
      // Complete the remaining progress bar and navigate
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      setProgress(100);
      setProfileData(fetchedData);
      
      const timeout = setTimeout(() => {
        navigate(`/user/${encodeURIComponent(username || '')}`);
      }, 500); // short delay to show 100% completion

      return () => clearTimeout(timeout);
    }
  }, [apiDone, fetchedData, navigate, setProfileData, username]);

  // Auto-scroll terminal log console to bottom as logs print
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Calculate terminal block characters for progress bar
  const blockCount = Math.floor(progress / 5);
  const progressBarText = '█'.repeat(blockCount) + '░'.repeat(20 - blockCount);

  const handleBack = () => {
    reset();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-black text-zinc-400 font-mono flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      {/* Subtle scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

      <div className="w-full max-w-2xl border border-zinc-800 rounded-lg bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-zinc-500 font-semibold select-none">devwrap // stream-shell</span>
          <div className="w-12" />
        </div>

        {/* Terminal Window Content */}
        <div className="p-6 space-y-6 min-h-[300px] flex flex-col justify-between">
          
          {/* Scrollable Logs Output */}
          <div className="flex-1 space-y-2 text-xs md:text-sm overflow-y-auto max-h-[220px] pr-2">
            <p className="text-zinc-500">Initializing DevWrap virtual environment...</p>
            {logs.map((log, index) => {
              const isError = log.startsWith('ERROR:') || log.includes('error') || log.includes('Failed');
              const isSuccess = log.startsWith('✓');
              let textColor = 'text-zinc-300';
              if (isError) textColor = 'text-red-400 font-semibold';
              else if (isSuccess) textColor = 'text-emerald-400 font-semibold';
              else if (log.startsWith('$')) textColor = 'text-emerald-500';

              return (
                <p key={index} className={`${textColor} leading-relaxed`}>
                  {log}
                </p>
              );
            })}
            <div ref={consoleBottomRef} />
          </div>

          {/* Progress Indicator and Controls */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/50">
            {error ? (
              // Error Controls
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="text-xs text-red-500 font-bold uppercase tracking-wider">
                  Process exited with non-zero code.
                </span>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500/10 font-bold rounded text-xs transition-colors self-start cursor-pointer"
                >
                  $ cd .. [ Go Back ]
                </button>
              </div>
            ) : (
              // Progress Bar
              <div className="space-y-1.5 select-none">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>COMPILING DATA STREAM</span>
                  <span>{progress}%</span>
                </div>
                <div className="text-sm md:text-base text-emerald-500 flex font-semibold font-mono tracking-tight overflow-hidden">
                  <span>[{progressBarText}]</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-800/50 flex justify-between text-[10px] text-zinc-600">
          <span>TASK: COMPILER_INIT</span>
          <span>SSE: ACTIVE</span>
          <span>PID: {Math.floor(Math.random() * 9000 + 1000)}</span>
        </div>
      </div>
    </main>
  );
}
