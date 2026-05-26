import React from 'react';

const TabsContainer = ({ activeTab, setActiveTab, results }) => {
  if (!results) return null;

  const tabs = [
    { id: 'all', label: 'All Routes', count: null },
    { id: 'direct', label: 'Direct', count: results.direct?.length || 0 },
    { id: 'oneChange', label: '1 Change', count: results.oneChange?.length || 0 },
    { id: 'twoChange', label: '2 Changes', count: results.twoChange?.length || 0 },
  ];

  return (
    <div className="flex gap-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto whitespace-nowrap">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-display text-sm sm:text-base font-semibold cursor-pointer px-4 py-2 rounded-xl transition-all outline-none ${
              isActive
                ? 'text-emerald-700 bg-emerald-500/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label} {tab.count !== null && `(${tab.count})`}
          </button>
        );
      })}
    </div>
  );
};

export default TabsContainer;
