import React from "react";

const Header = () => {
  return (
    <header className="flex flex-col items-center justify-center text-center mb-2 sm:mb-4 pt-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-emerald-600 animate-pulse">
          <svg
            width="24"
            height="24"
            className="sm:w-7 sm:h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="8" y2="17" />
            <line x1="16" y1="21" x2="16" y2="17" />
            <path d="M6 8h12v4H6z" />
          </svg>
        </span>
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-600 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight py-1">
          Pathik
        </h1>
      </div>
      <p className="text-slate-500 text-xs sm:text-sm md:text-base font-sans mt-1.5 sm:mt-2 max-w-xs sm:max-w-md px-2">
        Search connection routes across 1,900+ government and private lines
      </p>
    </header>
  );
};

export default Header;
