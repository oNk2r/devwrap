import { useMemo, useState, useRef } from 'react';
import { Download, Sparkles, Dices } from 'lucide-react';
import type { DevWrapResult } from '../types/github';

interface RPGCardProps {
  profileData: DevWrapResult;
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
    desc: "Copied snippets compile on the very first try without warnings."
  },
  {
    name: "Double Espresso Surge",
    emoji: "☕",
    statKey: "DEX",
    bonus: 25,
    desc: "2x typing speed and blazing mental reflexes all morning."
  },
  {
    name: "TypeScript Strict Mode",
    emoji: "🛡️",
    statKey: "STR",
    bonus: 15,
    desc: "Immune to undefined is not a function and rogue null pointers."
  },
  {
    name: "Direct Prod Deploy",
    emoji: "🚀",
    statKey: "LUK",
    bonus: 30,
    desc: "Merging to main on a Friday at 4:59 PM with zero downtime."
  },
  {
    name: "Rubber Duck Telepathy",
    emoji: "🦆",
    statKey: "INT",
    bonus: 20,
    desc: "Instantly spotting the missing semicolon on the first glance."
  },
  {
    name: "AI Copilot Synergy",
    emoji: "🤖",
    statKey: "INT",
    bonus: 25,
    desc: "Autocomplete generates perfect boilerplates before you even type."
  },
  {
    name: "Viral Open Source Magnet",
    emoji: "⭐",
    statKey: "CHA",
    bonus: 25,
    desc: "Your latest release trends on GitHub explore page overnight."
  }
];

