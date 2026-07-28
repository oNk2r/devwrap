import { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Dices, RotateCcw } from 'lucide-react';
import type { DevWrapResult } from '../types/github';

interface RPGCardProps {
  profileData: DevWrapResult;
}

interface RPGStat {
  key: string;
  label: string;
  value: number;
  buffVal: number;
  desc: string;
}

interface DailyBuff {
  name: string;
  emoji: string;
  statKey: 'STR' | 'INT' | 'DEX' | 'CHA' | 'LUK';
  bonus: number;
  desc: string;
}

const DAILY_BUFFS: DailyBuff[] = [
  {
    name: "StackOverflow Blessing",
    emoji: "🧙‍♂️",
    statKey: "LUK",
    bonus: 20,
    desc: "Copy-pasted code compiles on the first attempt without syntax warnings."
  },
  {
    name: "Coffee Overclock",
    emoji: "☕",
    statKey: "DEX",
    bonus: 25,
    desc: "Double keystroke acceleration. Side effects include jittery variables."
  },
  {
    name: "TypeScript Barrier",
    emoji: "🛡️",
    statKey: "STR",
    bonus: 15,
    desc: "Shields your code from implicit 'any' leakage during structural building."
  },
  {
    name: "Git Force Push",
    emoji: "🚀",
    statKey: "STR",
    bonus: 25,
    desc: "Bypasses upstream restrictions through pure administrative authority."
  },
  {
    name: "Rubber Duck Telepathy",
    emoji: "🦆",
    statKey: "INT",
    bonus: 20,
    desc: "Commune directly with plastic bath toys to solve critical pointer locks."
  },
  {
    name: "AI Copilot Spark",
    emoji: "🤖",
    statKey: "INT",
    bonus: 15,
    desc: "Generates boilerplate functions instantly. 5% chance of phantom loops."
  },
  {
    name: "Friday Deploy Rush",
    emoji: "🎲",
    statKey: "LUK",
    bonus: 30,
    desc: "Hotfixing in production at 4:55 PM. The ultimate test of fate."
  },
  {
    name: "Forks Magnetism",
    emoji: "🧲",
    statKey: "CHA",
    bonus: 20,
    desc: "Increases visibility. Influencers are 40% more likely to fork your core."
  }
];

