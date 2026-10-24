import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen neo-grid-bg text-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-[2.5px] border-black rounded-3xl p-8 shadow-[6px_6px_0px_#000] text-center space-y-6">
        <div className="w-16 h-16 bg-[#FFDE59] border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-[3px_3px_0px_#000]">
          🧭
        </div>

        <div className="space-y-2">
          <span className="neo-badge bg-[#FF6B6B] text-black">
            404 PAGE NOT FOUND
          </span>
          <h1 className="text-3xl font-black text-neutral-900">Lost in the Codebase</h1>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
            The profile or path you requested does not exist or has moved to an unindexed branch.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="neo-btn neo-btn-primary px-5 py-2.5 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </main>
  );
}
