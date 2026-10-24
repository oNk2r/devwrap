import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Orbit, Cpu, FileText, Clock, Award,
  Download, Share2, Search, X, Sparkles, Flame, Star,
  ArrowRight
} from 'lucide-react';
import useProfileStore from '../store/profileStore';
import type { DevWrapStats } from '../types/github';

import RadarChart from '../components/RadarChart';
import CodingClock from '../components/CodingClock';
import RepositoryGalaxy from '../components/RepositoryGalaxy';
import SankeyDiagram from '../components/SankeyDiagram';
import TechTree from '../components/TechTree';
import RPGCard from '../components/RPGCard';
import ContributionHeatmap from '../components/ContributionHeatmap';

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

type TabType = 'overview' | 'galaxy' | 'traits' | 'languages' | 'clock' | 'card' | 'badges';

interface BadgeDef {
  id: string;
  emoji: string;
  title: string;
  color: string;
  desc: (n: { commits: number; projects: number; stacks: number; activeDays: number }, stats: DevWrapStats) => string;
}

const BADGES: BadgeDef[] = [
  { id: 'creator', emoji: '🏆', title: 'Core Creator', color: '#FFDE59',
    desc: (n) => `Shipped ${n.projects} open source repository systems.` },
  { id: 'streak', emoji: '🔥', title: 'Streak Champion', color: '#FB923C',
    desc: (_n, stats) => `Maintained ${stats.streak} consecutive days of GitHub commits.` },
  { id: 'ai', emoji: '🤖', title: 'AI Pioneer', color: '#C084FC',
    desc: (_n, stats) => `Achieved ${stats.aiScore}% cognitive AI index.` },
  { id: 'oss', emoji: '📦', title: 'Open Source Pillar', color: '#00F5A0',
    desc: () => `Distributed public software packages worldwide.` },
  { id: 'polyglot', emoji: '🎯', title: 'Polyglot Architect', color: '#38BDF8',
    desc: (n) => `Fluently utilizes ${n.stacks} distinct programming dialects.` },
];

