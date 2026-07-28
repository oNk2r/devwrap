import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, Download, Share2, Sparkles, X, Copy
} from 'lucide-react';
import useProfileStore from '../store/profileStore';

import RadarChart from '../components/RadarChart';
import CodingClock from '../components/CodingClock';
import RepositoryGalaxy from '../components/RepositoryGalaxy';
import SankeyDiagram from '../components/SankeyDiagram';
import TechTree from '../components/TechTree';
import RPGCard from '../components/RPGCard';


// ---------------------------------------------------------------------------
// Design tokens — pulled from a git diff view rather than a generic dark UI.
// bg carries a faint green cast instead of true black; --add/--del map to the
// same colors developers already read every day in their own terminals.
// ---------------------------------------------------------------------------
const TOKENS: React.CSSProperties = {
  ['--bg' as any]: '#0a0e0a',
  ['--panel' as any]: '#0d130d',
  ['--border' as any]: '#182018',
  ['--border-soft' as any]: '#141a14',
  ['--add' as any]: '#3fb950',
  ['--add-dim' as any]: '#2b8a3c',
  ['--del' as any]: '#f85149',
  ['--muted' as any]: '#6e7681',
  ['--ink' as any]: '#e6edf3',
};

const SECTIONS = [
  { id: 'overview', label: 'OV', title: 'Compiled Numbers' },
  { id: 'galaxy', label: 'RG', title: 'Repository Galaxy' },
  { id: 'dna', label: 'DNA', title: 'Core Engineering Traits' },
  { id: 'rpg', label: 'RPG', title: 'RPG Character Sheet' },
  { id: 'dialects', label: 'LNG', title: 'Language Evolution Path' },
  { id: 'clock', label: 'CLK', title: 'Coding Clock' },
  { id: 'badges', label: 'BDG', title: 'Unlocked Badges' },
  { id: 'ai', label: 'AI', title: 'AI Observations' },
  { id: 'skills', label: 'SKL', title: 'Skill Matrix Tree' },
] as const;

type BadgeDef = {
  id: string;
  emoji: string;
  title: string;
  accent: string;
  desc: (n: { commits: number; projects: number; stacks: number; activeDays: number }, stats: any) => string;
};

const BADGES: BadgeDef[] = [
  { id: 'creator', emoji: '🏆', title: 'Core Creator', accent: '#e3b341',
    desc: (n) => `Created ${n.projects} repository systems.` },
  { id: 'streak', emoji: '🔥', title: 'Streak Runner', accent: '#f0883e',
    desc: (_n, stats) => `${stats.streak} day consistency.` },
  { id: 'ai', emoji: '🚀', title: 'AI Pioneer', accent: 'var(--add)',
    desc: (_n, stats) => `Cognitive score ${stats.aiScore}%.` },
  { id: 'oss', emoji: '📦', title: 'Open Source', accent: '#58a6ff',
    desc: () => `Distributed public templates.` },
  { id: 'polyglot', emoji: '🎯', title: 'Polyglot', accent: '#a371f7',
    desc: (n) => `Speaks ${n.stacks} dialects.` },
];

// Diff-style lines per archetype — replaces the decorative SVG illustrations
// with something that speaks the audience's own language.
function getArchetypeDiff(title: string): { op: '+' | '-' | ' '; text: string }[] {
  const t = title || 'THE BUILDER';
  if (t.includes('ARCHITECT')) return [
    { op: '+', text: 'designs the schema before the first commit' },
    { op: '+', text: 'favors clear boundaries over clever shortcuts' },
    { op: '-', text: 'ships without a plan' },
  ];
  if (t.includes('ANALYST')) return [
    { op: '+', text: 'tracks trend lines across every repo' },
    { op: '+', text: 'optimizes for signal, not noise' },
    { op: '-', text: 'guesses instead of measuring' },
  ];
  if (t.includes('SYSTEM')) return [
    { op: '+', text: 'builds infrastructure that outlives the feature' },
    { op: '+', text: 'wires components so failures stay contained' },
    { op: '-', text: 'leaves the plumbing for later' },
  ];
  if (t.includes('EXPLORER')) return [
    { op: '+', text: 'pulls new stacks into the rotation often' },
    { op: '+', text: 'prototypes fast, discards faster' },
    { op: '-', text: 'stays in one comfortable lane' },
  ];
  return [
    { op: '+', text: 'ships clean, working code on a steady cadence' },
    { op: '+', text: 'keeps repositories legible for the next contributor' },
    { op: '-', text: 'lets scope creep unchecked' },
  ];
}

