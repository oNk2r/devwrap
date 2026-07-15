import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-black text-zinc-400 font-mono flex items-center justify-center p-4">
      {/* Subtle scanline background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

      <div className="w-full max-w-md border border-zinc-800 rounded-lg bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center space-x-2 px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="text-[10px] text-zinc-500 font-semibold select-none pl-2">devwrap // shell-error</span>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-red-500 tracking-wider">404</h1>
            <p className="text-zinc-300 font-bold uppercase text-xs tracking-widest">
              ERR_MODULE_NOT_FOUND
            </p>
          </div>

          <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
            The requested terminal sub-route does not exist or has not been loaded into the active runtime kernel cache memory.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1.5 px-4 py-2 border border-zinc-700 hover:border-emerald-500 hover:text-emerald-400 text-xs font-semibold rounded transition-colors bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>$ cd .. [ Go Home ]</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-2 bg-zinc-950 border-t border-zinc-800/50 text-[9px] text-zinc-700 text-right">
          EXIT_CODE: 0x00000104
        </div>
      </div>
    </main>
  );
}
