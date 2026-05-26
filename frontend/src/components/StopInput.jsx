import React, { useState, useEffect, useRef } from 'react';

const StopInput = ({ label, value, onChange, stops, placeholder, icon }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setSuggestions([]);
      return;
    }

    const query = value.toLowerCase().trim();
    const filtered = stops
      .filter((stop) => stop.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStart = a.toLowerCase().startsWith(query);
        const bStart = b.toLowerCase().startsWith(query);
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);

    setSuggestions(filtered);
  }, [value, stops]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= suggestions.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectSuggestion = (stopName) => {
    onChange(stopName);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index} className="text-emerald-600 font-semibold">{part}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      <input
        type="text"
        className="w-full pl-12 pr-4 py-4 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-sans outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors pointer-events-none focus-within:text-emerald-500">
        {icon}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200/80 rounded-2xl max-h-60 overflow-y-auto z-[1000] shadow-xl p-2 list-none m-0">
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className={`px-4 py-3 rounded-xl cursor-pointer text-[0.95rem] text-slate-600 transition-all ${
                idx === activeIndex ? 'bg-emerald-500/8 text-emerald-800' : 'hover:bg-emerald-500/8 hover:text-emerald-800'
              }`}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {highlightMatch(suggestion, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StopInput;
