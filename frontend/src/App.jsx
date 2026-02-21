import React, { useState, useEffect } from "react";
import TaskList from "./components/TaskList";
import ResourceList from "./components/ResourceList";
import CriticalPath from "./components/CriticalPath";
import ResourceConflicts from "./components/ResourceConflicts";
import RiskSimulation from "./components/RiskSimulation";
import ResourcePanel from "./components/ResourcePanel";
import ProjectGraph from "./components/ProjectGraph";
import axios from "axios";

const BACKEND_URL = "http://localhost:8000";

const Card = ({ children }) => (
  <div
    className="
    bg-white/80 backdrop-blur-sm 
    rounded-2xl 
    shadow-lg 
    border border-white/40 
    p-6 
    transition-all duration-300 
    hover:scale-[1.02] hover:shadow-xl
  "
  >
    {children}
  </div>
);

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [criticalPath, setCriticalPath] = useState([]);
  const [resourceConflicts, setResourceConflicts] = useState([]);
  const [analysis, setAnalysis] = useState([]);


  const [loading, setLoading] = useState(false);
  
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskExplanation, setRiskExplanation] = useState("");
  const [conflictExplanation, setConflictExplanation] = useState("");


// 🔎 NLP State
const [nlpQuery, setNlpQuery] = useState("");
const [nlpResponse, setNlpResponse] = useState("");
const [nlpLoading, setNlpLoading] = useState(false);
const [nlpError, setNlpError] = useState("");

const [aiSummary, setAiSummary] = useState("");
const [summaryLoading, setSummaryLoading] = useState(false);

