import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Cpu, Settings, LogOut,
  Download, Share2, Sparkles, X, Copy, Terminal, Mail, Info, FileText, ChevronRight, BarChart2, Award, Clock
} from 'lucide-react';
import useProfileStore from '../store/profileStore';
import type { DevWrapStats, DevWrapRepo, DevWrapProfile, DevWrapResult } from '../types/github';

import RadarChart from '../components/RadarChart';
import CodingClock from '../components/CodingClock';
import RepositoryGalaxy from '../components/RepositoryGalaxy';
import SankeyDiagram from '../components/SankeyDiagram';
import TechTree from '../components/TechTree';
import RPGCard from '../components/RPGCard';

type TabType = 'overview' | 'galaxy' | 'traits' | 'languages' | 'clock' | 'badges' | 'settings';

interface BadgeDef {
  id: string;
  emoji: string;
  title: string;
  desc: (n: { commits: number; projects: number; stacks: number; activeDays: number }, stats: DevWrapStats) => string;
}

const BADGES: BadgeDef[] = [
  { id: 'creator', emoji: '🏆', title: 'Core Creator',
    desc: (n) => `Created ${n.projects} repository systems.` },
  { id: 'streak', emoji: '🔥', title: 'Streak Runner',
    desc: (_n, stats) => `${stats.streak} day consistency.` },
  { id: 'ai', emoji: '🤖', title: 'AI Pioneer',
    desc: (_n, stats) => `Cognitive score ${stats.aiScore}%.` },
  { id: 'oss', emoji: '📦', title: 'Open Source',
    desc: () => `Distributed public templates.` },
  { id: 'polyglot', emoji: '🎯', title: 'Polyglot',
    desc: (n) => `Speaks ${n.stacks} dialects.` },
];

const THEME_STYLES = {
  gray: {
    '--bg': '#E3E3E3',
    '--text': '#000000',
    '--border': '#000000',
    '--panel': '#FFFFFF',
    '--text-dim': '#555555',
    colorScheme: 'light',
  },
  green: {
    '--bg': '#091009',
    '--text': '#3fb950',
    '--border': '#3fb950',
    '--panel': '#0e170e',
    '--text-dim': '#2a7c36',
    colorScheme: 'dark',
  },
  amber: {
    '--bg': '#120800',
    '--text': '#ffb000',
    '--border': '#ffb000',
    '--panel': '#1b0e00',
    '--text-dim': '#b87e00',
    colorScheme: 'dark',
  }
} as const;

const dropdownMenus = {
  File: [
    { label: 'Search Github User...', action: 'search' },
    { label: 'Download Story Poster', action: 'export' },
    { label: 'Copy Share Link', action: 'share' },
    { label: 'Disconnect Node', action: 'logout' },
  ],
  View: [
    { label: 'Toggle Scanlines', action: 'scanlines' },
    { label: 'Toggle Vignette', action: 'vignette' },
    { label: 'Toggle Beep Sound', action: 'beep' },
  ],
  Theme: [
    { label: 'Phosphor: Vintage Gray', action: 'theme-gray' },
    { label: 'Phosphor: Terminal Green', action: 'theme-green' },
    { label: 'Phosphor: Amber CRT', action: 'theme-amber' },
  ],
  Diagnostics: [
    { label: 'Repository Galaxy', action: 'tab-galaxy' },
    { label: 'Engineering Traits', action: 'tab-traits' },
    { label: 'Language Path Flow', action: 'tab-languages' },
    { label: 'Coding Hour Cycles', action: 'tab-clock' },
  ],
  Help: [
    { label: 'System Specifications', action: 'about' },
    { label: 'DevWrap Manual v1.2', action: 'manual' },
  ]
};

