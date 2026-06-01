import React, { useState } from 'react';

// ── Mode config ──────────────────────────────────────────────────────────────
const MODE_CONFIG = {
  bus: {
    label: 'Bus',
    verb: 'Board Bus',
    color: '#10b981',
    bg: '#d1fae5',
    text: '#065f46',
    border: '#6ee7b7',
    pill: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="8" y2="17" />
        <line x1="16" y1="21" x2="16" y2="17" />
        <path d="M6 8h12v4H6z" />
      </svg>
    ),
  },
  metro: {
    label: 'Metro',
    verb: 'Board Metro',
    color: '#8b5cf6',
    bg: '#ede9fe',
    text: '#4c1d95',
    border: '#c4b5fd',
    pill: 'bg-violet-100 text-violet-800 border border-violet-300',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="4" />
        <path d="M6 8h12M6 12h12M6 16h12" />
        <circle cx="7" cy="19" r="1" fill="currentColor" />
        <circle cx="17" cy="19" r="1" fill="currentColor" />
      </svg>
    ),
  },
  train: {
    label: 'Train',
    verb: 'Board Train',
    color: '#3b82f6',
    bg: '#dbeafe',
    text: '#1e3a8a',
    border: '#93c5fd',
    pill: 'bg-blue-100 text-blue-800 border border-blue-300',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="16" rx="2" />
        <path d="M4 10h16" />
        <line x1="8" y1="22" x2="8" y2="18" />
        <line x1="16" y1="22" x2="16" y2="18" />
        <line x1="8" y1="22" x2="16" y2="22" />
        <circle cx="8.5" cy="14" r="1" fill="currentColor" />
        <circle cx="15.5" cy="14" r="1" fill="currentColor" />
      </svg>
    ),
  },
  walk: {
    label: 'Walk',
    verb: 'Walk',
    color: '#f59e0b',
    bg: '#fef3c7',
    text: '#78350f',
    border: '#fcd34d',
    pill: 'bg-amber-100 text-amber-800 border border-amber-300',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7l-2 6h4l-2 6" />
        <path d="M7 13l3-1M17 13l-3-1" />
      </svg>
    ),
  },
};

function getModeConfig(mode) {
  return MODE_CONFIG[mode] || MODE_CONFIG.bus;
}

