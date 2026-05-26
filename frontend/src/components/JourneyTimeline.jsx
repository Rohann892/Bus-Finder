import React, { useState } from 'react';

const LegIntermediates = ({ intermediates }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2 font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[0.85rem] text-emerald-600/80 hover:text-emerald-600 transition-colors font-medium cursor-pointer focus:outline-none"
      >
        <svg
          className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {isOpen ? 'Hide stops' : `Show stops in between (${intermediates.length})`}
      </button>

      {isOpen && (
        <div className="mt-2.5 pl-3 border-l border-slate-200 flex flex-col gap-2 animate-slide-in">
          {intermediates.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[0.85rem] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
              <span>{stop}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const JourneyTimeline = ({ journey }) => {
  const { path, estimatedTime, type } = journey;

  // Group steps by bus legs
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
          fromStop: step.stop,
          isTransfer: false
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

  // Map legs to include intermediate stops sequentially from flat path steps
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

    if (toIdx !== -1) {
      currentPathIndex = toIdx;
    }

    return { ...leg, intermediates };
  });

  const getPillColor = (jType) => {
    const norm = jType.toLowerCase();
    if (norm.includes('direct')) {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    } else if (norm.includes('1 change')) {
      return 'bg-teal-100 text-teal-700 border border-teal-200';
    } else {
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
  };

  return (
    <div className="bg-white/85 border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 p-6 mb-4 flex flex-col gap-4 animate-slide-in">
      <div className="flex justify-between items-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider ${getPillColor(type)}`}>
          {type}
        </span>
        <span className="font-display font-semibold text-lg text-emerald-600">
          {estimatedTime?.display || 'Calculating...'}
        </span>
      </div>

      <div className="flex flex-col relative pl-7 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400 before:to-teal-500 before:rounded-sm">
        {legsWithIntermediates.map((leg, index) => (
          <React.Fragment key={index}>
            {/* Boarding Stop */}
            <div className="relative pb-5 last:pb-0">
              <div className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-white border-[3px] border-emerald-500 flex items-center justify-center" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-800 text-base">{leg.fromStop}</span>
                <span className="text-slate-500 text-[0.88rem] font-sans">
                  Board Bus <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-emerald-600 text-[0.85rem]">{leg.bus}</span>
                </span>
                
                {/* Intermediate stops collapsible dropdown */}
                {leg.intermediates && leg.intermediates.length > 0 && (
                  <LegIntermediates intermediates={leg.intermediates} />
                )}
              </div>
            </div>

            {/* Transfer Node */}
            {leg.isTransfer && (
              <div className="relative pb-5 last:pb-0">
                <div className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-white border-[3px] border-teal-500 flex items-center justify-center" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-800 text-base">{leg.toStop}</span>
                  <span className="text-slate-500 text-[0.88rem] font-sans">
                    Alight bus <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-emerald-600 text-[0.85rem]">{leg.bus}</span>
                  </span>
                  <div className="text-teal-600 italic text-[0.85rem] mt-1 flex items-center gap-1.5 font-sans">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Transfer to connecting service (approx. 10m wait)
                  </div>
                </div>
              </div>
            )}

            {/* Arriving Destination Stop */}
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
        ))}
      </div>
    </div>
  );
};

export default JourneyTimeline;