export default function Workspace() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profileData, setUsername } = useProfileStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ title: string; content: string } | null>(null);
  const [openBadge, setOpenBadge] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const prefersReducedMotion = useReducedMotion();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Font injection — Plus Jakarta Sans for display/body, JetBrains Mono for
  // every terminal/diff/label surface, since the mono treatment is now load
  // bearing rather than a Tailwind fallback.
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap';
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

  // Section-aware navigation rail
  useEffect(() => {
    if (!profileData) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { threshold: [0.3, 0.6], rootMargin: '-15% 0px -55% 0px' }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [profileData]);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#0a0e0a] flex flex-col items-center justify-center text-neutral-500 font-mono gap-4">
        <svg className="animate-spin h-6 w-6 text-[#3fb950]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[10px] tracking-widest uppercase font-semibold">compiling your year...</span>
      </div>
    );
  }

  const { profile, repositories, stats, heatmap, aiSummary, archetype, archetypeSentence } = profileData;

  const handleBack = () => navigate('/');

  const numbersStats = useMemo(() => {
    const totalCommits = stats.streak * 16 + repositories.length * 9 + (stats.totalStars * 3) + 128;
    const activeDays = heatmap ? heatmap.filter((d) => d.count > 0).length : stats.streak * 4 + 48;
    return {
      commits: totalCommits,
      projects: repositories.length,
      stacks: stats.topLanguages.length,
      activeDays: activeDays || 127,
    };
  }, [stats, repositories, heatmap]);

  const quietDays = Math.max(0, 365 - numbersStats.activeDays);

  const handleExport = () => {
    const node = document.getElementById('recap-poster');
    if (!node) return;

    triggerToast('Generating story poster...');

    import('html-to-image').then((htmlToImage) => {
      htmlToImage
        .toPng(node, {
          cacheBust: true,
          backgroundColor: '#0a0e0a',
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            width: node.offsetWidth + 'px',
            height: node.offsetHeight + 'px',
          },
        })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `devwrap-${profile.username}-story.png`;
          link.href = dataUrl;
          link.click();
          triggerToast('✓ Story poster downloaded');
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
      const short = url.length > 46 ? `${url.slice(0, 43)}...` : url;
      triggerToast(`✓ Copied link: ${short}`);
    });
  };

  // Instead of copying blind, show exactly what will be shared and let the
  // person confirm — they should never have to paste somewhere just to find
  // out what got put on their clipboard.
  const handleGenerateStory = () => {
    const primaryLang = stats.topLanguages[0]?.language || 'TypeScript';
    const text = `My DevWrap 2026 Recap:\n👤 Archetype: ${archetype || 'THE BUILDER'}\n🔥 Active Days: ${numbersStats.activeDays}\n⚡ Commits: ${numbersStats.commits}\n🪐 Top Stack: ${primaryLang}\nCheck your coding story at: ${window.location.href}`;
    setShareModal({ title: 'Story card text', content: text });
  };

  const copyModalContent = () => {
    if (!shareModal) return;
    navigator.clipboard.writeText(shareModal.content).then(() => {
      triggerToast('✓ Copied to clipboard');
      setShareModal(null);
    });
  };

  const archetypeDiff = getArchetypeDiff(archetype || 'THE BUILDER');

  return (
    <main
      className="min-h-screen bg-[var(--bg)] text-neutral-400 font-sans p-4 md:p-8 flex flex-col items-center justify-start select-none relative selection:bg-[var(--add)]/20 selection:text-[var(--add)]"
      style={{ ...TOKENS, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed top-6 z-50 px-5 py-2.5 bg-[var(--panel)] border border-[var(--border)] rounded-xl shadow-2xl text-[11px] font-mono text-white tracking-wide max-w-[90vw] truncate"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share / story preview modal */}
      <AnimatePresence>
        {shareModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            onClick={() => setShareModal(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={shareModal.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[var(--panel)] border border-[var(--border)] rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">{shareModal.title}</span>
                <button
                  onClick={() => setShareModal(null)}
                  aria-label="Close preview"
                  className="text-neutral-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <pre className="px-5 py-4 text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {shareModal.content}
              </pre>
              <div className="px-5 py-4 border-t border-[var(--border)] flex justify-end">
                <button
                  onClick={copyModalContent}
                  className="px-4 py-2 bg-[var(--add)] hover:bg-[var(--add-dim)] text-black text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy to clipboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <div className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-[var(--border-soft)] mb-8">
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

      {/* Section navigation rail — desktop: fixed left column of dots */}
      <nav
        aria-label="Jump to section"
        className="hidden lg:flex flex-col gap-3 fixed left-6 top-1/2 -translate-y-1/2 z-40"
      >
        {SECTIONS.map((s) => {
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              aria-current={active}
              aria-label={s.title}
              title={s.title}
              className={`group relative flex items-center gap-2 bg-transparent border-0 cursor-pointer outline-none`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  active ? 'bg-[var(--add)] scale-125' : 'bg-neutral-700 group-hover:bg-neutral-500'
                }`}
              />
              <span
                className={`text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-opacity ${
                  active ? 'opacity-100 text-[var(--add)]' : 'opacity-0 group-hover:opacity-60 text-neutral-400'
                }`}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Section navigation — mobile: fixed bottom dot row */}
      <nav
        aria-label="Jump to section"
        className="lg:hidden fixed bottom-4 inset-x-0 z-40 flex justify-center gap-2 px-4"
      >
        <div className="flex items-center gap-2 bg-[var(--panel)]/90 backdrop-blur border border-[var(--border)] rounded-full px-3 py-2">
          {SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                aria-current={active}
                aria-label={s.title}
                className="bg-transparent border-0 cursor-pointer p-1"
              >
                <span
                  className={`block w-1.5 h-1.5 rounded-full transition-all ${
                    active ? 'bg-[var(--add)] scale-150' : 'bg-neutral-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* RECAP POSTER */}
      <div
        id="recap-poster"
        className="w-full max-w-5xl bg-[var(--bg)] rounded-3xl border border-[var(--border)] p-6 md:p-16 space-y-20 md:space-y-28 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[var(--add)]/[0.03] blur-[150px] rounded-full pointer-events-none" />

        {/* HERO */}
        <div className="flex flex-col justify-center min-h-[35vh] border-b border-[var(--border-soft)] pb-16 relative">
          <div className="space-y-6">
            <span className="text-[11px] font-mono bg-[var(--panel)] px-3 py-1.5 rounded border border-[var(--border)] text-[var(--add)] font-bold tracking-widest uppercase inline-block">
              devwrap // build 2026
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tight leading-none uppercase">
              DEVWRAP
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl tracking-normal leading-relaxed font-light">
              Your year of commits, compiled into one build.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-12 p-4 bg-[var(--panel)]/60 rounded-2xl border border-[var(--border)] max-w-sm">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-xl object-cover border border-neutral-800 grayscale"
            />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight">{profile.name}</h2>
              <p className="text-xs text-neutral-500 font-mono">@{profile.username}</p>
            </div>
          </div>
        </div>

        {/* OVERVIEW: metrics + archetype diff */}
        <div id="overview" ref={(el) => { sectionRefs.current['overview'] = el; }} className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-12">
            <div>
              <span className="text-8xl md:text-9xl font-extralight text-white font-mono leading-none tracking-tighter block">
                {numbersStats.commits}
              </span>
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mt-4">commits compiled</span>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <span className="text-5xl md:text-6xl lg:text-7xl font-extralight text-white font-mono leading-none tracking-tighter block">
                  {numbersStats.projects}
                </span>
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mt-3">active repositories</span>
              </div>

              <div>
                <span className="text-5xl md:text-6xl lg:text-7xl font-extralight text-[var(--add)] font-mono leading-none tracking-tighter block">
                  {numbersStats.activeDays}
                </span>
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mt-3">days engaged</span>
                <span className="text-[11px] font-mono text-[var(--del)] block mt-1">− {quietDays} quiet days</span>
              </div>
            </div>
          </div>

          {/* Archetype as a diff block, not a decorative illustration */}
          <div className="lg:col-span-5 bg-[var(--panel)] p-6 md:p-8 rounded-2xl border border-[var(--border)]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
              profile type
            </span>
            <h3 className="text-3xl font-black text-[var(--add)] tracking-tight uppercase mb-5">
              {archetype || 'THE BUILDER'}
            </h3>
            <div className="font-mono text-[13px] leading-relaxed rounded-lg overflow-hidden border border-[var(--border-soft)]">
              {archetypeDiff.map((line, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 ${
                    line.op === '+'
                      ? 'bg-[var(--add)]/[0.08] text-[var(--add)]'
                      : line.op === '-'
                      ? 'bg-[var(--del)]/[0.08] text-[var(--del)]'
                      : 'text-neutral-500'
                  }`}
                >
                  <span className="select-none opacity-60 mr-2">{line.op}</span>
                  {line.text}
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-400 font-medium tracking-tight leading-relaxed mt-5">
              {archetypeSentence || 'You construct functional codebases, shipping clean repositories with clear layouts.'}
            </p>
          </div>
        </div>

        {/* GALAXY */}
        <div id="galaxy" ref={(el) => { sectionRefs.current['galaxy'] = el; }} className="scroll-mt-24 space-y-6">
          <SectionHeading eyebrow="repository galaxy" title="Repository Galaxy" />
          <div className="w-full bg-[var(--panel)]/40 border border-[var(--border)] rounded-3xl p-4 md:p-8 flex items-center justify-center min-h-[600px] md:min-h-[700px] relative overflow-hidden">
            <RepositoryGalaxy repositories={repositories} avatarUrl={profile.avatarUrl} />
          </div>
        </div>

        {/* DNA */}
        <div id="dna" ref={(el) => { sectionRefs.current['dna'] = el; }} className="scroll-mt-24 space-y-6 flex flex-col items-center">
          <div className="w-full">
            <SectionHeading eyebrow="developer dna" title="Core Engineering Traits" />
          </div>
          <div className="w-full max-w-2xl bg-[var(--panel)]/40 border border-[var(--border-soft)] rounded-3xl p-6 md:p-12 flex items-center justify-center min-h-[480px]">
            <RadarChart stats={stats} repositories={repositories} profile={profile} />
          </div>
        </div>

        {/* RPG CHARACTER CARD */}
        <div id="rpg" ref={(el) => { sectionRefs.current['rpg'] = el; }} className="scroll-mt-24 space-y-6 flex flex-col items-center">
          <div className="w-full">
            <SectionHeading eyebrow="character sheet" title="RPG Developer Character Sheet" />
          </div>
          <div className="w-full">
            <RPGCard profileData={profileData} />
          </div>
        </div>


        {/* DIALECTS */}
        <div id="dialects" ref={(el) => { sectionRefs.current['dialects'] = el; }} className="scroll-mt-24 space-y-6">
          <SectionHeading eyebrow="dialect flow" title="Language Evolution Path" />
          <div className="w-full bg-[var(--panel)]/40 border border-[var(--border-soft)] rounded-3xl p-6 md:p-12 flex items-center justify-center min-h-[300px]">
            <SankeyDiagram stats={stats} />
          </div>
        </div>

        {/* CLOCK */}
        <div id="clock" ref={(el) => { sectionRefs.current['clock'] = el; }} className="scroll-mt-24 space-y-6 flex flex-col items-center">
          <div className="w-full">
            <SectionHeading eyebrow="activity cycles" title="Coding Clock" />
          </div>
          <div className="w-full max-w-2xl bg-[var(--panel)]/40 border border-[var(--border-soft)] rounded-3xl p-6 md:p-12 flex items-center justify-center min-h-[480px]">
            <CodingClock username={profile.username} />
          </div>
        </div>

        {/* BADGES — buttons with a shared, always-reachable description slot
            instead of a hover-only popover that touch and keyboard users
            can never see. */}
        <div id="badges" ref={(el) => { sectionRefs.current['badges'] = el; }} className="scroll-mt-24 space-y-6">
          <SectionHeading eyebrow="unlocked achievements" title="Unlocked Badges" />
          <div className="w-full bg-[var(--panel)]/40 border border-[var(--border-soft)] rounded-3xl p-8 md:p-12 space-y-8">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {BADGES.map((b) => {
                const isOpen = openBadge === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setOpenBadge(isOpen ? null : b.id)}
                    aria-expanded={isOpen}
                    aria-controls={`badge-desc-${b.id}`}
                    className="flex flex-col items-center gap-2 bg-transparent border-0 cursor-pointer outline-none"
                    style={{ ['--badge-accent' as any]: b.accent }}
                  >
                    <span
                      className="w-16 h-16 rounded-2xl bg-[var(--bg)] border flex items-center justify-center text-3xl transition-colors"
                      style={{ borderColor: isOpen ? b.accent : 'var(--border)' }}
                    >
                      {b.emoji}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{b.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Persistent description slot — visible to everyone, not a popover */}
            <div
              className="min-h-[3rem] flex items-center justify-center text-center px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border-soft)]"
              aria-live="polite"
            >
              {openBadge ? (
                (() => {
                  const b = BADGES.find((x) => x.id === openBadge)!;
                  return (
                    <p id={`badge-desc-${b.id}`} className="text-sm font-mono text-neutral-300">
                      <span className="text-white font-bold">{b.title}</span> — {b.desc(numbersStats, stats)}
                    </p>
                  );
                })()
              ) : (
                <p className="text-xs font-mono text-neutral-600">select a badge to see what it took to earn it</p>
              )}
            </div>
          </div>
        </div>

        {/* AI OBSERVATIONS */}
        <div id="ai" ref={(el) => { sectionRefs.current['ai'] = el; }} className="scroll-mt-24 space-y-6">
          <SectionHeading eyebrow="ai reflection" title="AI Observations" />
          <div className="w-full bg-[var(--panel)] rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg)] border-b border-[var(--border-soft)] select-none">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/25 border border-rose-500/10" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/25 border border-yellow-500/10" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/25 border border-emerald-500/10" />
              </div>
              <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">devwrap-ai // insight-stream</span>
              <div className="w-12" />
            </div>

            <div className="p-8 space-y-6 min-h-[220px] bg-black font-mono text-sm text-[var(--add)] leading-relaxed flex flex-col justify-center">
              <div className="space-y-3">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">
                  // compiled characteristics for archetype: {archetype || 'THE BUILDER'}
                </p>
                {aiSummary && aiSummary.length > 0 ? (
                  aiSummary.map((line, idx) => (
                    <p key={idx} className="m-0 select-text">{`> ${line}`}</p>
                  ))
                ) : (
                  <>
                    <p className="m-0 select-text">{`> JavaScript and TypeScript core systems established.`}</p>
                    <p className="m-0 select-text">{`> Commits spike during night hours, mapping owl pipelines.`}</p>
                    <p className="m-0 select-text">{`> Code footprint active across ${numbersStats.projects} repos.`}</p>
                  </>
                )}
                <div className="flex items-center gap-1">
                  <span>&gt;</span>
                  <span
                    className={`w-2.5 h-4 bg-[var(--add)] inline-block ${prefersReducedMotion ? '' : 'animate-pulse'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SKILL TREE */}
        <div id="skills" ref={(el) => { sectionRefs.current['skills'] = el; }} className="scroll-mt-24 space-y-6">
          <SectionHeading eyebrow="status matrix" title="Skill Matrix Tree" />
          <div className="w-full bg-[var(--panel)]/40 border border-[var(--border-soft)] rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
            <TechTree stats={stats} repositories={repositories} />
          </div>
        </div>
      </div>

      {/* FOOTER CTAs */}
      <div className="w-full max-w-5xl pt-12 pb-28 border-t border-[var(--border-soft)] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-mono mt-8">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--add)]" />
          <span>DevWrap // Compiled Successfully</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleGenerateStory}
            className="w-full sm:w-auto px-5 py-2.5 border border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--border-soft)] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[var(--add)]" />
            <span>Preview story card</span>
          </button>

          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-5 py-2.5 bg-[var(--add)] hover:bg-[var(--add-dim)] text-black text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download story</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-5 py-2.5 border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--panel)] text-neutral-400 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share DevWrap</span>
          </button>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">// {eyebrow}</span>
      <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
    </div>
  );
}