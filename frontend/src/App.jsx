import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StopInput from './components/StopInput';
import BestOptionBanner from './components/BestOptionBanner';
import TabsContainer from './components/TabsContainer';
import JourneyTimeline from './components/JourneyTimeline';
import LoadingSkeleton from './components/LoadingSkeleton';

function App() {
  const [stops, setStops] = useState([]);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState('');

  // Fetch stops list on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await fetch('/api/bus/allStops');
        if (!response.ok) throw new Error('Failed to load stops');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setStops(data.data);
        }
      } catch (err) {
        console.error('Error fetching stops list:', err);
        setError('Unable to load bus stops. Please verify backend is running.');
      }
    };
    fetchStops();
  }, []);

  const handleSwap = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!fromStop || !toStop) {
      setError('Please specify both source and destination stops.');
      return;
    }
    if (fromStop.trim() === toStop.trim()) {
      setError('Source and destination stops cannot be identical.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(
        `/api/bus/search?from=${encodeURIComponent(fromStop.trim())}&to=${encodeURIComponent(toStop.trim())}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No route paths could be resolved.');
      }

      setResults(data.response);
    } catch (err) {
      setError(err.message || 'An error occurred while searching connecting routes.');
    } finally {
      setLoading(false);
    }
  };

  const busIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="8" y2="17" />
      <line x1="16" y1="21" x2="16" y2="17" />
      <path d="M6 8h12v4H6z" />
    </svg>
  );

  const markerIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const swapIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m16 3 4 4-4 4M20 7H9M8 21l-4-4 4-4M4 17h11" />
    </svg>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Header />

      <form onSubmit={handleSearch} className="bg-white/85 border border-slate-200/80 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 relative">
          <StopInput
            label="From"
            value={fromStop}
            onChange={setFromStop}
            stops={stops}
            placeholder="Your Location"
            icon={busIcon}
          />
          <button
            type="button"
            className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl cursor-pointer flex items-center justify-center hover:bg-slate-100 hover:border-emerald-500 hover:text-emerald-600 hover:scale-105 active:scale-95 transition-all duration-300 md:rotate-0 rotate-90 shrink-0"
            onClick={handleSwap}
            title="Swap stops"
          >
            {swapIcon}
          </button>
          <StopInput
            label="To"
            value={toStop}
            onChange={setToStop}
            stops={stops}
            placeholder="Destination"
            icon={markerIcon}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white font-display font-semibold text-lg cursor-pointer shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Finding Best Routes...' : 'Find Connection Routes'}
        </button>
      </form>

      {error && (
        <div className="px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 text-left font-sans">
          {error}
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {results && !loading && (
        <div className="flex flex-col gap-5">
          <BestOptionBanner bestOption={results.bestOption} fromStop={fromStop} />

          <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab} results={results} />

          <div className="flex flex-col gap-2">
            {activeTab === 'all' && (
              <>
                {results.direct?.map((j, i) => <JourneyTimeline key={`d-${i}`} journey={j} />)}
                {results.oneChange?.map((j, i) => <JourneyTimeline key={`o-${i}`} journey={j} />)}
                {results.twoChange?.map((j, i) => <JourneyTimeline key={`t-${i}`} journey={j} />)}
              </>
            )}

            {activeTab === 'direct' && (
              results.direct?.length > 0 ? (
                results.direct.map((j, i) => <JourneyTimeline key={`d-${i}`} journey={j} />)
              ) : (
                <p className="text-slate-500 text-center py-6 font-sans">No direct routes found.</p>
              )
            )}

            {activeTab === 'oneChange' && (
              results.oneChange?.length > 0 ? (
                results.oneChange.map((j, i) => <JourneyTimeline key={`o-${i}`} journey={j} />)
              ) : (
                <p className="text-slate-500 text-center py-6 font-sans">No 1-change routes found.</p>
              )
            )}

            {activeTab === 'twoChange' && (
              results.twoChange?.length > 0 ? (
                results.twoChange.map((j, i) => <JourneyTimeline key={`t-${i}`} journey={j} />)
              ) : (
                <p className="text-slate-500 text-center py-6 font-sans">No 2-change routes found.</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
