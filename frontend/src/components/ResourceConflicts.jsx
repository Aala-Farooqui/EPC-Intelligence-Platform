import React from "react";

const ResourceConflicts = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) {
    return <p className="text-gray-500">No conflicts detected.</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto"> {/* <-- Scrollable container */}
      <ul className="space-y-3">
        {conflicts.map((item, idx) => {
          const { conflict = {}, resolution = "No resolution" } = item;
          const {
            resource_name = "Unknown",
            resource_id = "N/A",
            conflicting_tasks = [],
          } = conflict;

          return (
            <li key={idx} className="p-3 border rounded bg-white/70 shadow">
              <div className="font-semibold text-slate-800">
                Resource: {resource_name} (ID: {resource_id})
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Conflicting Tasks: {conflicting_tasks.join(", ")}
              </div>
              <div className="mt-1 text-blue-600 font-medium">
                Suggested Resolution: {resolution}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ResourceConflicts;
