import { useMemo, useState } from 'react';
import type { ContributionDay } from '../types/github';
import { Calendar, Flame } from 'lucide-react';

interface ContributionHeatmapProps {
  heatmap?: ContributionDay[];
  streak: number;
}

export default function ContributionHeatmap({ heatmap = [], streak }: ContributionHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

  // Group into weeks or recent slice (last 18-20 weeks)
  const displayDays = useMemo(() => {
    if (!heatmap || heatmap.length === 0) {
      // Generate placeholder year days if none provided
      return Array.from({ length: 140 }).map((_, i) => ({
        date: new Date(Date.now() - (140 - i) * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5),
        level: Math.floor(Math.random() * 4),
      }));
    }
    // Take the most recent 140 days (20 weeks) for clean visual layout
    return heatmap.slice(-140);
  }, [heatmap]);

  const totalCommits = useMemo(() => {
    return displayDays.reduce((acc, d) => acc + d.count, 0);
  }, [displayDays]);

  const activeDaysCount = useMemo(() => {
    return displayDays.filter((d) => d.count > 0).length;
  }, [displayDays]);

  // Level colors in vibrant neo-brutalist palette
  const getLevelColor = (level: number, count: number) => {
    if (count === 0 || level === 0) return '#FAF8F5';
    if (level === 1 || count <= 2) return '#BAF7D0'; // mint light
    if (level === 2 || count <= 5) return '#4ADE80'; // mint medium
    if (level === 3 || count <= 9) return '#22C55E'; // emerald
    return '#15803D'; // deep forest
  };

  return (
    <div className="neo-card p-5 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-black border-dashed">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#00F5A0] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
            <Calendar className="w-4 h-4 text-black" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900">Activity Cadence & Contributions</h3>
            <p className="text-xs text-neutral-600">
              {totalCommits} contributions across {activeDaysCount} active days (Last 20 weeks)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#FFDE59] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" />
            <span>{streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Grid of days */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
          {displayDays.map((day, idx) => {
            const isHovered = hoveredDay?.date === day.date;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-3.5 h-3.5 rounded-sm border border-black/60 transition-all cursor-pointer ${
                  isHovered ? 'scale-125 z-10 shadow-[2px_2px_0px_#000]' : ''
                }`}
                style={{ backgroundColor: getLevelColor(day.level, day.count) }}
              />
            );
          })}
        </div>
      </div>

      {/* Footer stats and legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t-2 border-black/10 text-xs">
        <div className="font-mono text-neutral-600 font-bold">
          {hoveredDay ? (
            <span>
              {hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'} on {hoveredDay.date}
            </span>
          ) : (
            <span className="text-neutral-400">Hover any square to view day metrics</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm border border-black/60 bg-[#FAF8F5]" />
          <div className="w-3 h-3 rounded-sm border border-black/60 bg-[#BAF7D0]" />
          <div className="w-3 h-3 rounded-sm border border-black/60 bg-[#4ADE80]" />
          <div className="w-3 h-3 rounded-sm border border-black/60 bg-[#22C55E]" />
          <div className="w-3 h-3 rounded-sm border border-black/60 bg-[#15803D]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