export default function RPGCard({ profileData }: RPGCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeBuff, setActiveBuff] = useState<DailyBuff | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollLogs, setRollLogs] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const { profile, repositories, stats, archetype } = profileData;

  // Calculate Base Stats
  const baseStats = useMemo(() => {
    const rawStr = Math.min(99, 30 + repositories.length * 2.5 + Math.floor(stats.totalStars / 10));
    const rawInt = Math.min(99, 25 + stats.topLanguages.length * 10 + Math.floor(stats.aiScore / 8));
    const rawDex = Math.min(99, 20 + stats.streak * 4);
    const rawCha = Math.min(99, 15 + Math.floor(profile.followers * 1.5) + Math.floor(stats.totalStars * 3));
    
    // Hash username for Luck
    const charCodeSum = profile.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rawLuk = Math.min(99, 20 + (charCodeSum % 60) + Math.floor(stats.totalForks * 1.5));

    return {
      STR: Math.round(rawStr),
      INT: Math.round(rawInt),
      DEX: Math.round(rawDex),
      CHA: Math.round(rawCha),
      LUK: Math.round(rawLuk),
    };
  }, [profile, repositories, stats]);

  // Level computation: depends on cumulative skills
  const charLevel = useMemo(() => {
    const sum = baseStats.STR + baseStats.INT + baseStats.DEX + baseStats.CHA + baseStats.LUK;
    return Math.min(100, Math.floor(sum / 4.2));
  }, [baseStats]);

  // Handle Daily Roll Animation
  const handleRollBuff = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRollLogs(["$ executing daily_roll.sh...", "$ scanning stack patterns..."]);

    let iterations = 0;
    const interval = setInterval(() => {
      iterations++;
      const randomBuff = DAILY_BUFFS[Math.floor(Math.random() * DAILY_BUFFS.length)];
      
      if (iterations === 1) {
        setRollLogs(prev => [...prev, `$ fetching spell metrics for key: ${randomBuff.statKey}...`]);
      } else if (iterations === 3) {
        setRollLogs(prev => [...prev, `$ rolling multi-sided dice...`]);
      } else if (iterations === 5) {
        clearInterval(interval);
        setActiveBuff(randomBuff);
        setIsRolling(false);
        setRollLogs(prev => [
          ...prev, 
          `✓ rolled: ${randomBuff.emoji} ${randomBuff.name}!`,
          `>> +${randomBuff.bonus} to attribute: ${randomBuff.statKey} <<`
        ]);
      }
    }, 450);
  };

  const handleClearBuff = () => {
    setActiveBuff(null);
    setRollLogs([]);
  };

  // Compile final stats (base + buff bonuses)
  const finalStats = useMemo<RPGStat[]>(() => {
    return [
      {
        key: 'STR',
        label: 'STR // Strength',
        value: baseStats.STR,
        buffVal: activeBuff?.statKey === 'STR' ? activeBuff.bonus : 0,
        desc: 'Codebase scale, commit sizes, and direct system builds.'
      },
      {
        key: 'INT',
        label: 'INT // Intelligence',
        value: baseStats.INT,
        buffVal: activeBuff?.statKey === 'INT' ? activeBuff.bonus : 0,
        desc: 'Dialect variety, algorithm complexity, and AI logic score.'
      },
      {
        key: 'DEX',
        label: 'DEX // Dexterity',
        value: baseStats.DEX,
        buffVal: activeBuff?.statKey === 'DEX' ? activeBuff.bonus : 0,
        desc: 'Keystroke velocity, compilation stability, and streak consistency.'
      },
      {
        key: 'CHA',
        label: 'CHA // Charisma',
        value: baseStats.CHA,
        buffVal: activeBuff?.statKey === 'CHA' ? activeBuff.bonus : 0,
        desc: 'Social star impact, fork shares, and community footprint.'
      },
      {
        key: 'LUK',
        label: 'LUK // Luck',
        value: baseStats.LUK,
        buffVal: activeBuff?.statKey === 'LUK' ? activeBuff.bonus : 0,
        desc: 'Compiles on first try, code merge approval rate, production deploy safety.'
      }
    ];
  }, [baseStats, activeBuff]);

  const handleExportCard = () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);

    // Give a brief delay for state change to settle
    setTimeout(() => {
      import('html-to-image').then((htmlToImage) => {
        htmlToImage
          .toPng(cardRef.current!, {
            cacheBust: true,
            backgroundColor: '#0a0e0a',
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left',
              width: cardRef.current!.offsetWidth + 'px',
              height: cardRef.current!.offsetHeight + 'px',
            }
          })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `devwrap-${profile.username}-rpg-card.png`;
            link.href = dataUrl;
            link.click();
            setExporting(false);
          })
          .catch((err) => {
            console.error('Failed generating RPG card PNG:', err);
            setExporting(false);
          });
      }).catch((err) => {
        console.error('Failed dynamic import for html-to-image:', err);
        setExporting(false);
      });
    }, 150);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* RPG CARD WRAPPER */}
      <div
        id="rpg-card-export"
        ref={cardRef}
        className="w-full max-w-2xl bg-[#0d130d] border border-[#182018] rounded-3xl p-6 md:p-10 relative overflow-hidden scanlines shadow-2xl selection:bg-[#3fb950]/20 selection:text-[#3fb950]"
      >
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3fb950]/[0.02] blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#3fb950]/[0.01] blur-[80px] rounded-full pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#141a14] pb-6 mb-6 gap-4">
          <div className="flex items-center gap-4">
            {/* Pixel bracket avatar placeholder */}
            <div className="relative border border-neutral-800 bg-neutral-900/60 p-1 w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center rounded-xl overflow-hidden">
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#3fb950]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-[#3fb950]" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-[#3fb950]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#3fb950]" />
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover grayscale brightness-110 contrast-125 rounded-lg"
              />
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono bg-[#0a0e0a] border border-[#182018] px-2 py-0.5 rounded text-neutral-400 uppercase tracking-widest">
                CLASS // {archetype || 'THE BUILDER'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none uppercase">
                {profile.name || profile.username}
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                @{profile.username}
              </p>
            </div>
          </div>

          {/* Level Overlay */}
          <div className="flex flex-col items-end sm:items-end justify-center self-end sm:self-center">
            <span className="text-4xl sm:text-5xl font-black font-mono text-[#3fb950] tracking-tighter leading-none">
              LV. {charLevel}
            </span>
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">
              engineer level
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Attributes Grid (Left 7 Columns) */}
          <div className="md:col-span-7 space-y-5">
            <h4 className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider border-b border-[#141a14] pb-2">
              // Core Attributes
            </h4>
            <div className="space-y-4">
              {finalStats.map((item) => {
                const totalVal = Math.min(100, item.value + item.buffVal);
                const baseBlocksCount = Math.floor(item.value / 10);
                const buffBlocksCount = Math.floor(item.buffVal / 10);
                const emptyBlocksCount = Math.max(0, 10 - baseBlocksCount - buffBlocksCount);

                const filledBaseBlocks = '█'.repeat(baseBlocksCount);
                const filledBuffBlocks = '█'.repeat(buffBlocksCount);
                const emptyBlocks = '░'.repeat(emptyBlocksCount);

                return (
                  <div key={item.key} className="space-y-1 group" title={item.desc}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400 font-semibold group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                      <span className="text-white font-bold flex items-center">
                        <span className={item.buffVal > 0 ? "text-[#3fb950]" : "text-white"}>
                          {totalVal}
                        </span>
                        {item.buffVal > 0 && (
                          <span className="text-[10px] text-[#3fb950] ml-1 font-extrabold animate-pulse">
                            (+{item.buffVal})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center text-[10px] tracking-tight font-mono leading-none select-none">
                      <span className="text-neutral-700">
                        <span className="text-[#3fb950]">{filledBaseBlocks}</span>
                        {item.buffVal > 0 && <span className="text-yellow-500">{filledBuffBlocks}</span>}
                        <span>{emptyBlocks}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buff / Equipment Console (Right 5 Columns) */}
          <div className="md:col-span-5 space-y-5 h-full flex flex-col">
            <h4 className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider border-b border-[#141a14] pb-2 w-full">
              // Spell Console & Buffs
            </h4>
            
            {/* Active Buff Info Card */}
            <div className="flex-1 bg-[#0a0e0a] border border-[#182018] rounded-2xl p-4 flex flex-col justify-center min-h-[140px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {activeBuff ? (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" role="img" aria-label="buff emoji">{activeBuff.emoji}</span>
                      <div>
                        <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                          {activeBuff.name}
                        </h5>
                        <p className="text-[10px] font-mono text-[#3fb950] uppercase tracking-widest font-extrabold mt-0.5">
                          +{activeBuff.bonus} {activeBuff.statKey} attribute boost
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-mono leading-normal">
                      {activeBuff.desc}
                    </p>
                    <button
                      onClick={handleClearBuff}
                      className="text-[9px] font-mono text-red-500 hover:text-red-400 bg-transparent border-0 cursor-pointer p-0 underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Clear Spell
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4 space-y-2"
                  >
                    <Dices className="w-8 h-8 text-neutral-700 mx-auto animate-bounce" />
                    <p className="text-xs font-mono text-neutral-500">
                      No active daily spells cast.
                    </p>
                    <p className="text-[9px] font-mono text-neutral-600 max-w-[180px] mx-auto uppercase">
                      Roll the developer dice below to seek destiny buffs.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Rolling Terminal Simulator logs */}
            {rollLogs.length > 0 && (
              <div className="bg-[#050705] border border-[#141a14] rounded-xl p-3 font-mono text-[9px] text-[#3fb950] space-y-1 max-h-[85px] overflow-y-auto">
                {rollLogs.map((log, idx) => (
                  <p key={idx} className="m-0 truncate leading-relaxed">
                    {log}
                  </p>
                ))}
              </div>
            )}

            {/* Interactive triggers */}
            <button
              onClick={handleRollBuff}
              disabled={isRolling}
              className="w-full py-2.5 bg-[#0a0e0a] hover:bg-[#141a14] border border-[#182018] hover:border-[#3fb950] text-[#3fb950] font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 select-none"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: isRolling ? '1s' : '0s' }} />
              <span>{isRolling ? "CASTING SPELL..." : "ROLL DAILY BUFF"}</span>
            </button>
          </div>
        </div>

        {/* Footer info line on card */}
        <div className="border-t border-[#141a14] pt-4 mt-8 flex justify-between items-center text-[9px] font-mono text-neutral-500">
          <span>DEVWRAP // RPG PROTOCOL v1.0.4</span>
          <span>STABILITY RATE: 99.8%</span>
        </div>
      </div>

      {/* EXPORT CONTROL */}
      <button
        onClick={handleExportCard}
        disabled={exporting}
        className="px-6 py-2.5 bg-[#3fb950] hover:bg-[#2b8a3c] text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>{exporting ? "Compiling PNG..." : "Export Character Card"}</span>
      </button>
    </div>
  );
}
