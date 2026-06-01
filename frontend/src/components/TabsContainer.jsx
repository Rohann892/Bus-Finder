import React from 'react';

const TabsContainer = ({ activeTab, setActiveTab, results }) => {
  if (!results) return null;

  const tabs = [
    { id: 'all', label: 'All', fullLabel: 'All Routes', count: null },
    { id: 'direct', label: 'Direct', fullLabel: 'Direct', count: results.direct?.length || 0 },
    { id: 'oneChange', label: '1 Change', fullLabel: '1 Change', count: results.oneChange?.length || 0 },
    { id: 'twoChange', label: '2 Changes', fullLabel: '2 Changes', count: results.twoChange?.length || 0 },
  ];

  return (
    <div className="flex gap-1 sm:gap-2 border-b border-slate-200 pb-2 sm:pb-3 mb-3 sm:mb-4 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-display text-xs sm:text-sm font-semibold cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all outline-none whitespace-nowrap shrink-0 ${
              isActive
                ? 'text-emerald-700 bg-emerald-500/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {/* Show shorter label on xs, full label on sm+ */}
            <span className="sm:hidden">{tab.label}</span>
            <span className="hidden sm:inline">{tab.fullLabel}</span>
            {tab.count !== null && (
              <span className={`ml-1 text-[0.68rem] sm:text-[0.75rem] font-bold px-1 sm:px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-emerald-500/20 text-emerald-700' : 'bg-slate-200/80 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabsContainer;
