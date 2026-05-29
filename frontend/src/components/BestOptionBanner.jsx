import React from 'react';

const MODE_ICONS = {
  bus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="8" y2="17" />
      <line x1="16" y1="21" x2="16" y2="17" />
      <path d="M6 8h12v4H6z" />
    </svg>
  ),
  metro: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M6 8h12M6 12h12M6 16h12" />
      <circle cx="7" cy="19" r="1" fill="currentColor" />
      <circle cx="17" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
  train: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="16" rx="2" />
      <path d="M4 10h16" />
      <line x1="8" y1="22" x2="8" y2="18" />
      <line x1="16" y1="22" x2="16" y2="18" />
      <line x1="8" y1="22" x2="16" y2="22" />
      <circle cx="8.5" cy="14" r="1" fill="currentColor" />
      <circle cx="15.5" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
};

const MODE_LABELS = {
  bus: 'Bus',
  metro: 'Metro',
  train: 'Train',
  walk: 'Walk',
};

const MODE_VERB = {
  bus: 'Board bus',
  metro: 'Board metro',
  train: 'Board train',
  walk: 'Walk from',
};

const BestOptionBanner = ({ bestOption, fromStop }) => {
  if (!bestOption) return null;

  // Detect the mode of the first leg from the journey path if available
  const firstStep = bestOption.journey?.[0];
  const mode = firstStep?.mode || 'bus';
  const verb = MODE_VERB[mode] || 'Board';
  const modeLabel = MODE_LABELS[mode] || 'Bus';
  const modeIcon = MODE_ICONS[mode] || MODE_ICONS.bus;

  // Unique modes in the journey for summary
  const allModes = bestOption.journey
    ? [...new Set(bestOption.journey.map(s => s.mode || 'bus'))]
    : [mode];

  return (
    <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-500/20 rounded-2xl p-5 mb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-slide-in">
      <div>
        <h3 className="text-emerald-700 font-display font-semibold text-lg flex items-center gap-2 m-0 flex-wrap">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-[0.75rem] px-2.5 py-1 rounded-md uppercase tracking-wider">
            Best Choice
          </span>
          Earliest Transit Route
          {/* Mode chips */}
          <span className="flex gap-1.5 ml-1">
            {allModes.filter(m => m !== 'walk').map(m => (
              <span
                key={m}
                className="inline-flex items-center gap-1 text-[0.7rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  backgroundColor:
                    m === 'bus' ? '#d1fae5' : m === 'metro' ? '#ede9fe' : '#dbeafe',
                  color:
                    m === 'bus' ? '#065f46' : m === 'metro' ? '#4c1d95' : '#1e3a8a',
                  border: `1px solid ${m === 'bus' ? '#6ee7b7' : m === 'metro' ? '#c4b5fd' : '#93c5fd'}`,
                }}
              >
                {modeIcon}
                {modeLabel}
              </span>
            ))}
          </span>
        </h3>
        <p className="text-slate-500 text-[0.9rem] font-sans mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-emerald-600">{modeIcon}</span>
          {verb}{' '}
          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-emerald-600 text-[0.85rem]">
            {bestOption.firstBus}
          </span>{' '}
          at {fromStop}
        </p>
      </div>
      <div className="text-left sm:text-right">
        <div className="text-[0.85rem] text-slate-400 font-sans">Next Departure</div>
        <div className="text-2xl font-bold font-display text-slate-800 mt-0.5">
          {bestOption.nextBusInfo?.status === 'running'
            ? `in ${bestOption.nextBusInfo.waitMinutes} mins`
            : bestOption.nextBusInfo?.nextBus || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default BestOptionBanner;