export default function RPGCard({ profileData }: RPGCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeBuff, setActiveBuff] = useState<DailyBuff | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { profile, repositories, stats, archetype, archetypeSentence } = profileData;

  // Calculate Base Stats
  const baseStats = useMemo(() => {
    const rawStr = Math.min(99, 30 + repositories.length * 2.5 + Math.floor(stats.totalStars / 10));
    const rawInt = Math.min(99, 25 + stats.topLanguages.length * 10 + Math.floor(stats.aiScore / 8));
    const rawDex = Math.min(99, 20 + stats.streak * 4);
    const rawCha = Math.min(99, 15 + Math.floor(profile.followers * 1.5) + Math.floor(stats.totalStars * 3));
    const rawLuk = Math.min(99, 40 + (stats.streak % 7) * 8);

    return [
      { key: 'STR', label: 'Strength', value: Math.round(rawStr), color: '#FF6B6B', desc: 'Codebase volume & raw build output' },
      { key: 'INT', label: 'Intellect', value: Math.round(rawInt), color: '#38BDF8', desc: 'Dialect mastery & AI synergy' },
      { key: 'DEX', label: 'Agility', value: Math.round(rawDex), color: '#FFDE59', desc: 'Commit streak cadence & velocity' },
      { key: 'CHA', label: 'Charisma', value: Math.round(rawCha), color: '#C084FC', desc: 'Community stars, forks & followers' },
      { key: 'LUK', label: 'Fortune', value: Math.round(rawLuk), color: '#00F5A0', desc: 'Clean builds & first-try compiles' },
    ];
  }, [profile, repositories, stats]);

  // Roll Buff Handler
  const handleRollBuff = () => {
    if (isRolling) return;
    setIsRolling(true);

    let rollCount = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * DAILY_BUFFS.length);
      setActiveBuff(DAILY_BUFFS[randomIdx]);
      rollCount++;

      if (rollCount >= 8) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 90);
  };

  // Export card
  const handleExportCard = () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);

    import('html-to-image').then((htmlToImage) => {
      htmlToImage
        .toPng(cardRef.current!, {
          cacheBust: true,
          backgroundColor: '#FFFFFF',
        })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${profile.username}-trading-card.png`;
          link.href = dataUrl;
          link.click();
          setExporting(false);
        })
        .catch((err) => {
          console.error(err);
          setExporting(false);
        });
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Trading Card Frame */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white border-[2.5px] border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000] relative overflow-hidden select-none"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="neo-badge bg-[#FFDE59] text-black">
              COLLECTIBLE DEV CARD
            </span>
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-neutral-400">
            #DEV-{profile.username.slice(0, 4).toUpperCase()}
          </span>
        </div>

        {/* Profile Character Banner */}
        <div className="bg-[#FAF8F5] border-2 border-black rounded-2xl p-4 mb-4 relative shadow-[3px_3px_0px_#000]">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-xl border-2 border-black object-cover shadow-[2px_2px_0px_#000]"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-[#00F5A0] text-black text-[9px] font-black px-1.5 py-0.2 rounded-md border border-black">
                PRO
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-black text-lg truncate tracking-tight text-neutral-900">
                  {profile.name || profile.username}
                </h3>
              </div>
              <span className="neo-badge bg-[#C084FC] text-black text-[10px] py-0.5 px-2 mb-1 inline-block">
                {archetype || 'THE ARCHITECT'}
              </span>
              <p className="text-[11px] text-neutral-500 font-mono truncate">
                @{profile.username} • {stats.streak}d streak
              </p>
            </div>
          </div>

          {archetypeSentence && (
            <div className="mt-3 pt-2.5 border-t border-black/20 text-xs text-neutral-700 italic">
              "{archetypeSentence}"
            </div>
          )}
        </div>

        {/* RPG Attributes Grid */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
            <span>Attributes Breakdown</span>
            <span className="font-mono text-[10px] text-neutral-500">MAX 99</span>
          </div>

          {baseStats.map((stat) => {
            const hasBuff = activeBuff?.statKey === stat.key;
            const finalVal = Math.min(99, stat.value + (hasBuff ? activeBuff.bonus : 0));

            return (
              <div
                key={stat.key}
                className="bg-white border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_#000] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 w-28 shrink-0">
                  <span
                    className="font-mono font-black text-xs px-1.5 py-0.5 rounded border border-black"
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.key}
                  </span>
                  <span className="font-bold text-xs">{stat.label}</span>
                </div>

                {/* Meter */}
                <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden border border-black/40">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${finalVal}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>

                <div className="flex items-center gap-1 font-mono text-xs font-black w-14 justify-end">
                  <span>{finalVal}</span>
                  {hasBuff && (
                    <span className="text-emerald-600 text-[10px] animate-pulse">
                      +{activeBuff.bonus}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Daily Buff Slot */}
        <div className="border-2 border-black rounded-xl p-3 bg-[#FAF8F5] mb-4 shadow-[2px_2px_0px_#000]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase text-neutral-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Daily Fortune Buff</span>
            </span>
            <button
              onClick={handleRollBuff}
              disabled={isRolling}
              className="neo-btn neo-btn-primary text-[10px] py-1 px-2.5 rounded-lg"
            >
              <Dices className={`w-3 h-3 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{isRolling ? 'Rolling...' : activeBuff ? 'Reroll' : 'Roll Buff'}</span>
            </button>
          </div>

          {activeBuff ? (
            <div className="flex items-start gap-2.5 bg-white border border-black rounded-lg p-2 mt-1">
              <span className="text-2xl">{activeBuff.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs">{activeBuff.name}</span>
                  <span className="font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded border border-emerald-400">
                    +{activeBuff.bonus} {activeBuff.statKey}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                  {activeBuff.desc}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic text-center py-1">
              Roll the dice to apply today's developer blessing!
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-2 border-t border-black/20">
          <span>DEVWRAP ENGINE 2025</span>
          <span>VERIFIED GITHUB DNA</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleExportCard}
          disabled={exporting}
          className="neo-btn neo-btn-dark px-4 py-2 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{exporting ? 'Exporting...' : 'Download Trading Card (PNG)'}</span>
        </button>
      </div>
    </div>
  );
}
