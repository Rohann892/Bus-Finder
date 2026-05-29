import React, { useState } from 'react';

// ── Mode config ──────────────────────────────────────────────────────────────
const MODE_CONFIG = {
  bus: {
    label: 'Bus',
    verb: 'Board Bus',
    color: '#10b981',        // emerald-500
    bg: '#d1fae5',           // emerald-100
    text: '#065f46',         // emerald-900
    border: '#6ee7b7',       // emerald-300
    pill: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    dot: 'border-emerald-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    color: '#8b5cf6',        // violet-500
    bg: '#ede9fe',           // violet-100
    text: '#4c1d95',         // violet-900
    border: '#c4b5fd',       // violet-300
    pill: 'bg-violet-100 text-violet-800 border border-violet-300',
    dot: 'border-violet-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    color: '#3b82f6',        // blue-500
    bg: '#dbeafe',           // blue-100
    text: '#1e3a8a',         // blue-900
    border: '#93c5fd',       // blue-300
    pill: 'bg-blue-100 text-blue-800 border border-blue-300',
    dot: 'border-blue-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    color: '#f59e0b',        // amber-500
    bg: '#fef3c7',           // amber-100
    text: '#78350f',         // amber-900
    border: '#fcd34d',       // amber-300
    pill: 'bg-amber-100 text-amber-800 border border-amber-300',
    dot: 'border-amber-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

// ── Intermediate stop list ───────────────────────────────────────────────────
const LegIntermediates = ({ intermediates, mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cfg = getModeConfig(mode);

  return (
    <div className="mt-2 font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: cfg.color }}
        className="flex items-center gap-1.5 text-[0.85rem] hover:opacity-80 transition-opacity font-medium cursor-pointer focus:outline-none"
      >
        <svg
          className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {isOpen ? 'Hide stops' : `Show stops in between (${intermediates.length})`}
      </button>

      {isOpen && (
        <div className="mt-2.5 pl-3 border-l border-slate-200 flex flex-col gap-2 animate-slide-in">
          {intermediates.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[0.85rem] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color + 'aa' }} />
              <span>{stop}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Mode Badge (inline pill next to route number) ────────────────────────────
const ModeBadge = ({ mode }) => {
  const cfg = getModeConfig(mode);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.78rem] font-semibold ${cfg.pill}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const JourneyTimeline = ({ journey, isSelected, onSelect }) => {
  const { path, estimatedTime, type } = journey;

  // Group consecutive steps by bus route number into legs
  const groupByBus = (steps) => {
    const legs = [];
    let currentBus = null;

    for (const step of steps) {
      if (step.bus !== currentBus) {
        if (currentBus) {
          legs[legs.length - 1].toStop = step.stop;
          legs[legs.length - 1].isTransfer = true;
        }
        legs.push({
          bus: step.bus,
          mode: step.mode || 'bus',
          fromStop: step.stop,
          isTransfer: false,
        });
        currentBus = step.bus;
      }
    }
    if (legs.length > 0 && steps.length > 0) {
      legs[legs.length - 1].toStop = steps[steps.length - 1].stop;
    }
    return legs;
  };

  const legs = groupByBus(path);

  // Attach intermediate stops to each leg
  let currentPathIndex = 0;
  const legsWithIntermediates = legs.map((leg) => {
    const fromIdx = path.findIndex(
      (step, idx) => idx >= currentPathIndex && step.stop === leg.fromStop && step.bus === leg.bus
    );
    const toIdx = path.findIndex(
      (step, idx) => idx > fromIdx && step.stop === leg.toStop && step.bus === leg.bus
    );

    const intermediates =
      fromIdx !== -1 && toIdx !== -1
        ? path.slice(fromIdx + 1, toIdx).map((step) => step.stop)
        : [];

    if (toIdx !== -1) currentPathIndex = toIdx;
    return { ...leg, intermediates };
  });

  // Unique modes used in this journey (for the summary pills)
  const modesUsed = [...new Set(legsWithIntermediates.map(l => l.mode))];

  const getTypePill = (jType) => {
    const norm = jType.toLowerCase();
    if (norm.includes('direct')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (norm.includes('1 change')) return 'bg-teal-100 text-teal-700 border border-teal-200';
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  };

  // Build a compact vertical gradient for the timeline bar based on modes
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
      className={`bg-white/85 border rounded-3xl p-6 mb-4 flex flex-col gap-4 animate-slide-in cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10 bg-gradient-to-br from-white to-emerald-50/20'
          : 'border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* ── Header row ── */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider ${getTypePill(type)}`}>
            {type}
          </span>
          {/* Mode summary pills */}
          {modesUsed.map(m => <ModeBadge key={m} mode={m} />)}
        </div>
        <span className="font-display font-semibold text-lg text-emerald-600">
          {estimatedTime?.display || 'Calculating...'}
        </span>
      </div>

      {/* ── Timeline ── */}
      <div
        className="flex flex-col relative pl-7"
        style={{
          '--timeline-gradient': timelineGradient,
        }}
      >
        {/* Dynamic coloured vertical bar */}
        <div
          className="absolute left-2 top-2 bottom-2 w-[2px] rounded-sm"
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
              <div className="relative pb-5 last:pb-0">
                <div
                  className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-white border-[3px] flex items-center justify-center"
                  style={{ borderColor: cfg.color }}
                />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-800 text-base">{leg.fromStop}</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-[0.88rem] font-sans">
                      {isWalk ? (
                        <>Walk to next stop</>
                      ) : (
                        <>
                          {cfg.verb}{' '}
                          <span
                            className="px-2 py-0.5 rounded-md font-semibold text-[0.85rem]"
                            style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                          >
                            {leg.bus}
                          </span>
                        </>
                      )}
                    </span>
                    <ModeBadge mode={leg.mode} />
                  </div>

                  {/* Intermediate stops */}
                  {leg.intermediates && leg.intermediates.length > 0 && (
                    <LegIntermediates intermediates={leg.intermediates} mode={leg.mode} />
                  )}
                </div>
              </div>

              {/* Transfer Node */}
              {leg.isTransfer && (
                <div className="relative pb-5 last:pb-0">
                  <div
                    className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-white border-[3px] flex items-center justify-center"
                    style={{ borderColor: nextCfg ? nextCfg.color : '#14b8a6' }}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800 text-base">{leg.toStop}</span>
                    <span className="text-slate-500 text-[0.88rem] font-sans">
                      Alight{' '}
                      <span
                        className="px-2 py-0.5 rounded-md font-semibold text-[0.85rem]"
                        style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                      >
                        {leg.bus}
                      </span>
                    </span>
                    {/* Transfer instruction */}
                    <div
                      className="italic text-[0.85rem] mt-1 flex items-center gap-1.5 font-sans"
                      style={{ color: nextCfg ? nextCfg.color : '#0d9488' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {nextLeg
                        ? `Transfer → ${getModeConfig(nextLeg.mode).label} (approx. 10 min wait)`
                        : 'Transfer to connecting service (approx. 10 min wait)'}
                    </div>
                  </div>
                </div>
              )}

              {/* Destination Stop (final leg only) */}
              {index === legsWithIntermediates.length - 1 && (
                <div className="relative pb-0">
                  <div className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-white border-[3px] border-amber-500 flex items-center justify-center" />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800 text-base">{leg.toStop}</span>
                    <span className="text-slate-500 text-[0.88rem] font-sans">Arrive at destination</span>
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
