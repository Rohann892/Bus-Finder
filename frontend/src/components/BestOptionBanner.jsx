import React from 'react';

const BestOptionBanner = ({ bestOption, fromStop }) => {
  if (!bestOption) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-500/20 rounded-2xl p-5 mb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-slide-in">
      <div>
        <h3 className="text-emerald-700 font-display font-semibold text-lg flex items-center gap-2 m-0">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-[0.75rem] px-2.5 py-1 rounded-md uppercase tracking-wider">
            Best Choice
          </span>
          Earliest Transit Route
        </h3>
        <p className="text-slate-500 text-[0.9rem] font-sans mt-1.5">
          Board bus <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-emerald-600 text-[0.85rem]">{bestOption.firstBus}</span> at {fromStop}
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