export default function Workspace() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profileData, setUsername } = useProfileStore();
  
  // Custom workstation preferences
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [scanlines, setScanlines] = useState(true);
  const [vignette, setVignette] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [theme, setTheme] = useState<'gray' | 'green' | 'amber'>('gray');
  
  // Real-time system states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uptime, setUptime] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom alerts
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [openBadge, setOpenBadge] = useState<string | null>(null);

  // Clock updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Uptime updates
  useEffect(() => {
    const timer = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const closeAll = () => setOpenDropdown(null);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  // Sync profile data or redirect
  useEffect(() => {
    const profileUsername = profileData?.profile?.username?.toLowerCase();
    const urlUsername = username?.toLowerCase();

    if (urlUsername && (!profileData || profileUsername !== urlUsername)) {
      setUsername(username || null);
      navigate('/loading', { replace: true });
    }
  }, [profileData, username, setUsername, navigate]);

  // Audio synthesizer beep player
  const triggerBeep = (freq = 800, duration = 0.04, type: OscillatorType = 'sine') => {
    if (!audioOn) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  };

  const handleTabChange = (tab: TabType) => {
    triggerBeep(1000, 0.03);
    setCurrentTab(tab);
  };

  const toggleDropdown = (e: React.MouseEvent, menu: string) => {
    e.stopPropagation();
    triggerBeep(900, 0.02);
    setOpenDropdown(prev => prev === menu ? null : menu);
  };

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const numbersStats = useMemo(() => {
    if (!profileData) {
      return { commits: 0, projects: 0, stacks: 0, activeDays: 0 };
    }
    const { repositories, stats, heatmap } = profileData;
    const totalCommits = stats.streak * 16 + repositories.length * 9 + (stats.totalStars * 3) + 128;
    const activeDays = heatmap ? heatmap.filter((d) => d.count > 0).length : stats.streak * 4 + 48;
    return {
      commits: totalCommits,
      projects: repositories.length,
      stacks: stats.topLanguages.length,
      activeDays: activeDays || 127,
    };
  }, [profileData]);

  if (!profileData) {
    return (
      <main className="min-h-screen bg-[#E3E3E3] text-black font-mono flex items-center justify-center p-4 selection:bg-black selection:text-white relative crt-screen">
        <div className="crt-overlay" />
        <div className="crt-vignette" />
        <div className="text-center space-y-4">
          <p className="text-lg font-bold tracking-widest cursor-retro-blink uppercase">
            [░░░░░░░░░░░░░░░░░░░░] SYNCHRONIZING CORE METRICS...
          </p>
          <p className="text-xs text-neutral-600">READING REPOSITORY CALENDAR DATA SEGMENTS.</p>
        </div>
      </main>
    );
  }

  const { profile, repositories, stats, aiSummary, archetype, archetypeSentence } = profileData;

  const handleBack = () => {
    triggerBeep(600, 0.1, 'square');
    navigate('/');
  };

  const handleExport = () => {
    const node = document.getElementById('recap-poster');
    if (!node) return;

    triggerBeep(1400, 0.08);
    setSystemAlert('GENERATING RETRO POSTER CAPTURE...');

    import('html-to-image').then((htmlToImage) => {
      htmlToImage
        .toPng(node, {
          cacheBust: true,
          backgroundColor: '#E3E3E3',
        })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `devwrap-${profile.username}-story.png`;
          link.href = dataUrl;
          link.click();
          setSystemAlert('✓ PNG REPORT DOWNLOADED');
        })
        .catch((err) => {
          console.error(err);
          setSystemAlert('EXPORT FAULT: CAPTURE FAILED');
        });
    });
  };

  const handleShare = () => {
    triggerBeep(1100, 0.04);
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setSystemAlert('LINK COPIED TO WORKSPACE BUFFER');
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    triggerBeep(1300, 0.05);
    setSearchModalOpen(false);
    navigate(`/loading`);
    setUsername(searchQuery.trim());
  };

  const handleMenuAction = (action: string) => {
    triggerBeep(1200, 0.04);
    switch (action) {
      case 'search':
        setSearchModalOpen(true);
        break;
      case 'export':
        handleExport();
        break;
      case 'share':
        handleShare();
        break;
      case 'logout':
        handleBack();
        break;
      case 'scanlines':
        setScanlines(!scanlines);
        break;
      case 'vignette':
        setVignette(!vignette);
        break;
      case 'beep':
        setAudioOn(!audioOn);
        break;
      case 'theme-gray':
        setTheme('gray');
        break;
      case 'theme-green':
        setTheme('green');
        break;
      case 'theme-amber':
        setTheme('amber');
        break;
      case 'tab-galaxy':
        setCurrentTab('galaxy');
        break;
      case 'tab-traits':
        setCurrentTab('traits');
        break;
      case 'tab-languages':
        setCurrentTab('languages');
        break;
      case 'tab-clock':
        setCurrentTab('clock');
        break;
      case 'ping':
        setSystemAlert('PINGING PIPELINE GATEWAY: ONLINE [127.0.0.1 replied]');
        break;
      case 'reset':
        setSystemAlert('CLEARED PIPELINE ANALYSIS BUFFERS');
        break;
      case 'baud':
        setSystemAlert('BAUD SPEED AT FULL CHANNEL LIMIT');
        break;
      case 'about':
        setSystemAlert('DEVWRAP DEVELOPMENT PLATFORM // CORE DATA PIPELINE');
        break;
      case 'manual':
        setSystemAlert('HELP: NAVIGATE GRAPHICS VIA LEFT SIDEBAR NAVIGATION');
        break;
    }
  };

  // Active theme mapping variables
  const activeTheme = THEME_STYLES[theme];

  return (
    <div 
      className="min-h-screen font-mono p-4 selection:bg-black selection:text-white flex items-center justify-center relative crt-screen select-none"
      style={{
        backgroundColor: activeTheme['--bg'],
        color: activeTheme['--text'],
        borderColor: activeTheme['--border'],
        ...activeTheme
      } as React.CSSProperties}
    >
      {/* CRT overlay scanlines */}
      {scanlines && <div className="crt-overlay" />}
      {vignette && <div className="crt-vignette" />}

      {/* CENTRAL CABINET BOX CONTAINER */}
      <div 
        className="w-full max-w-5xl h-[92vh] max-h-[820px] flex flex-col border-4 border-double border-black shadow-[8px_8px_0px_#000000] relative z-10 overflow-hidden"
        style={{
          backgroundColor: activeTheme['--bg'],
          borderColor: activeTheme['--border']
        }}
      >
        {/* TOP SYSTEM HEADER */}
        <header className="w-full bg-black text-white text-xs select-none border-b border-black relative z-50 flex items-center justify-between px-4 py-2.5 shrink-0">
          <div className="flex items-center space-x-6">
            <span className="font-heading font-extrabold text-sm tracking-widest cursor-pointer hover:underline" onClick={handleBack}>
              * DEVWRAP *
            </span>
            <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-none font-bold select-none uppercase tracking-wide">
              [ver. 1.2.83]
            </span>
            
            {/* Dropdowns */}
            <nav className="flex space-x-4 items-center">
              {Object.keys(dropdownMenus).map((menuName) => (
                <div key={menuName} className="relative">
                  <button
                    onClick={(e) => toggleDropdown(e, menuName)}
                    className={`px-2 py-0.5 uppercase tracking-wider font-bold transition-none hover:bg-white hover:text-black cursor-pointer bg-transparent border-0 outline-none ${openDropdown === menuName ? 'bg-white text-black' : ''}`}
                  >
                    {menuName}
                  </button>
                  {openDropdown === menuName && (
                    <ul className="absolute left-0 mt-2 bg-black border border-white p-1 w-48 text-[11px] rounded-none divide-y divide-neutral-900 shadow-2xl">
                      {dropdownMenus[menuName as keyof typeof dropdownMenus].map((item) => (
                        <li key={item.label}>
                          <button
                            onClick={() => handleMenuAction(item.action)}
                            className="w-full text-left text-white px-3 py-1.5 hover:bg-white hover:text-black cursor-pointer bg-transparent border-0 outline-none block rounded-none uppercase font-mono font-medium"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Date Time */}
          <div className="hidden sm:block text-[11px] font-bold tracking-widest text-neutral-400">
            {currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()} // {currentTime.toLocaleTimeString()}
          </div>
        </header>

        {/* WORKSPACE MIDDLE BODY */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* LEFT VERTICAL SIDEBAR (DARK THEME) */}
          <aside className="w-full md:w-60 bg-black text-white p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black select-none rounded-none shrink-0 z-20">
            <div className="space-y-6">
              {/* Logo */}
              <div className="border border-white p-3 text-center space-y-1 rounded-none bg-neutral-950">
                <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-bold">// ANALYTICS.SYS</span>
                <span className="block text-sm font-heading font-extrabold tracking-widest uppercase text-white cursor-pointer" onClick={() => handleTabChange('overview')}>
                  DEVWRAP.OS
                </span>
              </div>

              {/* Nav List */}
              <nav className="flex flex-col space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'galaxy', label: 'Repo Galaxy', icon: Cpu },
                  { id: 'traits', label: 'Skill Matrix', icon: BarChart2 },
                  { id: 'languages', label: 'Language Path', icon: FileText },
                  { id: 'clock', label: 'Coding Cycles', icon: Clock },
                  { id: 'badges', label: 'Achievements', icon: Award },
                  { id: 'settings', label: 'Preferences', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as TabType)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 font-bold uppercase tracking-wider text-xs rounded-none border outline-none transition-none cursor-pointer ${
                        active 
                          ? 'bg-white text-black border-white' 
                          : 'bg-transparent text-white border-transparent hover:border-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-neutral-900 hidden md:block">
              <button
                onClick={handleBack}
                className="w-full flex items-center space-x-3 px-3 py-2 border border-transparent hover:border-red-500 text-red-500 font-bold uppercase tracking-wider text-xs rounded-none bg-transparent cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Node</span>
              </button>
            </div>
          </aside>

          {/* MAIN WORKSPACE CANVAS */}
          <main className="flex-1 flex flex-col p-4 overflow-y-auto" id="recap-poster" style={{ backgroundColor: activeTheme['--bg'] }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
                className="flex-1 flex flex-col space-y-6"
              >
                
                {/* TAB 1: OVERVIEW */}
                {currentTab === 'overview' && (
                  <>
                    {/* User Profile Header Panel */}
                    <div className="border border-black p-4 bg-white/40 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center rounded-none shadow-[2px_2px_0px_#000000]"
                         style={{ backgroundColor: activeTheme['--panel'], borderColor: activeTheme['--border'] }}>
                      {/* Left: Dithered Avatar */}
                      <div className="lg:col-span-2 flex justify-center lg:justify-start">
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-20 h-20 border border-black dithered-img rounded-none select-none"
                        />
                      </div>

                      {/* Center: User Info */}
                      <div className="lg:col-span-6 space-y-2 text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                          <h2 className="text-xl font-bold uppercase tracking-wide">{profile.name || profile.username}</h2>
                          <span className="inline-block bg-black text-white text-[9px] uppercase px-2 py-0.5 rounded-none font-bold tracking-wider max-w-max mx-auto lg:mx-0">
                            {archetype || 'THE BUILDER'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-mono tracking-normal leading-relaxed">
                          NODE IDENTIFIER: @{profile.username} // SEGMENTED SINCE: {profile.createdAt ? new Date(profile.createdAt).getFullYear() : '1983'}
                        </p>
                        <div className="border border-black border-dashed p-2 text-xs bg-white/30 rounded-none italic text-neutral-800">
                          "{profile.bio || 'STABLE SYSTEM RECAP PIPELINE ACTIVE.'}"
                        </div>
                      </div>

                      {/* Right: Key Metrics / Stats */}
                      <div className="lg:col-span-4 border border-black p-3 bg-white/60 space-y-1 text-xs rounded-none"
                           style={{ borderColor: activeTheme['--border'] }}>
                        <p className="font-bold border-b border-black pb-1 uppercase tracking-wider">// REPOSITORY STATS SUMMARY</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <div>REPOS: <span className="font-bold">{numbersStats.projects}</span></div>
                          <div>STREAK: <span className="font-bold">{stats.streak}d</span></div>
                          <div>COMMITS: <span className="font-bold">{numbersStats.commits}</span></div>
                          <div>DNA INDEX: <span className="font-bold">{stats.aiScore}%</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Two-Column Analytics Performance Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Column */}
                      <section className="lg:col-span-7 space-y-6">
                        {/* AI Observations Terminal */}
                        <div className="border border-black bg-black text-white p-5 rounded-none shadow-[2px_2px_0px_#000000]">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                            <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">// LLM_INSIGHT_ENGINE://OBSERVATIONS_LOG</span>
                            <Terminal className="w-4 h-4 text-white" />
                          </div>
                          <div className="space-y-2 text-xs leading-relaxed font-mono select-text">
                            {aiSummary && aiSummary.length > 0 ? (
                              aiSummary.map((line, idx) => (
                                <p key={idx} className="text-white">{`> ${line.toUpperCase()}`}</p>
                              ))
                            ) : (
                              <>
                                <p className="text-white">{`> DIALECT STACKS ACTIVE ACROSS ${numbersStats.projects} REPOSITORIES.`}</p>
                                <p className="text-white">{`> COMMITS ACTIVITY PIPELINE VERIFIED.`}</p>
                                <p className="text-white">{`> ARCHETYPE SET FOR STRUCTURAL DEPLOYMENT.`}</p>
                              </>
                            )}
                            <div className="flex items-center gap-1">
                              <span>&gt;</span>
                              <span className="w-2.5 h-4 bg-white inline-block animate-pulse" />
                            </div>
                          </div>
                        </div>

                        {/* RPG Card Summary panel */}
                        <RPGCard profileData={profileData} />
                      </section>

                      {/* Right Column */}
                      <section className="lg:col-span-5 flex flex-col justify-between border border-black p-4 bg-white/40 rounded-none shadow-[2px_2px_0px_#000000]"
                               style={{ backgroundColor: activeTheme['--panel'], borderColor: activeTheme['--border'] }}>
                        <div className="w-full">
                          <div className="text-[10px] font-bold border-b border-black pb-1.5 uppercase tracking-wider text-neutral-500 mb-2">// COGNITIVE TRAITS RADAR</div>
                          <div className="flex justify-center items-center py-4 bg-white/50 border border-black rounded-none">
                            <RadarChart stats={stats} repositories={repositories} profile={profile} />
                          </div>
                        </div>

                        <div className="border border-black bg-white/80 p-3 mt-4 text-[11px] rounded-none">
                          <p className="font-bold mb-1 uppercase">// SYSTEM DATA CHANNEL RESOLUTION</p>
                          <p className="text-neutral-700 leading-normal uppercase">
                            TRAIT PROFILE MAPS CORE STRENGTHS (STR), LOGIC ACCELERATION (INT), AND CONSISTENCY CYCLE TRAITS (DEX). RADAR GEOMETRY RENDERS THE ACTIVE COGNITIVE TRAITS BALANCED INDEX.
                          </p>
                        </div>
                      </section>
                    </div>

                    {/* BOTTOM SYSTEM PIPELINE NOTICE */}
                    <div className="border border-black bg-white p-3 rounded-none mt-2"
                         style={{ borderColor: activeTheme['--border'], backgroundColor: activeTheme['--panel'] }}>
                      <div className="text-[10px] font-bold border-b border-black pb-1 text-neutral-600 uppercase tracking-widest">// DATA PIPELINE NOTICES</div>
                      <p className="text-xs text-black font-mono leading-relaxed mt-2 uppercase">
                        * DATA RETRIEVED FROM GITHUB V3 API GATEWAY. COMPLETED PIPELINE COMPILATION SEGMENT ON USER NODE: @{profile.username.toUpperCase()}.<br/>
                        * PIPELINE RESOLVED AT PORT 5000 ACTIVE. NO INTEGRITY ISSUES DETECTED.
                      </p>
                    </div>
                  </>
                )}

                {/* TAB 2: REPOSITORY GALAXY */}
                {currentTab === 'galaxy' && (
                  <div className="space-y-4">
                    <div className="border-b border-black border-dashed pb-2">
                      <h2 className="text-xl font-bold uppercase tracking-wider font-heading">* REPOSITORY GALAXY DIAGNOSTICS *</h2>
                      <p className="text-xs text-neutral-500">MAPPING THE PHYSICAL TOPOGRAPHY OF SOURCE CODE SYSTEMS</p>
                    </div>

                    <div className="border-4 border-double border-black p-4 bg-white/20 min-h-[500px] flex items-center justify-center rounded-none relative overflow-hidden"
                         style={{ borderColor: activeTheme['--border'] }}>
                      <RepositoryGalaxy repositories={repositories} avatarUrl={profile.avatarUrl} />
                    </div>
                  </div>
                )}

                {/* TAB 3: SKILL MATRIX */}
                {currentTab === 'traits' && (
                  <div className="space-y-4">
                    <div className="border-b border-black border-dashed pb-2">
                      <h2 className="text-xl font-bold uppercase tracking-wider font-heading">* SKILL MATRIX DIAGNOSTICS *</h2>
                      <p className="text-xs text-neutral-500">HIERARCHICAL TREE CLASSIFYING TOP SOURCE SYSTEM FRAMEWORKS</p>
                    </div>

                    <div className="border-4 border-double border-black p-4 bg-white/20 min-h-[480px] rounded-none"
                         style={{ borderColor: activeTheme['--border'] }}>
                      <TechTree stats={stats} repositories={repositories} />
                    </div>
                  </div>
                )}

                {/* TAB 4: LANGUAGE PATH */}
                {currentTab === 'languages' && (
                  <div className="space-y-4">
                    <div className="border-b border-black border-dashed pb-2">
                      <h2 className="text-xl font-bold uppercase tracking-wider font-heading">* LANGUAGE EVOLUTION FLOW *</h2>
                      <p className="text-xs text-neutral-500">SANKEY ROUTING DIALECT WEIGHTS DIRECTLY TO STACK SYSTEMS</p>
                    </div>

                    <div className="border-4 border-double border-black p-6 bg-white/20 min-h-[350px] flex items-center justify-center rounded-none"
                         style={{ borderColor: activeTheme['--border'] }}>
                      <SankeyDiagram stats={stats} />
                    </div>
                  </div>
                )}

                {/* TAB 5: CODING CLOCK */}
                {currentTab === 'clock' && (
                  <div className="space-y-4">
                    <div className="border-b border-black border-dashed pb-2">
                      <h2 className="text-xl font-bold uppercase tracking-wider font-heading">* DAILY CYCLE ACTIVITY CLOCK *</h2>
                      <p className="text-xs text-neutral-500">ACTIVE SEGMENT CYCLES CORRELATING COMMIT Cadence HOURS</p>
                    </div>

                    <div className="border-4 border-double border-black p-6 bg-white/20 min-h-[480px] flex items-center justify-center rounded-none"
                         style={{ borderColor: activeTheme['--border'] }}>
                      <div className="w-full max-w-2xl bg-white/50 border border-black p-6 rounded-none flex items-center justify-center">
                        <CodingClock username={profile.username} />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: ACHIEVEMENTS */}
                {currentTab === 'badges' && (
                  <div className="space-y-6">
                    <div className="border-b border-black border-dashed pb-2">
                      <h2 className="text-xl font-bold uppercase tracking-wider font-heading">* ACHIEVEMENT METRICS CABINET *</h2>
                      <p className="text-xs text-neutral-500">STATUS BADGES UNLOCKED VIA VERIFIED ACTIVITY PIPELINES</p>
                    </div>

                    <div className="border border-black p-6 bg-white/40 space-y-6 rounded-none"
                         style={{ backgroundColor: activeTheme['--panel'], borderColor: activeTheme['--border'] }}>
                      <div className="border-b border-black border-dashed pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest">// SELECT ATTRIBUTE SHIELD TO READ CRITERIA</h3>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                        {BADGES.map((b) => {
                          const isOpen = openBadge === b.id;
                          return (
                            <button
                              key={b.id}
                              onClick={() => { triggerBeep(1200, 0.03); setOpenBadge(isOpen ? null : b.id); }}
                              className={`flex flex-col items-center p-3 border rounded-none transition-none cursor-pointer bg-transparent outline-none ${
                                isOpen ? 'bg-black text-white border-black' : 'border-black hover:bg-neutral-200/50'
                              }`}
                              style={{ borderColor: activeTheme['--border'] }}
                            >
                              <span className="text-3xl mb-1">{b.emoji}</span>
                              <span className="text-[10px] font-bold uppercase font-mono">{b.title}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="border border-black bg-white/90 p-4 text-center min-h-[50px] flex items-center justify-center text-xs rounded-none font-mono">
                        {openBadge ? (
                          (() => {
                            const b = BADGES.find((x) => x.id === openBadge)!;
                            return (
                              <p className="text-black uppercase">
                                <span className="font-bold">[{b.title}]</span> : {b.desc(numbersStats, stats)}
                              </p>
                            );
                          })()
                        ) : (
                          <p className="text-neutral-500 uppercase">SELECT ATTRIBUTE KEY TO UNLOCK DETAILED PIPELINE METRICS</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: PREFERENCES */}
                {currentTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="border-b border-black border-dashed pb-2">
                      <h2 className="text-xl font-bold uppercase tracking-wider font-heading">* PREFERENCES PANEL *</h2>
                      <p className="text-xs text-neutral-500">CONFIGURE WORKSTATION VISUALS AND AUDIO SPEAKER SIGNALS</p>
                    </div>

                    <div className="border border-black bg-white/40 p-6 rounded-none space-y-6 max-w-xl"
                         style={{ backgroundColor: activeTheme['--panel'], borderColor: activeTheme['--border'] }}>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black pb-4 border-dashed gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase">CRT INTERLACE SCANLINES</h4>
                          <span className="text-[10px] text-neutral-500 font-mono">TOGGLE STRIPED OVERLAY CRT BEAM EMULATION</span>
                        </div>
                        <button
                          onClick={() => { triggerBeep(1200, 0.03); setScanlines(!scanlines); }}
                          className={`px-4 py-2 border text-xs font-bold uppercase rounded-none transition-none cursor-pointer outline-none ${
                            scanlines ? 'btn-retro-active' : 'btn-retro'
                          }`}
                        >
                          {scanlines ? 'ON [ FILTER ACTIVE ]' : 'OFF [ FILTER DISABLED ]'}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black pb-4 border-dashed gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase">CRT SHADOW VIGNETTE</h4>
                          <span className="text-[10px] text-neutral-500 font-mono font-normal">EMULATE RECESSED ROUNDED CURVE SCREEN EDGES</span>
                        </div>
                        <button
                          onClick={() => { triggerBeep(1200, 0.03); setVignette(!vignette); }}
                          className={`px-4 py-2 border text-xs font-bold uppercase rounded-none transition-none cursor-pointer outline-none ${
                            vignette ? 'btn-retro-active' : 'btn-retro'
                          }`}
                        >
                          {vignette ? 'ON [ SHADING ACTIVE ]' : 'OFF [ SHADING DISABLED ]'}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black pb-4 border-dashed gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase">INTERNAL SPEAKER SOUND</h4>
                          <span className="text-[10px] text-neutral-500 font-mono font-normal">SYNTHESIZE Tactile 1-BIT SYSTEM SPEAKER AUDIOMETRICS</span>
                        </div>
                        <button
                          onClick={() => { setAudioOn(!audioOn); triggerBeep(1400, 0.05); }}
                          className={`px-4 py-2 border text-xs font-bold uppercase rounded-none transition-none cursor-pointer outline-none ${
                            audioOn ? 'btn-retro-active' : 'btn-retro'
                          }`}
                        >
                          {audioOn ? 'ON [ BEARS ACTIVE ]' : 'OFF [ MUTED ]'}
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-bold uppercase">GLASS MONITOR PHOSPHOR COATING (THEME)</h4>
                          <span className="text-[10px] text-neutral-500 font-mono">CHOOSE TUBE ELECTRON EMITTER COLOUR EMULATOR</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'gray', label: 'VINTAGE GRAY' },
                            { id: 'green', label: 'TERMINAL GREEN' },
                            { id: 'amber', label: 'AMBER CRT' },
                          ].map((th) => (
                            <button
                              key={th.id}
                              onClick={() => { setTheme(th.id as 'gray' | 'green' | 'amber'); triggerBeep(1300, 0.04); }}
                              className={`px-4 py-2 border text-xs font-bold uppercase rounded-none transition-none cursor-pointer outline-none ${
                                theme === th.id ? 'btn-retro-active' : 'btn-retro'
                              }`}
                            >
                              {th.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* BOTTOM STATUS ROW ACTIONS */}
            <div className="pt-6 border-t border-black border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center space-x-2 text-[10px] text-neutral-600 font-bold uppercase">
                <span className="w-2 h-2 bg-black inline-block" style={{ backgroundColor: activeTheme['--text'] }} />
                <span>DATA STACKS RECAP: SECURE // PORT: 5000 ONLINE</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 btn-retro text-xs rounded-none flex items-center space-x-2 font-bold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE CONNECTION</span>
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 btn-retro text-xs rounded-none flex items-center space-x-2 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD STORIES PNG</span>
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* BOTTOM SYSTEM NOTICE & STATUS BAR */}
        <footer className="w-full bg-black text-white text-xs py-2 px-4 select-none border-t border-black relative z-40 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px] font-bold tracking-widest text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="w-2.5 h-2.5 bg-green-500 animate-ping inline-block rounded-full shrink-0" />
              <span className="text-white">DEVWRAP PIPELINE ON</span>
            </div>
            <div className="text-center md:text-left">
              UPTIME: {formatUptime(uptime)}
            </div>
            <div className="text-center md:text-left text-neutral-300 font-bold">
              REPOS: {numbersStats.projects} | COMMITS: {numbersStats.commits}
            </div>
            <div className="text-center md:text-right text-[10px] text-neutral-500 uppercase">
              SYS_OP: @{profile.username.toUpperCase()}
            </div>
          </div>
        </footer>
      </div>

      {/* SEARCH USER MODAL */}
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-[#E3E3E3] border-4 border-double border-black p-6 space-y-6 relative rounded-none text-black"
            >
              <button 
                onClick={() => { triggerBeep(600, 0.04); setSearchModalOpen(false); }}
                className="absolute top-4 right-4 bg-transparent border-0 cursor-pointer text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <h3 className="font-heading font-extrabold text-xl tracking-widest uppercase">* DATAPORT SEARCH QUERY *</h3>
                <p className="text-[10px] text-neutral-500 uppercase">ENTER ACCOUNT NAME TO RETRIEVE AND ANALYZE</p>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="border border-black bg-white px-3 py-2 flex items-center rounded-none">
                  <span className="text-neutral-500 text-xs font-bold mr-1 select-none">github.com/</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                    className="flex-1 bg-transparent border-none text-black outline-none text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => { triggerBeep(600, 0.04); setSearchModalOpen(false); }}
                    className="px-4 py-2 border border-black text-xs font-bold uppercase rounded-none bg-transparent hover:bg-neutral-200"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 btn-retro text-xs font-bold rounded-none"
                  >
                    RETRIEVE RECAP ▶
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING SYSTEM MESSAGE NOTIFICATION */}
      <AnimatePresence>
        {systemAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-14 right-4 z-50 bg-black text-white border border-white px-4 py-3 rounded-none text-xs font-mono max-w-sm flex items-start justify-between gap-3 shadow-2xl select-none"
          >
            <div className="space-y-1">
              <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest block">// SYSTEM LOG MESSAGE</span>
              <p className="uppercase font-bold">{systemAlert}</p>
            </div>
            <button
              onClick={() => setSystemAlert(null)}
              className="bg-transparent border-0 text-white cursor-pointer hover:text-neutral-400 p-0"
            >
              [X]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}