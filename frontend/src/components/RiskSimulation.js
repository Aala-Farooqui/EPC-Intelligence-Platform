import React, { useState } from "react";
import RiskChart from "./RiskChart";

const RiskSimulation = () => {
  const [simResults, setSimResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [iterations, setIterations] = useState(1000);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/risk-simulation?iterations=${iterations}`
      );
      const data = await response.json();
  
      // If backend returns raw simulations array
      if (data.simulations) {
        setSimResults(data.simulations);
  
      // If backend returns only stats (min/max/mean/etc)
      } else if (data.min_duration != null && data.max_duration != null) {
        // Generate simulated array for histogram
        const simulatedArray = Array.from({ length: iterations }, () => {
          // Random integer between min and max
          return Math.floor(
            Math.random() * (data.max_duration - data.min_duration + 1) + data.min_duration
          );
        });
        setSimResults(simulatedArray);
  
      } else {
        setSimResults([]);
      }
  
    } catch (err) {
      console.error("Error fetching risk simulation:", err);
      setSimResults([]);
    }
    setLoading(false);
  };
  

  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Risk Simulation</h2>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Iterations:
          <input
            type="number"
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            min={100}
            max={10000}
            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <button
          onClick={runSimulation}
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Running..." : "Run Simulation"}
        </button>
      </div>

      {/* Chart / Message */}
      <div className="mt-4">
        {simResults.length > 0 ? (
          <RiskChart simulationResults={simResults} />
        ) : (
          !loading && <p className="text-gray-500">No simulation data yet.</p>
        )}
      </div>
    </div>
  );
};

export default RiskSimulation;


