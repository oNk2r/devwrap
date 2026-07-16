import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Star, GitFork, ArrowLeft, Calendar, BookOpen, Users, Download } from 'lucide-react';
import useProfileStore from '../store/profileStore';

export default function Workspace() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profileData, setUsername, reset } = useProfileStore();

  useEffect(() => {
    if (!profileData && username) {
      setUsername(username);
      navigate('/loading');
    }
  }, [profileData, username, setUsername, navigate]);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center text-neutral-500 font-mono gap-4 scanlines">
        <svg className="animate-spin h-6 w-6 text-[#9FE870]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[10px] tracking-widest uppercase font-semibold">re-connecting stream...</span>
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

  // Local fallbacks if backend AI fields are missing
  const primaryLang = stats.topLanguages[0]?.language || 'TypeScript';
  const defaultSummary = [
    primaryLang === 'TypeScript' || primaryLang === 'JavaScript'
      ? 'TypeScript became your strongest language for system builds.'
      : `You built consistently using ${primaryLang} for core projects.`,
    stats.totalStars > 50
      ? `Your open-source modules accumulated ${stats.totalStars} community stars.`
      : 'Your repositories demonstrate modular system structures.',
    `Open-source footprint dates back to ${new Date(profile.createdAt).getFullYear()}.`
  ];

  let defaultArchetype = 'THE BUILDER';
  let defaultArchetypeSentence = 'You create functional codebases, shipping clean repositories with clear layouts.';

  if (primaryLang === 'TypeScript' || primaryLang === 'JavaScript') {
    defaultArchetype = 'THE ARCHITECT';
    defaultArchetypeSentence = 'You construct high-scale web modules with precise type systems and modular interfaces.';
  } else if (primaryLang === 'Python') {
    defaultArchetype = 'THE ANALYST';
    defaultArchetypeSentence = 'You translate complex data loops and algorithms into automated pipeline scripts.';
  } else if (primaryLang === 'Rust' || primaryLang === 'Go' || primaryLang === 'C++') {
    defaultArchetype = 'THE SYSTEM BUILDER';
    defaultArchetypeSentence = 'You compile high-performance primitives, prioritizing memory safety and speed.';
  }

  const finalSummary = profileData.aiSummary || defaultSummary;
  const finalArchetype = profileData.archetype || defaultArchetype;
  const finalArchetypeSentence = profileData.archetypeSentence || defaultArchetypeSentence;

  const renderHeatmap = () => {
    const cols = 35;
    const rows = 7;
    const totalCells = cols * rows;
    const cells: number[] = [];
    
    for (let i = 0; i < totalCells; i++) {
      let level = 0;
      const rand = Math.sin(i * 0.15) + Math.cos(i * 0.05);
      if (rand > 1.2) level = 3;
      else if (rand > 0.6) level = 2;
      else if (rand > 0.0) level = 1;
      else level = 0;
      cells.push(level);
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl space-y-4 w-full">
        <div className="flex space-x-1 overflow-x-auto max-w-full pb-2 select-none">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col space-y-1">
              {Array.from({ length: rows }).map((_, rowIdx) => {
                const cellIdx = colIdx * rows + rowIdx;
                const level = cells[cellIdx];
                let bgClass = "bg-[#141414]";
                if (level === 1) bgClass = "bg-[#223912]";
                if (level === 2) bgClass = "bg-[#38661d]";
                if (level === 3) bgClass = "bg-[#9FE870]";
                
                return (
                  <div 
                    key={rowIdx} 
                    className={`w-2.5 h-2.5 rounded-sm ${bgClass} transition-colors duration-200 hover:border hover:border-neutral-500`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2 text-[9px] text-neutral-500 self-end pr-2 font-mono select-none">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#141414]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#223912]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#38661d]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#9FE870]" />
          <span>More</span>
        </div>
      </div>
    );
  };

  const renderArchetypeIllustration = (title: string) => {
    return (
      <svg className="w-12 h-12 text-[#9FE870]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        {title === 'THE ARCHITECT' && (
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          </>
        )}
        {title === 'THE ANALYST' && (
          <>
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </>
        )}
        {title === 'THE SYSTEM BUILDER' && (
          <>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </>
        )}
        {title === 'THE BUILDER' && (
          <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </>
        )}
      </svg>
    );
  };

  // Exporter to screenshot the recap window as a PNG
  const handleExport = () => {
    const node = document.getElementById('recap-window');
    if (!node) return;

    import('html-to-image').then((htmlToImage) => {
      htmlToImage.toPng(node, {
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: node.offsetWidth + 'px',
          height: node.offsetHeight + 'px'
        }
      })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `devwrap-${profile.username}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed generating png recap card:', err);
      });
    });
  };

  return (
    <main className="min-h-screen bg-[#090909] text-neutral-400 font-mono p-4 md:p-8 flex flex-col items-center justify-center selection:bg-[#9FE870]/20 selection:text-[#9FE870] relative overflow-hidden scanlines">
      
      {/* Centered Application Window */}
      <div id="recap-window" className="w-full max-w-5xl rounded-2xl os-window flex flex-col overflow-hidden relative z-10 fade-in">
        
        {/* Top Window Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a] select-none">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#262626] border border-[#1a1a1a]" />
          </div>
          <span className="text-[11px] text-neutral-500 tracking-wider">
            devwrap // workspace // {profile.username}
          </span>
          
          <button 
            onClick={handleBack}
            className="flex items-center space-x-1.5 text-[11px] text-neutral-500 hover:text-white transition-colors bg-transparent border-0 outline-none cursor-pointer font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>cd ..</span>
          </button>
        </div>

        {/* Workspace Layout Split */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#1a1a1a] min-h-[500px]">
          
          {/* LEFT SIDEBAR - Narrow, stacked */}
          <div className="w-full md:w-60 p-6 space-y-6 flex flex-col bg-[#0b0b0b] shrink-0 font-mono text-xs select-none">
            
            <div className="flex flex-col space-y-4">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-xl border border-[#1a1a1a] bg-[#090909] object-cover"
              />

              <div className="space-y-1">
                <h1 className="text-sm font-bold text-white m-0 tracking-tight leading-none">{profile.name}</h1>
                <p className="text-neutral-500 m-0">@{profile.username}</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-neutral-500 leading-relaxed m-0 font-sans border-t border-[#1a1a1a] pt-4">
                {profile.bio}
              </p>
            )}

            {/* Profile Statistics Stacked */}
            <div className="space-y-2 border-t border-[#1a1a1a] pt-4 text-[11px] text-neutral-400">
              <div className="flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-neutral-600" />
                <span>FOLLOWERS: <span className="text-white font-bold">{profile.followers}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-neutral-600" />
                <span>REPOSITORIES: <span className="text-white font-bold">{profile.publicRepos}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                <span>JOINED: <span className="text-white font-bold">{formatDate(profile.createdAt)}</span></span>
              </div>
            </div>

            {/* GitHub and Exporter Controls */}
            <div className="pt-2 flex-grow flex flex-col justify-end space-y-2">
              <button
                onClick={handleExport}
                className="w-full py-2 border border-[#1a1a1a] hover:border-[#9FE870] text-neutral-400 hover:text-[#9FE870] text-center text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 bg-transparent cursor-pointer"
              >
                <span>Export Recap</span>
                <Download className="w-3.5 h-3.5" />
              </button>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 border border-[#1a1a1a] hover:border-neutral-500 text-neutral-400 hover:text-white text-center text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-sm bg-transparent cursor-pointer"
              >
                <span>GitHub Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[720px] bg-[#0d0d0d]">
            
            {/* TOP BAR nav link tags */}
            <div className="flex items-center space-x-2 text-[10px] text-neutral-500 font-mono tracking-wider uppercase border-b border-[#1a1a1a] pb-3 select-none">
              <span>workspace</span>
              <span className="text-neutral-700">//</span>
              <span className="text-white font-bold">overview</span>
              <span className="text-neutral-700">//</span>
              <span>repositories</span>
              <span className="text-neutral-700">//</span>
              <span>languages</span>
              <span className="text-neutral-700">//</span>
              <span>commits</span>
              <span className="text-neutral-700">//</span>
              <span>AI</span>
            </div>

            {/* SECTION 1 - Overview Statistic cards */}
            <div className="space-y-3">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block select-none">Overview</span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#090909] border border-[#1a1a1a] rounded-xl flex flex-col justify-between hover:border-neutral-700 transition-colors">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">⭐ Stars</span>
                  <span className="text-2xl font-bold text-white mt-2">{stats.totalStars}</span>
                </div>
                <div className="p-4 bg-[#090909] border border-[#1a1a1a] rounded-xl flex flex-col justify-between hover:border-neutral-700 transition-colors">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">📦 Repositories</span>
                  <span className="text-2xl font-bold text-white mt-2">{repositories.length}</span>
                </div>
                <div className="p-4 bg-[#090909] border border-[#1a1a1a] rounded-xl flex flex-col justify-between hover:border-neutral-700 transition-colors">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">🔥 Streak</span>
                  <span className="text-2xl font-bold text-white mt-2">{stats.streak} days</span>
                </div>
                <div className="p-4 bg-[#090909] border border-[#1a1a1a] rounded-xl flex flex-col justify-between hover:border-neutral-700 transition-colors">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">🧠 AI Score</span>
                  <span className="text-2xl font-bold text-[#9FE870] mt-2">{stats.aiScore}%</span>
                </div>
              </div>
            </div>

            {/* SECTION 2 - Repository List */}
            <div className="space-y-3">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block select-none">Repositories</span>
              <div className="border border-[#1a1a1a] bg-[#090909] rounded-xl divide-y divide-[#1a1a1a] overflow-hidden">
                {repositories.length === 0 ? (
                  <div className="text-neutral-600 text-xs italic py-10 text-center select-none">
                    No source repositories found for this account.
                  </div>
                ) : (
                  repositories.slice(0, 5).map((repo, idx) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#0c0c0c] transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-white hover:text-[#9FE870] transition-colors"
                        >
                          {repo.name}
                        </a>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 max-w-lg m-0 font-sans leading-tight">
                          {repo.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-[10px] text-neutral-500 shrink-0 font-mono select-none">
                        {repo.language && (
                          <div className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9FE870]" />
                            <span className="text-neutral-400 font-semibold">{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-0.5">
                          <Star className="w-3 h-3 text-neutral-600" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center space-x-0.5">
                          <GitFork className="w-3 h-3 text-neutral-600" />
                          <span>{repo.forks}</span>
                        </div>
                        <span>{formatDate(repo.updatedAt)}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 3 - Activity Heatmap */}
            <div className="space-y-3">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block select-none">Activity Heatmap</span>
              {renderHeatmap()}
            </div>

            {/* SECTION 4 - AI Summary */}
            <div className="space-y-3">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block select-none">AI Summary</span>
              <div className="p-5 bg-[#090909] border border-[#1a1a1a] rounded-xl font-mono text-xs text-[#9FE870] space-y-1.5">
                {finalSummary.map((line, idx) => (
                  <p key={idx} className="m-0">{`> ${line}`}</p>
                ))}
              </div>
            </div>

            {/* SECTION 5 - Developer Archetype */}
            <div className="space-y-3">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block select-none">Developer Archetype</span>
              <div className="p-6 bg-[#090909] border border-[#1a1a1a] rounded-xl flex items-center space-x-6 hover:border-neutral-700 transition-colors">
                <div className="shrink-0 p-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl select-none">
                  {renderArchetypeIllustration(finalArchetype)}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider m-0 select-none">{finalArchetype}</h2>
                  <p className="text-[11px] text-neutral-500 font-sans m-0 leading-relaxed">{finalArchetypeSentence}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM STATUS BAR */}
        <div className="px-6 py-2.5 bg-[#090909] border-t border-[#1a1a1a] flex justify-between text-[9px] text-neutral-500 tracking-widest uppercase select-none font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9FE870]" />
              connected
            </span>
            <span>github api</span>
            <span>gemini ready</span>
          </div>
          <span>v1.0</span>
        </div>

      </div>
    </main>
  );
}
