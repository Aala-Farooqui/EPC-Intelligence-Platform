import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const TaskList = ({ tasks = [], resourcesList = [], refresh }) => {
  const BACKEND_URL = "http://localhost:8000";

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");

  // 🔥 Rename to avoid confusion
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedDependencies, setSelectedDependencies] = useState([]);

  const [showResourceDropdown, setShowResourceDropdown] = useState(false);
  const [showDependencyDropdown, setShowDependencyDropdown] = useState(false);

  const resourceRef = useRef(null);
  const dependencyRef = useRef(null);

  // ✅ Single outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resourceRef.current && !resourceRef.current.contains(event.target)) {
        setShowResourceDropdown(false);
      }

      if (
        dependencyRef.current &&
        !dependencyRef.current.contains(event.target)
      ) {
        setShowDependencyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BACKEND_URL}/tasks`, {
        name,
        duration: Number(duration),
        assigned_resources: selectedResources,
        dependencies: selectedDependencies,
      });

      // ✅ Reset correctly to arrays
      setName("");
      setDuration("");
      setSelectedResources([]);
      setSelectedDependencies([]);

      refresh();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div className="task-list p-4 bg-white shadow rounded h-[500px] flex flex-col">
      <h2 className="text-xl font-bold mb-2">Tasks</h2>

      <form onSubmit={handleAddTask} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Task Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="number"
          placeholder="Duration (days)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

        {/* ---------------- RESOURCE SELECTOR ---------------- */}
        <div className="relative" ref={resourceRef}>
          <div
            className="border p-2 w-full rounded flex flex-wrap gap-2 items-center cursor-text"
            onClick={() => setShowResourceDropdown(true)}
          >
            {selectedResources.map((resId) => {
              const resource = resourcesList.find((r) => r.id === resId);
              return (
                <span
                  key={resId}
                  className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                >
                  {resource?.name}
                </span>
              );
            })}

            <input
              type="text"
              className="flex-1 outline-none min-w-[60px]"
              placeholder={
                selectedResources.length === 0 ? "Select Resources" : ""
              }
              onFocus={() => setShowResourceDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && selectedResources.length > 0) {
                  setSelectedResources(
                    selectedResources.slice(0, -1)
                  );
                }
              }}
            />
          </div>
          {showResourceDropdown && (
           <div className="absolute z-50 bg-white border w-full mt-1 rounded shadow max-h-40 overflow-y-auto">

           {resourcesList.length === 0 && (
           <div className="p-2 text-gray-500 text-sm">
            No resources added yet
            </div>
           )}

           {resourcesList
            .filter((r) => !selectedResources.includes(r.id))
            .map((r) => (
             <div
             key={r.id}
             onClick={() =>
             setSelectedResources([...selectedResources, r.id])
             }
             className="p-2 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-150"
             >
             {r.name}
             </div>
            ))}
           </div>
            )}

        </div>

        {/* ---------------- DEPENDENCY SELECTOR ---------------- */}
        <div className="relative" ref={dependencyRef}>
          <div
            className="border p-2 w-full rounded flex flex-wrap gap-2 items-center cursor-text"
            onClick={() => setShowDependencyDropdown(true)}
          >
            {selectedDependencies.map((depId) => {
              const task = tasks.find((t) => t.id === depId);
              return (
                <span
                  key={depId}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
                >
                  {task?.name}
                </span>
              );
            })}

            <input
              type="text"
              className="flex-1 outline-none min-w-[60px]"
              placeholder={
                selectedDependencies.length === 0
                  ? "Select Dependencies"
                  : ""
              }
              onKeyDown={(e) => {
                if (e.key === "Backspace" && selectedDependencies.length > 0) {
                  setSelectedDependencies(
                    selectedDependencies.slice(0, -1)
                  );
                }
              }}
            />
          </div>

          {showDependencyDropdown && (
          <div className="absolute z-50 bg-white border w-full mt-1 rounded shadow max-h-40 overflow-y-auto">

          {tasks.length === 0 && (
          <div className="p-2 text-gray-500 text-sm">
          No dependencies available (First task)
          </div>
          )}

          {tasks.length > 0 &&
          tasks
         .filter(
          (t) =>
            !selectedDependencies.includes(t.id)
           )
        .map((t) => (
          <div
            key={t.id}
            onClick={() =>
              setSelectedDependencies([...selectedDependencies, t.id])
            }
            className="p-2 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-150"
          >
            {t.name}
          </div>
        ))}
  </div>
)}

        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Add Task
        </button>
      </form>

      {/* ---------------- TASK LIST ---------------- */}
      <div className="flex-1 overflow-y-auto pr-2">
  {tasks.length === 0 ? (
    <p className="text-gray-500">No tasks available</p>
  ) : (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="p-3 border rounded bg-gray-50 flex justify-between"
        >
          {/* Left Stack: Task Name, Duration, Dependencies */}
          <div className="flex flex-col gap-1">
            <div className="font-bold text-gray-800">{task.name}</div>
            <div className="text-sm font-medium text-gray-600">
              Duration: {task.duration} days
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Dependencies:</span>{" "}
              {task.dependencies && task.dependencies.length > 0
                ? task.dependencies.join(", ")
                : "None"}
            </div>
          </div>

          {/* Right Stack: Resources */}
          <div className="flex flex-col gap-1 text-right text-sm text-gray-600">
            <div className="font-semibold">Resources:</div>
            <div>
              {task.assigned_resources && task.assigned_resources.length > 0
                ? task.assigned_resources.join(", ")
                : "No resources assigned yet"}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
    </div>
  );
};

export default TaskList;
