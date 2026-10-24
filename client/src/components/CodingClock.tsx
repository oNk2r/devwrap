import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Sun, Sunrise } from 'lucide-react';

interface CodingClockProps {
  username: string;
}

export default function CodingClock({ username }: CodingClockProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Compute deterministic activity distribution based on username
  const clockData = useMemo(() => {
    const charCodeSum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mode = charCodeSum % 3; // 0 = Night Owl, 1 = Midday Maker, 2 = Early Bird

    let title = 'Night Owl';
    let subtitle = 'Peak coding sprint: 11 PM – 2 AM';
    let icon = Moon;
    let badgeColor = 'bg-[#C084FC] text-black';
    let peakHours = [22, 23, 0, 1, 2];
    let peakCenter = 0; // midnight

    if (mode === 1) {
      title = 'Midday Maker';
      subtitle = 'Peak coding sprint: 1 PM – 4 PM';
      icon = Sun;
      badgeColor = 'bg-[#FFDE59] text-black';
      peakHours = [12, 13, 14, 15, 16];
      peakCenter = 14;
    } else if (mode === 2) {
      title = 'Early Bird';
      subtitle = 'Peak coding sprint: 7 AM – 10 AM';
      icon = Sunrise;
      badgeColor = 'bg-[#00F5A0] text-black';
      peakHours = [7, 8, 9, 10, 11];
      peakCenter = 9;
    }

    // Generate distribution around the peak center
    const hours = Array.from({ length: 24 }).map((_, h) => {
      let diff = Math.abs(h - peakCenter);
      if (diff > 12) diff = 24 - diff;

      const stdDev = 3.2;
      const val = Math.exp(-0.5 * Math.pow(diff / stdDev, 2));
      const noise = Math.abs(Math.sin(h * 0.78 + charCodeSum)) * 0.15;
      const rawVal = Math.min(100, Math.round((val + noise) * 100));
      const isPeak = peakHours.includes(h);

      return {
        hour: h,
        value: rawVal,
        isPeak,
        label: h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`
      };
    });

    return { title, subtitle, icon, badgeColor, hours, peakHours };
  }, [username]);

  const width = 380;
  const height = 380;
  const cx = width / 2;
  const cy = height / 2;
  const innerR = 65;
  const outerR = 145;

  const IconComponent = clockData.icon;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Top Rhythm Header */}
      <div className="flex items-center justify-between w-full pb-3 border-b-2 border-black border-dashed mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border-2 border-black ${clockData.badgeColor} shadow-[2px_2px_0px_#000]`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">{clockData.title}</h3>
            <p className="text-xs text-neutral-600 font-medium">{clockData.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Visual Polar Clock Section */}
      <div className="relative w-full flex items-center justify-center py-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[340px] overflow-visible">
          {/* Dial circles */}
          <circle cx={cx} cy={cy} r={outerR} fill="#FAF8F5" stroke="#000000" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={(innerR + outerR) / 2} fill="none" stroke="#D1D5DB" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" stroke="#000000" strokeWidth={2} />

          {/* Major Hour Markers (12 AM, 6 AM, 12 PM, 6 PM) */}
          {[
            { h: 0, text: '12AM' },
            { h: 6, text: '6AM' },
            { h: 12, text: '12PM' },
            { h: 18, text: '6PM' }
          ].map(({ h, text }) => {
            const angle = (h * 2 * Math.PI) / 24 - Math.PI / 2;
            const tx = cx + (outerR + 18) * Math.cos(angle);
            const ty = cy + (outerR + 18) * Math.sin(angle);
            return (
              <text
                key={h}
                x={tx}
                y={ty + 4}
                textAnchor="middle"
                className="font-mono text-[10px] font-bold fill-neutral-700 select-none"
              >
                {text}
              </text>
            );
          })}

          {/* Activity Radial Bars */}
          {clockData.hours.map((item) => {
            const angle = (item.hour * 2 * Math.PI) / 24 - Math.PI / 2;
            const length = innerR + (item.value / 100) * (outerR - innerR - 8);
            const x1 = cx + (innerR + 3) * Math.cos(angle);
            const y1 = cy + (innerR + 3) * Math.sin(angle);
            const x2 = cx + length * Math.cos(angle);
            const y2 = cy + length * Math.sin(angle);

            const isHovered = selectedHour === item.hour;
            const barColor = item.isPeak ? '#00F5A0' : isHovered ? '#38BDF8' : '#D1D5DB';
            const barWidth = item.isPeak ? 4.5 : isHovered ? 4.5 : 2.5;

            return (
              <g
                key={item.hour}
                className="cursor-pointer"
                onMouseEnter={() => setSelectedHour(item.hour)}
                onMouseLeave={() => setSelectedHour(null)}
              >
                {/* Activity line */}
                <motion.line
                  initial={{ x2: x1, y2: y1 }}
                  animate={{ x2, y2 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: item.hour * 0.015 }}
                  x1={x1}
                  y1={y1}
                  stroke={barColor}
                  strokeWidth={barWidth}
                  strokeLinecap="round"
                />

                {/* Dot at end of peak hours */}
                {item.isPeak && item.value > 25 && (
                  <circle
                    cx={x2}
                    cy={y2}
                    r={3}
                    fill="#000000"
                    stroke="#00F5A0"
                    strokeWidth={1.5}
                  />
                )}
              </g>
            );
          })}

          {/* Central content overlay */}
          <foreignObject
            x={cx - innerR + 5}
            y={cy - innerR + 5}
            width={(innerR - 5) * 2}
            height={(innerR - 5) * 2}
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-center select-none">
              <span className="text-xl mb-0.5">
                {clockData.title === 'Night Owl' ? '🌙' : clockData.title === 'Early Bird' ? '🌅' : '☀️'}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-tight text-neutral-900 leading-none">
                {selectedHour !== null ? clockData.hours[selectedHour].label : clockData.title.split(' ')[0]}
              </span>
              <span className="font-mono text-[10px] text-neutral-600 font-bold mt-1">
                {selectedHour !== null ? `${clockData.hours[selectedHour].value}% Flow` : 'PEAK CADENCE'}
              </span>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Hourly activity ribbon bar */}
      <div className="w-full mt-3 p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="flex items-center gap-1.5 text-neutral-700">
            <Clock className="w-3.5 h-3.5" />
            <span>24-Hour Cadence Timeline</span>
          </span>
          <span className="font-mono text-[11px] text-neutral-500">
            {selectedHour !== null
              ? `${clockData.hours[selectedHour].label}: ${clockData.hours[selectedHour].value}% Activity`
              : 'Hover bars to inspect'}
          </span>
        </div>

        <div className="grid grid-cols-24 gap-1 items-end h-12 pt-2">
          {clockData.hours.map((item) => {
            const isHovered = selectedHour === item.hour;
            return (
              <div
                key={item.hour}
                onMouseEnter={() => setSelectedHour(item.hour)}
                onMouseLeave={() => setSelectedHour(null)}
                className="h-full flex flex-col justify-end items-center cursor-pointer group"
                title={`${item.label}: ${item.value}%`}
              >
                <div
                  className={`w-full rounded-t-sm transition-all border border-black/40 ${
                    item.isPeak
                      ? 'bg-[#00F5A0]'
                      : isHovered
                      ? 'bg-[#FFDE59]'
                      : 'bg-neutral-300 group-hover:bg-neutral-400'
                  }`}
                  style={{ height: `${Math.max(12, item.value)}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[9px] font-mono font-bold text-neutral-500 mt-1.5">
          <span>12AM</span>
          <span>6AM</span>
          <span>12PM</span>
          <span>6PM</span>
          <span>11PM</span>
        </div>
      </div>
    </div>
  );
}