export default function Workspace() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profileData, setUsername } = useProfileStore();

  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openBadge, setOpenBadge] = useState<string | null>('creator');

  // Sync profile data or redirect
  useEffect(() => {
    const profileUsername = profileData?.profile?.username?.toLowerCase();
    const urlUsername = username?.toLowerCase();

    if (urlUsername && (!profileData || profileUsername !== urlUsername)) {
      setUsername(username || null);
      navigate('/loading', { replace: true });
    }
  }, [profileData, username, setUsername, navigate]);

  const numbersStats = useMemo(() => {
    if (!profileData) {
      return { commits: 0, projects: 0, stacks: 0, activeDays: 0 };
    }
    const { repositories, stats, heatmap } = profileData;
    const totalCommits = stats.streak * 14 + repositories.length * 8 + (stats.totalStars * 3) + 94;
    const activeDays = heatmap ? heatmap.filter((d) => d.count > 0).length : stats.streak * 3 + 42;
    return {
      commits: totalCommits,
      projects: repositories.length,
      stacks: stats.topLanguages.length,
      activeDays: activeDays || 88,
    };
  }, [profileData]);

  if (!profileData) {
    return (
      <main className="min-h-screen neo-grid-bg text-neutral-900 flex items-center justify-center p-4">
        <div className="neo-card p-6 flex flex-col items-center gap-2">
          <div className="w-7 h-7 rounded-full border-3 border-black border-t-transparent animate-spin" />
          <p className="font-extrabold text-xs">Loading Analytics...</p>
        </div>
      </main>
    );
  }

  const { profile, repositories, stats, heatmap, aiSummary, archetype, archetypeSentence } = profileData;

  const handleBack = () => {
    navigate('/');
  };

  const handleExport = () => {
    const node = document.getElementById('recap-poster');
    if (!node) return;

    setToastMessage('Exporting poster...');

    import('html-to-image').then((htmlToImage) => {
      htmlToImage
        .toPng(node, {
          cacheBust: true,
          backgroundColor: '#F7F5EE',
        })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `devwrap-${profile.username}.png`;
          link.href = dataUrl;
          link.click();
          setToastMessage('✓ Downloaded poster!');
          setTimeout(() => setToastMessage(null), 3000);
        })
        .catch((err) => {
          console.error(err);
          setToastMessage('Export failed.');
          setTimeout(() => setToastMessage(null), 3000);
        });
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setToastMessage('✓ Link copied!');
      setTimeout(() => setToastMessage(null), 3000);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    navigate(`/loading`);
    setUsername(searchQuery.trim());
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'galaxy', label: 'Repo Galaxy', icon: Orbit },
    { id: 'traits', label: 'Skill Matrix', icon: Cpu },
    { id: 'languages', label: 'Tech Flow', icon: FileText },
    { id: 'clock', label: 'Coding Rhythm', icon: Clock },
    { id: 'card', label: 'Trading Card', icon: Sparkles },
    { id: 'badges', label: 'Achievements', icon: Award },
  ];

  return (
    <div className="min-h-screen neo-grid-bg text-neutral-900 flex flex-col justify-between selection:bg-[#FFDE59] selection:text-black">
      {/* TOP WORKSPACE NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#F7F5EE]/95 backdrop-blur-md border-b-2 border-black px-4 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FFDE59] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black text-base select-none">
                ⚡
              </div>
              <span className="font-black text-base tracking-tight hidden sm:inline">
                DevWrap
              </span>
            </button>

            <span className="text-neutral-300 font-bold hidden sm:inline">/</span>

            <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-0.5 shadow-[2px_2px_0px_#000]">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-4 h-4 rounded-full border border-black object-cover"
              />
              <span className="text-xs font-bold font-mono">@{profile.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="neo-btn bg-white px-3 py-1.5 text-xs"
              title="Search another GitHub developer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              onClick={handleShare}
              className="neo-btn bg-white px-3 py-1.5 text-xs"
              title="Share recap link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleExport}
              className="neo-btn neo-btn-primary px-3.5 py-1.5 text-xs"
              title="Download story poster"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER TAB NAVIGATION */}
      <div className="border-b-2 border-black bg-white px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as TabType)}
                className={`neo-btn px-3 py-1 text-xs rounded-xl flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'neo-btn-dark shadow-[2.5px_2.5px_0px_#000]'
                    : 'bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_#000]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1" id="recap-poster">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="space-y-5"
          >
            {/* ================= TAB 1: OVERVIEW ================= */}
            {currentTab === 'overview' && (
              <>
                {/* Clean Profile Header */}
                <div className="neo-card p-5 bg-white">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 border-black object-cover shadow-[3px_3px_0px_#000] shrink-0"
                    />

                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h1 className="text-2xl font-black text-neutral-900 leading-tight">
                          {profile.name || profile.username}
                        </h1>
                        <span className="neo-badge bg-[#C084FC] text-black">
                          {archetype || 'THE ARCHITECT'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono text-xs text-neutral-500 font-bold">
                        <a
                          href={profile.githubUrl || `https://github.com/${profile.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-neutral-700"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                          <span>@{profile.username}</span>
                        </a>
                        <span>•</span>
                        <span>{profile.followers} followers</span>
                      </div>

                      {archetypeSentence && (
                        <p className="text-xs text-neutral-700 font-medium italic pt-1">
                          "{archetypeSentence}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4 Clean Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="neo-card p-4 bg-[#FFDE59]">
                    <span className="text-[11px] font-mono font-bold uppercase text-black block mb-1">
                      Repositories
                    </span>
                    <span className="text-2xl font-black text-black">{numbersStats.projects}</span>
                  </div>

                  <div className="neo-card p-4 bg-[#FB923C] text-white">
                    <span className="text-[11px] font-mono font-bold uppercase text-white/90 block mb-1 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-white" />
                      Active Streak
                    </span>
                    <span className="text-2xl font-black text-white">{stats.streak} Days</span>
                  </div>

                  <div className="neo-card p-4 bg-[#38BDF8]">
                    <span className="text-[11px] font-mono font-bold uppercase text-black block mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-black fill-black" />
                      Total Stars
                    </span>
                    <span className="text-2xl font-black text-black">{stats.totalStars}</span>
                  </div>

                  <div className="neo-card p-4 bg-[#00F5A0]">
                    <span className="text-[11px] font-mono font-bold uppercase text-black block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-black" />
                      AI Score
                    </span>
                    <span className="text-2xl font-black text-black">{stats.aiScore}%</span>
                  </div>
                </div>

                {/* Contribution Calendar Heatmap */}
                <ContributionHeatmap heatmap={heatmap} streak={stats.streak} />

                {/* Two-Column Analytics Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: AI Observations & Stack Breakdown */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* AI Observations Card */}
                    <div className="neo-card p-5 bg-white">
                      <h3 className="font-extrabold text-sm text-neutral-900 pb-2 mb-3 border-b-2 border-black border-dashed">
                        Engineering Observations
                      </h3>

                      <div className="space-y-2.5">
                        {aiSummary && aiSummary.length > 0 ? (
                          aiSummary.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-[#FAF8F5] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-start gap-2"
                            >
                              <span className="text-[#00F5A0] font-black text-sm shrink-0">⚡</span>
                              <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                                {item}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-[#FAF8F5] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-start gap-2">
                            <span className="text-[#00F5A0] font-black text-sm shrink-0">⚡</span>
                            <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                              Active repository structures demonstrate modular logic and steady cadence.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Languages Breakdown Card */}
                    <div className="neo-card p-5 bg-white">
                      <h3 className="font-extrabold text-sm text-neutral-900 pb-2 mb-3 border-b-2 border-black border-dashed">
                        Language Distribution
                      </h3>

                      <div className="space-y-2.5">
                        {stats.topLanguages.map((lang, index) => {
                          const colors = ['#38BDF8', '#FFDE59', '#00F5A0', '#C084FC', '#FB923C'];
                          const color = colors[index % colors.length];

                          return (
                            <div key={lang.language} className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black inline-block"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span>{lang.language}</span>
                                </span>
                                <span className="font-mono text-neutral-600">{lang.percentage}%</span>
                              </div>
                              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-black/40">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${lang.percentage}%`, backgroundColor: color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Radar Matrix Card */}
                  <div className="lg:col-span-5 neo-card p-5 bg-white flex flex-col justify-between">
                    <h3 className="font-extrabold text-sm text-neutral-900 pb-2 mb-2 border-b-2 border-black border-dashed">
                      Cognitive Traits Matrix
                    </h3>

                    <RadarChart stats={stats} repositories={repositories} profile={profile} />
                  </div>
                </div>
              </>
            )}

            {/* ================= TAB 2: REPO GALAXY ================= */}
            {currentTab === 'galaxy' && (
              <RepositoryGalaxy repositories={repositories} avatarUrl={profile.avatarUrl} />
            )}

            {/* ================= TAB 3: SKILL MATRIX ================= */}
            {currentTab === 'traits' && (
              <TechTree stats={stats} repositories={repositories} />
            )}

            {/* ================= TAB 4: LANGUAGE FLOW ================= */}
            {currentTab === 'languages' && (
              <SankeyDiagram stats={stats} />
            )}

            {/* ================= TAB 5: CODING CLOCK ================= */}
            {currentTab === 'clock' && (
              <div className="neo-card p-6 bg-white max-w-xl mx-auto">
                <CodingClock username={profile.username} />
              </div>
            )}

            {/* ================= TAB 6: RPG CARD ================= */}
            {currentTab === 'card' && (
              <RPGCard profileData={profileData} />
            )}

            {/* ================= TAB 7: ACHIEVEMENTS ================= */}
            {currentTab === 'badges' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BADGES.map((badge) => {
                  const isSelected = openBadge === badge.id;
                  return (
                    <div
                      key={badge.id}
                      onClick={() => setOpenBadge(badge.id)}
                      className={`neo-card p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-2 border-black shadow-[5px_5px_0px_#000] -translate-y-0.5'
                          : 'hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_#000]"
                          style={{ backgroundColor: badge.color }}
                        >
                          {badge.emoji}
                        </div>
                        <h3 className="font-extrabold text-sm text-neutral-900">{badge.title}</h3>
                      </div>

                      <p className="text-xs text-neutral-600 font-medium">
                        {badge.desc(numbersStats, stats)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t-2 border-black bg-white py-3 px-4 sm:px-8 mt-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>DevWrap • @{profile.username}</span>
          <span>{numbersStats.projects} Repos • {stats.streak}d Streak</span>
        </div>
      </footer>

      {/* SEARCH USER MODAL */}
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white border-[2.5px] border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000] relative"
            >
              <button
                onClick={() => setSearchModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg border-2 border-black bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-neutral-900 mb-1">Search Developer</h3>
              <p className="text-xs text-neutral-500 mb-4">Enter GitHub username to analyze.</p>

              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="flex items-center px-3 py-2 bg-neutral-100 border-2 border-black rounded-xl">
                  <span className="font-mono text-xs font-bold text-neutral-500 mr-1 select-none">
                    github.com/
                  </span>
                  <input
                    type="text"
                    placeholder="username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                    className="flex-1 bg-transparent border-none text-neutral-900 placeholder-neutral-400 outline-none text-sm font-bold font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSearchModalOpen(false)}
                    className="neo-btn bg-white px-3.5 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="neo-btn neo-btn-primary px-4 py-1.5 text-xs"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-50 bg-black text-white border-2 border-white px-3.5 py-2 rounded-xl shadow-[3px_3px_0px_#000] text-xs font-bold select-none"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}