const handleGenerateSummary = async () => {
  if (summaryLoading) return;

  try {
    setSummaryLoading(true);
    setAiSummary("");

    const response = await axios.post(
      `${BACKEND_URL}/generate-summary`
    );

    setAiSummary(response.data.summary);
  } catch (error) {
    console.error("Summary Error:", error);
    setAiSummary("Failed to generate summary.");
  } finally {
    setSummaryLoading(false);
  }
};

  const explainRisks = async () => {
    if (tasks.length === 0) return;
  
    setRiskLoading(true);
  
    try {
      const res = await fetch(`${BACKEND_URL}/risk-analysis/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks,
          resources: resources
        })
      });
  
      const data = await res.json();
      setRiskExplanation(data.explanation || "No explanation returned.");
    } catch (err) {
      console.error("Failed to explain risks:", err);
      setRiskExplanation("Failed to get explanation.");
    }
  
    setRiskLoading(false);
  };
  
  
  useEffect(() => {
    if (tasks.length === 0) {
      setAnalysis([]);
      return;
    }
  
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/critical-path`);
        setCriticalPath(res.data.critical_path);
        setAnalysis(res.data.tasks_analysis);
      } catch (err) {
        console.error("Error fetching analysis:", err);
      }
    };
  
    fetchAnalysis();
  }, [tasks]);  // 🔥 This is the key
  
  // ---------------- FETCH FUNCTIONS ----------------
  
  const fetchTasks = async () => {
    const response = await axios.get(`${BACKEND_URL}/tasks`);
    setTasks(response.data);
  };

  const fetchResources = async () => {
    const response = await axios.get(`${BACKEND_URL}/resources`);
    console.log(response.data);
    setResources(Array.isArray(response.data) ? response.data : response.data.resources || []);
  };

  const fetchCriticalPath = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/critical-path`);
  
      setCriticalPath(res.data.critical_path);
      setAnalysis(res.data.tasks_analysis);   // 👈 IMPORTANT
    } catch (error) {
      console.error(error);
    }
  };
  

  const fetchResourceConflicts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/resource-conflicts`);
      const data = await res.json();
      setResourceConflicts(data.conflicts || []); // <-- use data.conflicts
    } catch (err) {
      console.error(err);
      setResourceConflicts([]);
    }
    setLoading(false);
  };
  

  // Fetch LLM explanation
  const explainConflicts = async () => {
    if (resourceConflicts.length === 0) return;
  
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/resource-conflicts/explain`, { // ✅ Use full backend URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceConflicts), // send the array of conflicts
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      setConflictExplanation(data.explanation || "No explanation returned.");
    } catch (err) {
      console.error("Failed to explain conflicts:", err);
      setConflictExplanation("Failed to get explanation.");
    }
    setLoading(false);
  };
  
  

  useEffect(() => {
    fetchTasks();
    fetchResources();
    fetchCriticalPath();
    fetchResourceConflicts();
  }, []);

  // ---------------- NLP HANDLER ----------------

  const handleAskAI = async () => {
    if (!nlpQuery.trim() || nlpLoading) return;
  
    try {
      setNlpLoading(true);
      setNlpError("");
      setNlpResponse("");
  
      const response = await axios.post(
        `${BACKEND_URL}/nlp-query`,
        { query: nlpQuery.trim() }
      );
  
      setNlpResponse(response?.data?.answer || "No response received.");
    } catch (error) {
      console.error("NLP Error:", error);
  
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.answer ||
        "AI service unavailable.";
  
      setNlpError(message);
    } finally {
      setNlpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-10 py-12 space-y-12">

      {/* ================= HEADER ================= */}
      <div className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            EPC Intelligent Planning Platform
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Schedule Optimization • Resource Intelligence • Risk Analytics
          </p>
        </div>

        {/* 🔎 NLP LAYER */}
<div className="flex gap-4">
  <input
    type="text"
    value={nlpQuery}
    onChange={(e) => setNlpQuery(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleAskAI();
    }}
    placeholder="Ask anything about your project..."
    className="flex-1 p-3 rounded-xl border border-gray-300 shadow-sm"
  />

  <button
    onClick={handleAskAI}
    disabled={nlpLoading}
    className={`px-6 py-3 rounded-xl shadow transition ${
      nlpLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-700 text-white"
    }`}
  >
    {nlpLoading ? "Thinking..." : "Ask AI"}
  </button>
</div>


{/* Error Card */}
{nlpError && (
  <Card>
    <div className="text-red-600 text-sm">
      {nlpError}
    </div>
  </Card>
)} 
        {/* 🔥 NLP RESPONSE CARD */}
        {nlpResponse && !nlpError && (
  <Card>
    <h3 className="text-lg font-semibold text-slate-700 mb-4">
      AI Response
    </h3>
    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
      {nlpResponse}
    </div>
  </Card>
)}
        {/* KPI CARDS */}
        <div className="grid grid-cols-3 gap-8">
          <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-xl">
            <p className="uppercase text-sm opacity-80">Total Tasks</p>
            <p className="text-4xl font-bold mt-3">{tasks.length}</p>
          </div>

          <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-green-500 text-white shadow-xl">
            <p className="uppercase text-sm opacity-80">Resources</p>
            <p className="text-4xl font-bold mt-3">{resources.length}</p>
          </div>

          <div className="rounded-2xl p-6 bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-xl">
            <p className="uppercase text-sm opacity-80">Active Conflicts</p>
            <p className="text-4xl font-bold mt-3">
              {resourceConflicts.length}
            </p>
          </div>
        </div>
      </div>

      {/* ================= EXECUTION OVERVIEW ================= */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-700">
          Execution Overview
        </h2>

        <div className="grid grid-cols-3 gap-8">


          

          <Card>
            <ResourceList resources={resources} refresh={fetchResources} />
          </Card>

          <Card>
            <TaskList tasks={tasks} resourcesList={resources} refresh={fetchTasks} />
          </Card>

          <Card>
            <ResourcePanel
              resources={resources}
              tasks={tasks}
              conflicts={resourceConflicts}
            />
          </Card>

          

        </div>
      </div>


{/* ================= SCHEDULE INTELLIGENCE ================= */}
<div className="space-y-6">
  <h2 className="text-2xl font-semibold text-slate-700">
    Schedule Intelligence
  </h2>

  <div className="grid grid-cols-2 gap-8">

    {/* LEFT: GRAPH (UNCHANGED SIZE) */}
    <Card>
      <ProjectGraph tasks={tasks} criticalPath={criticalPath} />
    </Card>

    {/* RIGHT: STACKED INTELLIGENCE */}
    <div className="space-y-6">

      {/* 🔵 Critical Path */}
      <Card>
        <CriticalPath
          path={criticalPath}
          setCriticalPath={setCriticalPath}
          backendUrl={BACKEND_URL}
        />
      </Card>

      {/* 🟣 Slack + Risk Row */}
      <div className="grid grid-cols-2 gap-6">

        {/* Slack Card */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Task Slack (Days)
          </h3>

          <div className="max-h-48 overflow-y-auto space-y-2 text-sm text-gray-700">
            {tasks.length === 0 && <p>No tasks available</p>}

            {analysis.map((task, index) => (

              <div
                key={index}
                className="flex justify-between border-b pb-1"
              >
                <span>{task.name}</span>
                <span className="font-medium text-indigo-600">
                 {task.slack} days
                 </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Score Card */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Risk Scores
          </h3>

          <div className="max-h-48 overflow-y-auto space-y-2 text-sm text-gray-700">
            {tasks.length === 0 && <p>No tasks available</p>}

            {analysis.map((task, index) => (

              <div
                key={index}
                className="flex justify-between border-b pb-1"
              >
                <span>{task.name}</span>
                <span className="font-medium text-rose-600">
                {task.risk_score}%
                </span>

              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>

  </div>
</div>


      {/* ================= AI RISK & CONFLICT ================= */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-700">
          AI Risk & Conflict Analysis
        </h2>

        <div className="grid grid-cols-2 gap-8">

          
          {/* AI Risk & Delay Analysis */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              AI Risk & Delay Analysis
            </h3>

            <RiskSimulation />

            <div className="flex gap-4 mb-4">
            <button
            onClick={explainRisks}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl"
            disabled={riskLoading || tasks.length === 0}
>
            {riskLoading ? "Generating..." : "Explain Risks"}
            </button>


            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
              {riskExplanation || "AI explanation will appear here..."}
            </div>
          </Card>


           {/* Resource Conflicts */}
           <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700">
          Resource Conflicts
        </h3>
        <button
          onClick={async () => {
            setLoading(true);
            await fetchResourceConflicts();
            setLoading(false);
          }}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <ResourceConflicts conflicts={resourceConflicts} />

      <button
        onClick={explainConflicts}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-xl"
        disabled={loading || resourceConflicts.length === 0}
      >
        {loading ? "Generating..." : "Explain Conflicts"}
      </button>

      <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
        {conflictExplanation && conflictExplanation.trim().length > 0
          ? conflictExplanation
          : `No explanation yet.`}
      </div>
    </Card>



        </div>
      </div>

      {/* 📊 AI Project Summary */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-700">
          📊 AI Project Summary
        </h2>

        <Card>
          <div className="flex gap-4 mb-4">
          <button
          onClick={handleGenerateSummary}
          disabled={summaryLoading}
          className={`px-5 py-2 rounded-xl ${
          summaryLoading
           ? "bg-gray-400"
           : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
>
          {summaryLoading ? "Generating..." : "Generate Project Summary"}
           </button>
            {/* <button className="bg-purple-600 text-white px-5 py-2 rounded-xl">
              Generate Scenario Narrative
            // </button> */}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
            {aiSummary || "AI-generated project summary will appear here..."}
          </div>
        </Card>
      </div>

    </div>

  );
};

export default App;
