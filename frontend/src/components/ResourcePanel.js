import React from "react";

const ResourcePanel = ({ resources = [], tasks = [], conflicts = [] }) => {
  // Safety: tasks is always an array
  const getTaskCount = (resId) => {
    return tasks.filter((t) => t.assigned_resources?.includes(resId)).length;
  };

  return (
    <div className="resource-panel p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">Resources Overview</h2>
      {resources.length === 0 ? (
        <p>No resources added yet.</p>
      ) : (
        <ul className="space-y-2">
          {resources.map((r) => (
            <li key={r.id} className="p-2 border rounded flex justify-between">
              <span>{r.name} (ID: {r.id})</span>
              <span>Assigned Tasks: {getTaskCount(r.id)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResourcePanel;
