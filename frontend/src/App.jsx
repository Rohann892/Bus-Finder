import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/Header";
import StopInput from "./components/StopInput";
import BestOptionBanner from "./components/BestOptionBanner";
import TabsContainer from "./components/TabsContainer";
import JourneyTimeline from "./components/JourneyTimeline";
import LoadingSkeleton from "./components/LoadingSkeleton";
import JourneyMap from "./components/JourneyMap";

const API_URL = import.meta.env.VITE_API_URL || "/api/bus";

function App() {
  const [stops, setStops] = useState([]);
  const [fromStop, setFromStop] = useState(
    () => localStorage.getItem("fromStop") || "",
  );
  const [toStop, setToStop] = useState(
    () => localStorage.getItem("toStop") || "",
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem("searchResults");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "all",
  );
  const [selectedJourney, setSelectedJourney] = useState(() => {
    const saved = localStorage.getItem("selectedJourney");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState("");

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem("fromStop", fromStop);
  }, [fromStop]);

  useEffect(() => {
    localStorage.setItem("toStop", toStop);
  }, [toStop]);

  useEffect(() => {
    if (results) {
      localStorage.setItem("searchResults", JSON.stringify(results));
    } else {
      localStorage.removeItem("searchResults");
    }
  }, [results]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedJourney) {
      localStorage.setItem("selectedJourney", JSON.stringify(selectedJourney));
    } else {
      localStorage.removeItem("selectedJourney");
    }
  }, [selectedJourney]);

  // Fetch stops list on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await axios.get(`${API_URL}/allStops`);
        const data = response.data;
        if (data.success && Array.isArray(data.data)) {
          setStops(data.data);
        }
      } catch (err) {
        console.error("Error fetching stops list:", err);
        setError("Unable to load bus stops. Please verify backend is running.");
      }
    };
    fetchStops();
  }, []);

  // Update selected journey when active tab or search results change
  useEffect(() => {
    if (!results) {
      setSelectedJourney(null);
      return;
    }

    let list = [];
    if (activeTab === "all") {
      list = [
        ...(results.direct || []),
        ...(results.oneChange || []),
        ...(results.twoChange || []),
      ];
    } else if (activeTab === "direct") {
      list = results.direct || [];
    } else if (activeTab === "oneChange") {
      list = results.oneChange || [];
    } else if (activeTab === "twoChange") {
      list = results.twoChange || [];
    }

    if (list.length > 0) {
      // Keep current selection if it is in the list, otherwise select the first item
      const exists = list.some(
        (j) => JSON.stringify(j.path) === JSON.stringify(selectedJourney),
      );
      if (!exists) {
        setSelectedJourney(list[0].path);
      }
    } else {
      setSelectedJourney(null);
    }
  }, [activeTab, results]);

  const handleSwap = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!fromStop || !toStop) {
      setError("Please specify both source and destination stops.");
      return;
    }
    if (fromStop.trim() === toStop.trim()) {
      setError("Source and destination stops cannot be identical.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);
    setSelectedJourney(null);

    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: {
          from: fromStop.trim(),
          to: toStop.trim(),
        },
      });
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "No route paths could be resolved.");
      }

      setResults(data.response);
      if (data.response.bestOption?.journey) {
        setSelectedJourney(data.response.bestOption.journey);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while searching connecting routes.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const busIcon = (
    <svg
      width="20"
      height="20"
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
  );

  const markerIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const swapIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m16 3 4 4-4 4M20 7H9M8 21l-4-4 4-4M4 17h11" />
    </svg>
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex flex-col gap-4 sm:gap-6">
      <Header />

      <form
        onSubmit={handleSearch}
        className="bg-white/85 border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 relative">
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
            className="w-full sm:w-12 h-10 sm:h-12 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl cursor-pointer flex items-center justify-center gap-2 sm:gap-0 hover:bg-slate-100 hover:border-emerald-500 hover:text-emerald-600 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 sm:rotate-0"
            onClick={handleSwap}
            title="Swap stops"
          >
            {swapIcon}
            <span className="sm:hidden text-sm font-medium">Swap</span>
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
          className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white font-display font-semibold text-base sm:text-lg cursor-pointer shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Finding Best Routes..." : "Find Routes"}
        </button>
      </form>

      {error && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 text-sm sm:text-base text-left font-sans">
          {error}
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {results && !loading && (
        <div className="flex flex-col gap-3 sm:gap-5">
          <BestOptionBanner
            bestOption={results.bestOption}
            fromStop={fromStop}
            isSelected={
              JSON.stringify(results.bestOption?.journey) ===
              JSON.stringify(selectedJourney)
            }
            onSelect={() =>
              results.bestOption?.journey &&
              setSelectedJourney(results.bestOption.journey)
            }
          />

          {selectedJourney && <JourneyMap path={selectedJourney} />}

          <TabsContainer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            results={results}
          />

          <div className="flex flex-col gap-2">
            {activeTab === "all" && (
              <>
                {results.direct?.map((j, i) => (
                  <JourneyTimeline
                    key={`d-${i}`}
                    journey={j}
                    isSelected={
                      JSON.stringify(j.path) === JSON.stringify(selectedJourney)
                    }
                    onSelect={() => setSelectedJourney(j.path)}
                  />
                ))}
                {results.oneChange?.map((j, i) => (
                  <JourneyTimeline
                    key={`o-${i}`}
                    journey={j}
                    isSelected={
                      JSON.stringify(j.path) === JSON.stringify(selectedJourney)
                    }
                    onSelect={() => setSelectedJourney(j.path)}
                  />
                ))}
                {results.twoChange?.map((j, i) => (
                  <JourneyTimeline
                    key={`t-${i}`}
                    journey={j}
                    isSelected={
                      JSON.stringify(j.path) === JSON.stringify(selectedJourney)
                    }
                    onSelect={() => setSelectedJourney(j.path)}
                  />
                ))}
              </>
            )}

            {activeTab === "direct" &&
              (results.direct?.length > 0 ? (
                results.direct.map((j, i) => (
                  <JourneyTimeline
                    key={`d-${i}`}
                    journey={j}
                    isSelected={
                      JSON.stringify(j.path) === JSON.stringify(selectedJourney)
                    }
                    onSelect={() => setSelectedJourney(j.path)}
                  />
                ))
              ) : (
                <p className="text-slate-500 text-center py-6 font-sans">
                  No direct routes found.
                </p>
              ))}

            {activeTab === "oneChange" &&
              (results.oneChange?.length > 0 ? (
                results.oneChange.map((j, i) => (
                  <JourneyTimeline
                    key={`o-${i}`}
                    journey={j}
                    isSelected={
                      JSON.stringify(j.path) === JSON.stringify(selectedJourney)
                    }
                    onSelect={() => setSelectedJourney(j.path)}
                  />
                ))
              ) : (
                <p className="text-slate-500 text-center py-6 font-sans">
                  No 1-change routes found.
                </p>
              ))}

            {activeTab === "twoChange" &&
              (results.twoChange?.length > 0 ? (
                results.twoChange.map((j, i) => (
                  <JourneyTimeline
                    key={`t-${i}`}
                    journey={j}
                    isSelected={
                      JSON.stringify(j.path) === JSON.stringify(selectedJourney)
                    }
                    onSelect={() => setSelectedJourney(j.path)}
                  />
                ))
              ) : (
                <p className="text-slate-500 text-center py-6 font-sans">
                  No 2-change routes found.
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
