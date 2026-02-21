import React, { useState } from "react";
import axios from "axios";

const CriticalPath = ({ path, setCriticalPath, backendUrl }) => {
  const [totalDuration, setTotalDuration] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateCriticalPath = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${backendUrl}/critical-path`
      );

      setCriticalPath(response.data.critical_path || []);
      setTotalDuration(response.data.total_duration || 0);

    } catch (error) {
      console.error("Error calculating critical path:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-slate-700">
        Critical Path Analysis
      </h2>

      <button
        onClick={calculateCriticalPath}
        disabled={loading}
        className="bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Calculating..." : "Calculate Critical Path"}
      </button>

      {path && path.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold text-slate-700">
            Total Duration:{" "}
            <span className="text-indigo-600">
              {totalDuration} days
            </span>
          </p>

          <p className="text-sm text-gray-600">
            Path:
          </p>

          <div className="flex flex-wrap gap-2">
            {path.map((id, index) => (
              <span
                key={id}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium"
              >
                {id}
                {index !== path.length - 1 && " →"}
              </span>
            ))}
          </div>
        </div>
      )}

      {path && path.length === 0 && (
        <p className="text-gray-500 text-sm">
          No critical path calculated yet.
        </p>
      )}
    </div>
  );
};

export default CriticalPath;
