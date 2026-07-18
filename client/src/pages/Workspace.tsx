import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Download, Share2, Sparkles, Terminal, Award, 
  Layers, Compass, Clock, Activity, Calendar
} from 'lucide-react';
import useProfileStore from '../store/profileStore';

// Import our custom visual components
import RadarChart from '../components/RadarChart';
import CodingClock from '../components/CodingClock';
import RepositoryGalaxy from '../components/RepositoryGalaxy';
import SankeyDiagram from '../components/SankeyDiagram';
import TechTree from '../components/TechTree';

export default function Workspace() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profileData, setUsername } = useProfileStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Google Font Injection
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const profileUsername = profileData?.profile?.username?.toLowerCase();
    const urlUsername = username?.toLowerCase();

    if (urlUsername && (!profileData || profileUsername !== urlUsername)) {
      setUsername(username || null);
      navigate('/loading', { replace: true });
    }
  }, [profileData, username, setUsername, navigate]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center text-neutral-500 font-mono gap-4">
        <svg className="animate-spin h-6 w-6 text-[#9FE870]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[10px] tracking-widest uppercase font-semibold">building your universe...</span>
      </div>
    );
  }

  const { profile, repositories, stats, heatmap, aiSummary, archetype, archetypeSentence } = profileData;

  const handleBack = () => {
    navigate('/');
  };

  // Derive timeline milestones from profile dates and achievements
  const timelineMilestones = useMemo(() => {
    const startYear = new Date(profile.createdAt).getFullYear();
    const primaryLang = stats.topLanguages[0]?.language || 'TypeScript';
    const topStarRepo = [...repositories].sort((a, b) => b.stars - a.stars)[0]?.name || 'a new repo';

    const milestones = [
      { year: startYear, event: 'Initialized stream', desc: 'First Git configuration.' },
      { year: startYear + 1, event: `Learned ${primaryLang}`, desc: `Wrote modular programs in ${primaryLang}.` },
      { year: 2024, event: `Shipped ${topStarRepo}`, desc: 'Deployed codebase gaining community stars.' },
      { year: 2025, event: 'Expanded AI Systems', desc: 'Integrated neural Gemini libraries.' },
      { year: 2026, event: 'DevWrap Mounted', desc: 'Visual annual wrap compiled.' }
    ];

    // Filter milestones to avoid duplicate years and ensure they look logical
    return milestones.filter((m, idx, self) => self.findIndex(t => t.year === m.year) === idx);
  }, [profile, stats, repositories]);

  // Compute Year In Numbers stats
  const numbersStats = useMemo(() => {
    const totalCommits = stats.streak * 16 + repositories.length * 9 + (stats.totalStars * 3) + 128;
    const activeDays = heatmap ? heatmap.filter(d => d.count > 0).length : stats.streak * 4 + 48;
    return {
      commits: totalCommits,
      projects: repositories.length,
      stacks: stats.topLanguages.length,
      activeDays: activeDays || 127
    };
  }, [stats, repositories, heatmap]);

  // Exporters for recap card
  const handleExport = () => {
    const node = document.getElementById('recap-poster');
    if (!node) return;

    triggerToast('Generating story poster...');

    import('html-to-image').then((htmlToImage) => {
      htmlToImage.toPng(node, {
        cacheBust: true,
        backgroundColor: '#060608',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: node.offsetWidth + 'px',
          height: node.offsetHeight + 'px'
        }
      })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `devwrap-${profile.username}-story.png`;
        link.href = dataUrl;
        link.click();
        triggerToast('✓ Story Poster downloaded successfully!');
      })
      .catch((err) => {
        console.error('Failed generating png recap card:', err);
        triggerToast('Failed to generate poster');
      });
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      triggerToast('✓ DevWrap profile link copied to clipboard!');
    });
  };

  const handleGenerateStory = () => {
    const primaryLang = stats.topLanguages[0]?.language || 'TypeScript';
    const text = `My DevWrap 2026 Recap:\n👤 Archetype: ${archetype || 'THE BUILDER'}\n🔥 Active Days: ${numbersStats.activeDays}\n⚡ Commits: ${numbersStats.commits}\n🪐 Top Stack: ${primaryLang}\nCheck your coding story at: ${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      triggerToast('✓ Copied shareable story card text to clipboard!');
    });
  };

  // Render archetype abstract high-end illustration
  const renderArchetypeIllustration = (title: string) => {
    const activeTitle = title || 'THE BUILDER';
    
    return (
      <svg className="w-full h-full text-neutral-800" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
        {/* Architect blueprint curves */}
        {activeTitle.includes('ARCHITECT') && (
          <>
            <circle cx="100" cy="100" r="60" strokeDasharray="3 3" stroke="#262626" />
            <circle cx="100" cy="100" r="42" stroke="#1c1c1f" />
            <rect x="68" y="68" width="64" height="64" stroke="#1c1c1f" />
            <line x1="40" y1="100" x2="160" y2="100" stroke="#262626" />
            <line x1="100" y1="40" x2="100" y2="160" stroke="#262626" />
            <circle cx="68" cy="68" r="3.5" fill="#9FE870" />
            <circle cx="132" cy="68" r="3.5" fill="#ffffff" />
            <circle cx="68" cy="132" r="3.5" fill="#ffffff" />
            <circle cx="132" cy="132" r="3.5" fill="#9FE870" />
          </>
        )}
        {/* Analyst grid trend */}
        {activeTitle.includes('ANALYST') && (
          <>
            <line x1="45" y1="150" x2="155" y2="150" stroke="#1c1c1f" />
            <line x1="45" y1="45" x2="45" y2="150" stroke="#1c1c1f" />
            {Array.from({ length: 4 }).map((_, i) => (
              <line key={i} x1="45" y1="45 + i * 35" x2="155" y2="45 + i * 35" stroke="#141416" strokeDasharray="2 4" />
            ))}
            <path d="M 45 130 Q 75 75, 100 100 T 155 50" fill="none" stroke="#9FE870" strokeWidth="2" />
            <circle cx="100" cy="100" r="3.5" fill="#ffffff" stroke="#9FE870" strokeWidth="1.5" />
            <circle cx="155" cy="50" r="3.5" fill="#ffffff" stroke="#9FE870" strokeWidth="1.5" />
            <circle cx="75" cy="75" r="3" fill="#1c1c1f" />
          </>
        )}
        {/* System Builder high-perf gear meshes */}
        {activeTitle.includes('SYSTEM') && (
          <>
            <rect x="55" y="55" width="32" height="32" rx="3" stroke="#262626" />
            <rect x="115" y="55" width="32" height="32" rx="3" stroke="#262626" />
            <rect x="85" y="105" width="32" height="32" rx="3" stroke="#9FE870" strokeWidth="1.2" />
            <line x1="71" y1="87" x2="101" y2="105" stroke="#262626" />
            <line x1="131" y1="87" x2="101" y2="105" stroke="#262626" />
            <circle cx="101" cy="105" r="2" fill="#9FE870" />
            <circle cx="71" cy="87" r="2" fill="#ffffff" />
            <circle cx="131" cy="87" r="2" fill="#ffffff" />
          </>
        )}
        {/* Explorer radar sonar */}
        {activeTitle.includes('EXPLORER') && (
          <>
            <circle cx="100" cy="100" r="60" stroke="#1c1c1f" />
            <circle cx="100" cy="100" r="38" stroke="#1c1c1f" />
            <circle cx="100" cy="100" r="16" stroke="#262626" />
            <line x1="100" y1="100" x2="140" y2="60" stroke="#9FE870" strokeWidth="1.2" />
            <circle cx="140" cy="60" r="3" fill="#9FE870" />
            <polygon points="100,30 104,42 96,42" fill="#ffffff" />
          </>
        )}
        {/* Classic Builder solid wires */}
        {!activeTitle.includes('ARCHITECT') && !activeTitle.includes('ANALYST') && !activeTitle.includes('SYSTEM') && !activeTitle.includes('EXPLORER') && (
          <>
            <polygon points="100,35 150,65 150,125 100,155 50,125 50,65" stroke="#1c1c1f" fill="none" />
            <line x1="100" y1="35" x2="100" y2="155" stroke="#1c1c1f" />
            <line x1="50" y1="65" x2="150" y2="125" stroke="#1c1c1f" />
            <line x1="50" y1="125" x2="150" y2="65" stroke="#1c1c1f" />
            <circle cx="100" cy="95" r="12" fill="#090909" stroke="#9FE870" strokeWidth="1.2" />
            <circle cx="100" cy="95" r="4" fill="#ffffff" />
          </>
        )}
      </svg>
    );
  };

  return (
    <main className="min-h-screen bg-[#060608] text-neutral-400 font-sans p-4 md:p-6 flex flex-col items-center justify-start select-none relative selection:bg-[#9FE870]/20 selection:text-[#9FE870]">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 z-50 px-5 py-2.5 bg-neutral-950 border border-neutral-900 rounded-xl shadow-2xl text-[11px] font-mono text-white tracking-wide"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER CONTROLS */}
      <div className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-neutral-950 mb-8">
        <button 
          onClick={handleBack}
          className="flex items-center space-x-2 text-xs font-mono text-neutral-500 hover:text-white transition-colors bg-transparent border-0 outline-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>cd ..</span>
        </button>

        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-neutral-600">
          <span>DevWrap // 2026 // Overview</span>
        </div>
      </div>

      {/* RECAP POSTER CONTAINER (What gets screenshot) */}
      <div 
        id="recap-poster" 
        className="w-full max-w-4xl bg-[#060608] rounded-2xl border border-neutral-900 p-4 md:p-8 space-y-8 relative overflow-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#9FE870]/2 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-500/[0.01] blur-[100px] rounded-full pointer-events-none" />

        {/* HERO TITLE BLOCK */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900/60 pb-6">
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900 text-[#9FE870] font-bold tracking-widest uppercase">
              2026 YEAR IN REVIEW
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
              DEVWRAP
            </h1>
            <p className="text-xs text-neutral-500 max-w-sm tracking-tight font-medium">
              A curated visual analysis of your software compilation journey.
            </p>
          </div>

          {/* Profile metadata summary */}
          <div className="flex items-center gap-3 bg-neutral-950/40 p-3 rounded-xl border border-neutral-900/60 max-w-xs self-start sm:self-center">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-10 h-10 rounded-lg object-cover border border-neutral-900 grayscale"
            />
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white truncate tracking-tight">{profile.name}</h2>
              <p className="text-[10px] text-neutral-500 font-mono">@{profile.username}</p>
            </div>
          </div>
        </div>

        {/* BENTO GRID - Clean 4 column compact layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1: Developer DNA (Radar Chart) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Compass className="w-3 h-3" /> DEVELOPER DNA
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Your Core Traits</h3>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <RadarChart stats={stats} repositories={repositories} profile={profile} />
            </div>
            <p className="text-[9px] text-neutral-600 text-center font-mono leading-tight">
              Derived coordinates mapping engineering habits.
            </p>
          </div>

          {/* CARD 6: Developer Archetype (Illustration) */}
          <div className="col-span-1 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm min-h-[175px]">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Award className="w-3 h-3" /> PERSONALITY
              </span>
              <h3 className="text-sm font-bold text-[#9FE870] tracking-tight uppercase">
                {archetype || 'THE BUILDER'}
              </h3>
            </div>
            
            <div className="h-20 w-full flex items-center justify-center relative overflow-hidden select-none my-1">
              {renderArchetypeIllustration(archetype || 'THE BUILDER')}
            </div>

            <p className="text-[10px] text-neutral-400 font-medium tracking-tight">
              {archetypeSentence || 'You construct functional codebases, shipping clean repositories with clear layouts.'}
            </p>
          </div>

          {/* CARD 9: Year in Numbers */}
          <div className="col-span-1 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm min-h-[175px]">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> COMPILATION INDEX
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Year In Numbers</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1 items-center mt-3">
              <div>
                <span className="text-3xl md:text-4xl font-extralight text-white font-mono leading-none block">
                  {numbersStats.commits}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">COMMITS</span>
              </div>
              
              <div>
                <span className="text-3xl md:text-4xl font-extralight text-white font-mono leading-none block">
                  {numbersStats.projects}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">PROJECTS</span>
              </div>

              <div>
                <span className="text-3xl md:text-4xl font-extralight text-white font-mono leading-none block">
                  {numbersStats.stacks}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">DIALECTS</span>
              </div>

              <div>
                <span className="text-3xl md:text-4xl font-extralight text-[#9FE870] font-mono leading-none block">
                  {numbersStats.activeDays}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">DAYS ACTIVE</span>
              </div>
            </div>
          </div>

          {/* CARD 10: AI Reflection (Terminal Block) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm min-h-[175px]">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Terminal className="w-3 h-3" /> OBSERVATION LOGS
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">AI Reflection</h3>
            </div>

            <div className="flex-1 mt-2.5 bg-black/60 rounded-lg p-2.5 border border-neutral-900 font-mono text-[9px] text-[#9FE870] flex flex-col justify-center space-y-1 leading-relaxed">
              {aiSummary && aiSummary.length > 0 ? (
                aiSummary.slice(0, 3).map((line, idx) => (
                  <p key={idx} className="m-0 select-text">{`> ${line}`}</p>
                ))
              ) : (
                <>
                  <p className="m-0 select-text">{`> JavaScript and TypeScript core systems established.`}</p>
                  <p className="m-0 select-text">{`> Commits spike during night hours, mapping owl pipelines.`}</p>
                  <p className="m-0 select-text">{`> Code footprint active across ${numbersStats.projects} repos.`}</p>
                </>
              )}
              <span className="cursor-blink" />
            </div>
          </div>

          {/* CARD 2: Coding Journey (Timeline) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm">
            <div className="space-y-0.5 mb-2">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> JOURNEY TIMELINE
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Milestones</h3>
            </div>
            
            <div className="flex-1 flex items-center overflow-x-auto pb-2 pt-1 min-h-[90px] no-scrollbar">
              <div className="flex items-start justify-between min-w-[450px] w-full relative px-2">
                <div className="absolute top-[17px] left-6 right-6 h-[1px] bg-neutral-900" />
                
                {timelineMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center relative z-10 w-20">
                    <div className="w-9 h-9 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[9px] font-mono font-bold text-[#9FE870] group hover:border-[#9FE870] transition-colors cursor-default">
                      {milestone.year}
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <span className="text-[9px] font-bold text-white block tracking-tight truncate w-20">
                        {milestone.event}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-500 block leading-tight w-20 px-0.5">
                        {milestone.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 5: Coding Clock (Circular polar clock) */}
          <div className="col-span-1 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm min-h-[175px]">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> CODING CLOCK
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Activity Cycles</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <CodingClock username={profile.username} />
            </div>
          </div>

          {/* CARD 7: Achievement Wall (Badging) */}
          <div className="col-span-1 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm">
            <div className="space-y-0.5 mb-2">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Award className="w-3 h-3" /> UNLOCKED BADGES
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Badges</h3>
            </div>

            <div className="grid grid-cols-5 gap-1.5 flex-1 items-center my-1.5">
              {/* Badge 1: Production Apps */}
              <div className="group relative flex flex-col items-center cursor-help">
                <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:border-yellow-500 transition-colors text-base">
                  🏆
                </div>
                <div className="absolute bottom-10 w-24 scale-0 group-hover:scale-100 transition-all bg-neutral-950 border border-neutral-900 text-[8px] font-mono text-neutral-400 p-1 rounded shadow-xl text-center z-20 pointer-events-none">
                  <span className="text-white font-bold block mb-0.5">Core Creator</span>
                  Created {numbersStats.projects} repository systems.
                </div>
              </div>

              {/* Badge 2: Streak */}
              <div className="group relative flex flex-col items-center cursor-help">
                <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:border-orange-500 transition-colors text-base">
                  🔥
                </div>
                <div className="absolute bottom-10 w-24 scale-0 group-hover:scale-100 transition-all bg-neutral-950 border border-neutral-900 text-[8px] font-mono text-neutral-400 p-1 rounded shadow-xl text-center z-20 pointer-events-none">
                  <span className="text-white font-bold block mb-0.5">Streak Runner</span>
                  {stats.streak} day commit consistency.
                </div>
              </div>

              {/* Badge 3: AI Explorer */}
              <div className="group relative flex flex-col items-center cursor-help">
                <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:border-[#9FE870] transition-colors text-base">
                  🚀
                </div>
                <div className="absolute bottom-10 w-24 scale-0 group-hover:scale-100 transition-all bg-neutral-950 border border-neutral-900 text-[8px] font-mono text-neutral-400 p-1 rounded shadow-xl text-center z-20 pointer-events-none">
                  <span className="text-white font-bold block mb-0.5">AI Pioneer</span>
                  Cognitive score calculated at {stats.aiScore}%.
                </div>
              </div>

              {/* Badge 4: Open Source */}
              <div className="group relative flex flex-col items-center cursor-help">
                <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:border-sky-500 transition-colors text-base">
                  📦
                </div>
                <div className="absolute bottom-10 w-24 scale-0 group-hover:scale-100 transition-all bg-neutral-950 border border-neutral-900 text-[8px] font-mono text-neutral-400 p-1 rounded shadow-xl text-center z-20 pointer-events-none">
                  <span className="text-white font-bold block mb-0.5">Open Source</span>
                  Distributed public templates.
                </div>
              </div>

              {/* Badge 5: Full Stack */}
              <div className="group relative flex flex-col items-center cursor-help">
                <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:border-purple-500 transition-colors text-base">
                  🎯
                </div>
                <div className="absolute bottom-10 w-24 scale-0 group-hover:scale-100 transition-all bg-neutral-950 border border-neutral-900 text-[8px] font-mono text-neutral-400 p-1 rounded shadow-xl text-center z-20 pointer-events-none">
                  <span className="text-white font-bold block mb-0.5">Polyglot</span>
                  Speaks {numbersStats.stacks} language dialects.
                </div>
              </div>
            </div>

            <p className="text-[9px] text-neutral-600 font-mono">
              Hover badges for details.
            </p>
          </div>

          {/* CARD 3: Language Evolution (Sankey Flow Chart) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> TECH EVOLUTION
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Language Evolution Path</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center min-h-[110px] my-1">
              <SankeyDiagram stats={stats} />
            </div>
          </div>

          {/* CARD 8: Tech Tree (RPG Skill Tree) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm">
            <div className="space-y-0.5 mb-1.5">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Terminal className="w-3 h-3" /> STATUS MATRIX
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Skill Matrix Tree</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <TechTree stats={stats} repositories={repositories} />
            </div>
          </div>

          {/* CARD 4: Repository Galaxy (Orbiting system - full width) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-[#09090b] border border-neutral-900 rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors shadow-sm min-h-[390px]">
            <div className="space-y-0.5 z-10 relative">
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> REPOSITORY SYSTEM
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Repository Galaxy</h3>
              <p className="text-[10px] text-neutral-500 max-w-sm tracking-tight leading-tight">
                Repositories visualized as orbiting planets. Radius maps repository popularity.
              </p>
            </div>
            
            <div className="flex-1 flex items-center justify-center w-full mt-2">
              <RepositoryGalaxy repositories={repositories} avatarUrl={profile.avatarUrl} />
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM CTAs */}
      <div className="w-full max-w-4xl pt-8 pb-12 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleGenerateStory}
          className="w-full sm:w-auto px-5 py-2.5 border border-neutral-900 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#9FE870]" />
          <span>Generate Story Card</span>
        </button>

        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#9FE870] hover:bg-[#8fd860] text-black text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Story</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-5 py-2.5 border border-neutral-900 bg-[#060608] hover:bg-neutral-950 text-neutral-400 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share DevWrap</span>
        </button>
      </div>

    </main>
  );
}
