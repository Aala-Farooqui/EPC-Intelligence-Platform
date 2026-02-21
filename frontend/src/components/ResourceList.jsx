import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:8000";

const ResourceList = ({ resources, refresh }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const handleAddResource = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BACKEND_URL}/resources`, {
        id: Number(id),
        name,
        type
      });

      setId("");
      setName("");
      setType("");

      refresh();
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  return (
    <div className="resource-list p-4 bg-white shadow rounded h-[500px] flex flex-col">
      <h2 className="text-xl font-bold mb-2">Resources</h2>

      {/* FORM SECTION */}
      <form
        onSubmit={handleAddResource}
        className="flex flex-col space-y-3 mb-4"
      >
        <input
          type="number"
          placeholder="Resource ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="border p-3 w-full rounded"
          required
        />

        <input
          type="text"
          placeholder="Resource Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-3 w-full rounded"
          required
        />

        <input
          type="text"
          placeholder="Resource Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-3 w-full rounded"
          required
        />

        {/* Spacer pushes button down */}
        <div className="flex-1 min-h-[5px]"></div>


        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full mt-auto"
        >
          Add Resource
        </button>
      </form>

      {/* Scrollable Resource List */}
      <div className="flex-1 overflow-y-auto pr-2">
        {resources.length === 0 ? (
          <p className="text-gray-500">No resources available</p>
        ) : (
          <ul className="space-y-2">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="p-3 border rounded bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{resource.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Type: {resource.type}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResourceList;