// ── Intermediate stops toggle ────────────────────────────────────────────────
const LegIntermediates = ({ intermediates, mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cfg = getModeConfig(mode);

  return (
    <div className="mt-1.5 sm:mt-2 font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: cfg.color }}
        className="flex items-center gap-1 sm:gap-1.5 text-[0.78rem] sm:text-[0.85rem] hover:opacity-80 transition-opacity font-medium cursor-pointer focus:outline-none"
      >
        <svg
          className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90' : ''}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {isOpen ? 'Hide stops' : `${intermediates.length} stop${intermediates.length > 1 ? 's' : ''} in between`}
      </button>

      {isOpen && (
        <div className="mt-2 pl-3 border-l border-slate-200 flex flex-col gap-1.5 sm:gap-2 animate-slide-in">
          {intermediates.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-[0.78rem] sm:text-[0.85rem] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color + 'aa' }} />
              <span className="leading-tight">{stop}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Mode Badge ───────────────────────────────────────────────────────────────
const ModeBadge = ({ mode }) => {
  const cfg = getModeConfig(mode);
  return (
    <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[0.68rem] sm:text-[0.78rem] font-semibold ${cfg.pill}`}>
      {cfg.icon}
      <span className="hidden xs:inline sm:inline">{cfg.label}</span>
    </span>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const JourneyTimeline = ({ journey, isSelected, onSelect }) => {
  const { path, estimatedTime, type } = journey;

  const groupByBus = (steps) => {
    const legs = [];
    let currentBus = null;
    for (const step of steps) {
      if (step.bus !== currentBus) {
        if (currentBus) {
          legs[legs.length - 1].toStop = step.stop;
          legs[legs.length - 1].isTransfer = true;
        }
        legs.push({ bus: step.bus, mode: step.mode || 'bus', fromStop: step.stop, isTransfer: false });
        currentBus = step.bus;
      }
    }
    if (legs.length > 0 && steps.length > 0) {
      legs[legs.length - 1].toStop = steps[steps.length - 1].stop;
    }
    return legs;
  };

  const legs = groupByBus(path);

  let currentPathIndex = 0;
  const legsWithIntermediates = legs.map((leg) => {
    const fromIdx = path.findIndex(
      (step, idx) => idx >= currentPathIndex && step.stop === leg.fromStop && step.bus === leg.bus
    );
    const toIdx = path.findIndex(
      (step, idx) => idx > fromIdx && step.stop === leg.toStop && step.bus === leg.bus
    );
    const intermediates = fromIdx !== -1 && toIdx !== -1
      ? path.slice(fromIdx + 1, toIdx).map(s => s.stop)
      : [];
    if (toIdx !== -1) currentPathIndex = toIdx;
    return { ...leg, intermediates };
  });

  const modesUsed = [...new Set(legsWithIntermediates.map(l => l.mode))];

  const getTypePill = (jType) => {
    const norm = jType.toLowerCase();
    if (norm.includes('direct')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (norm.includes('1 change')) return 'bg-teal-100 text-teal-700 border border-teal-200';
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  };

  const timelineGradient = (() => {
    const colors = legsWithIntermediates.map(l => getModeConfig(l.mode).color);
    if (colors.length === 1) return `linear-gradient(to bottom, ${colors[0]}, ${colors[0]})`;
    return `linear-gradient(to bottom, ${colors.join(', ')})`;
  })();

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      tabIndex={0}
      role="button"
      className={`bg-white/85 border rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-3 sm:mb-4 flex flex-col gap-3 sm:gap-4 animate-slide-in cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10 bg-gradient-to-br from-white to-emerald-50/20'
          : 'border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Header row */}
      <div className="flex flex-wrap justify-between items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[0.68rem] sm:text-[0.75rem] font-bold uppercase tracking-wider ${getTypePill(type)}`}>
            {type}
          </span>
          {modesUsed.map(m => <ModeBadge key={m} mode={m} />)}
        </div>
        <span className="font-display font-semibold text-base sm:text-lg text-emerald-600">
          {estimatedTime?.display || 'Calculating...'}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex flex-col relative pl-5 sm:pl-7">
        <div
          className="absolute left-1.5 sm:left-2 top-2 bottom-2 w-[2px] rounded-sm"
          style={{ background: timelineGradient }}
        />

        {legsWithIntermediates.map((leg, index) => {
          const cfg = getModeConfig(leg.mode);
          const isWalk = leg.mode === 'walk';
          const nextLeg = legsWithIntermediates[index + 1];
          const nextCfg = nextLeg ? getModeConfig(nextLeg.mode) : null;

          return (
            <React.Fragment key={index}>
              {/* Boarding Stop */}
              <div className="relative pb-4 sm:pb-5 last:pb-0">
                <div
                  className="absolute -left-5 sm:-left-7 top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-[2.5px] sm:border-[3px] flex items-center justify-center"
                  style={{ borderColor: cfg.color }}
                />
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <span className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">{leg.fromStop}</span>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-slate-500 text-[0.78rem] sm:text-[0.88rem] font-sans">
                      {isWalk ? (
                        <>Walk to next stop</>
                      ) : (
                        <>
                          {cfg.verb}{' '}
                          <span
                            className="px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[0.75rem] sm:text-[0.85rem]"
                            style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                          >
                            {leg.bus}
                          </span>
                        </>
                      )}
                    </span>
                    <ModeBadge mode={leg.mode} />
                  </div>
                  {leg.intermediates && leg.intermediates.length > 0 && (
                    <LegIntermediates intermediates={leg.intermediates} mode={leg.mode} />
                  )}
                </div>
              </div>

              {/* Transfer Node */}
              {leg.isTransfer && (
                <div className="relative pb-4 sm:pb-5 last:pb-0">
                  <div
                    className="absolute -left-5 sm:-left-7 top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-[2.5px] sm:border-[3px] flex items-center justify-center"
                    style={{ borderColor: nextCfg ? nextCfg.color : '#14b8a6' }}
                  />
                  <div className="flex flex-col gap-0.5 sm:gap-1">
                    <span className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">{leg.toStop}</span>
                    <span className="text-slate-500 text-[0.78rem] sm:text-[0.88rem] font-sans">
                      Alight{' '}
                      <span
                        className="px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[0.75rem] sm:text-[0.85rem]"
                        style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                      >
                        {leg.bus}
                      </span>
                    </span>
                    <div
                      className="italic text-[0.75rem] sm:text-[0.85rem] mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5 font-sans"
                      style={{ color: nextCfg ? nextCfg.color : '#0d9488' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {nextLeg
                        ? `Transfer → ${getModeConfig(nextLeg.mode).label} (~10 min wait)`
                        : 'Transfer to connecting service (~10 min wait)'}
                    </div>
                  </div>
                </div>
              )}

              {/* Destination */}
              {index === legsWithIntermediates.length - 1 && (
                <div className="relative pb-0">
                  <div className="absolute -left-5 sm:-left-7 top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-[2.5px] sm:border-[3px] border-amber-500 flex items-center justify-center" />
                  <div className="flex flex-col gap-0.5 sm:gap-1">
                    <span className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">{leg.toStop}</span>
                    <span className="text-slate-500 text-[0.78rem] sm:text-[0.88rem] font-sans">Arrive at destination</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyTimeline;
