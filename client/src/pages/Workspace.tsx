import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Star, GitFork, ArrowLeft } from 'lucide-react';
import useProfileStore from '../store/profileStore';

export default function Workspace() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profileData, setUsername, reset } = useProfileStore();

  // Redirect to loading if we refresh the page and don't have stored data
  useEffect(() => {
    if (!profileData && username) {
      setUsername(username);
      navigate('/loading');
    }
  }, [profileData, username, setUsername, navigate]);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">
        Re-connecting shell...
      </div>
    );
  }

  const { profile, repositories, stats } = profileData;

  const handleBack = () => {
    reset();
    navigate('/');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="min-h-screen bg-black text-zinc-400 font-mono p-4 md:p-8 flex flex-col items-center justify-center selection:bg-emerald-500 selection:text-black">
      {/* Subtle scanline background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

      {/* Main Terminal Shell container */}
      <div className="w-full max-w-5xl border border-zinc-800 rounded-lg bg-zinc-900 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-zinc-500 font-semibold select-none">
            devwrap // workspace // {profile.username}
          </span>
          
          {/* Back Action */}
          <button 
            onClick={handleBack}
            className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors bg-transparent border-0 outline-none cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>cd ..</span>
          </button>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800 min-h-[500px]">
          
          {/* Left Panel: Profile Detail */}
          <div className="w-full md:w-80 p-6 flex flex-col space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Profile Avatar */}
              <div className="relative group">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-36 h-36 rounded border border-zinc-700 bg-zinc-800 object-cover"
                />
                <div className="absolute inset-0 border border-emerald-500/0 group-hover:border-emerald-500/30 rounded pointer-events-none transition-colors" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-zinc-100">{profile.name}</h1>
                <p className="text-xs text-emerald-400">@{profile.username}</p>
              </div>
            </div>

            {/* Profile Bio */}
            <div className="border-t border-b border-zinc-800 py-4 text-xs md:text-sm text-zinc-400 leading-relaxed">
              <span className="text-zinc-600 block text-[10px] uppercase font-bold tracking-wider mb-1">
                Biography
              </span>
              <p>{profile.bio}</p>
            </div>

            {/* Profile Metrics */}
            <div className="space-y-3 text-xs">
              <span className="text-zinc-600 block text-[10px] uppercase font-bold tracking-wider">
                System Metadata
              </span>
              <div className="flex justify-between border-b border-dashed border-zinc-800 pb-1.5">
                <span className="text-zinc-500">FOLLOWERS:</span>
                <span className="text-zinc-200 font-semibold">{profile.followers}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-zinc-800 pb-1.5">
                <span className="text-zinc-500">FOLLOWING:</span>
                <span className="text-zinc-200 font-semibold">{profile.following}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-zinc-800 pb-1.5">
                <span className="text-zinc-500">REPOSITORIES:</span>
                <span className="text-zinc-200 font-semibold">{profile.publicRepos}</span>
              </div>
              <div className="flex justify-between pb-1.5">
                <span className="text-zinc-500">CREATED:</span>
                <span className="text-zinc-200 font-semibold">{formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {/* External link */}
            <div className="pt-2 flex-grow flex flex-col justify-end">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 border border-zinc-700 hover:border-emerald-500/50 hover:text-emerald-400 text-center text-xs font-semibold rounded transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>github.profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Panel: Source Repositories */}
          <div className="flex-1 flex flex-col">
            {/* Header banner */}
            <div className="px-6 py-4 bg-zinc-950/30 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                Source Repositories ({repositories.length})
              </span>
              
              {/* Stars & Forks Aggregated */}
              <div className="flex items-center space-x-4 text-xs font-semibold text-zinc-500 select-none">
                <div className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-zinc-600" />
                  <span>STARS: <span className="text-zinc-300">{stats.totalStars}</span></span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="w-3.5 h-3.5 text-zinc-600" />
                  <span>FORKS: <span className="text-zinc-300">{stats.totalForks}</span></span>
                </div>
              </div>
            </div>

            {/* Repositories Scroll List */}
            <div className="p-6 overflow-y-auto max-h-[500px] flex-1 space-y-4 pr-3">
              {repositories.length === 0 ? (
                <div className="text-zinc-600 text-sm italic py-12 text-center">
                  No source repositories found for this account.
                </div>
              ) : (
                repositories.map((repo, idx) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    className="border border-zinc-800 hover:border-zinc-700/80 rounded bg-zinc-950/20 p-4 transition-colors relative group"
                  >
                    {/* Header: Title and URL link */}
                    <div className="flex items-start justify-between">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-zinc-200 hover:text-emerald-400 transition-colors flex items-center space-x-1.5"
                      >
                        <span>{repo.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">
                        {formatDate(repo.updatedAt)}
                      </span>
                    </div>

                    {/* Body: Description */}
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {repo.description}
                    </p>

                    {/* Footer: Repo Language + Star + Fork */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900 text-[10px] text-zinc-500 font-semibold select-none">
                      <div className="flex items-center space-x-3">
                        {repo.language && (
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                            <span>{repo.language.toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-0.5">
                          <Star className="w-3 h-3 text-zinc-600" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center space-x-0.5">
                          <GitFork className="w-3 h-3 text-zinc-600" />
                          <span>{repo.forks}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Status Line Bar */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-800/50 flex justify-between text-[10px] text-zinc-600">
          <span>COMPILED SESSION: ACTIVE</span>
          <span>LANGS: {stats.topLanguages.slice(0, 3).map(l => l.language.toUpperCase()).join(' / ') || 'NONE'}</span>
          <span>SYS_OK</span>
        </div>
      </div>
    </main>
  );
}
