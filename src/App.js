// src/App.js
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import CareerRoadmap from "./pages/CareerRoadmap";
import InterviewSim from "./pages/InterviewSim";
import SkillGap from "./pages/SkillGap";
import CoverLetter from "./pages/CoverLetter";
import JobTracker from "./pages/JobTracker";
import LearningHub from "./pages/LearningHub";
import Productivity from "./pages/Productivity";

function PageContent({ page, onNavigate, apiKey }) {
  switch (page) {
    case "dashboard":
      return <Dashboard onNavigate={onNavigate} apiKey={apiKey} />;
    case "resume-builder":
      return <ResumeBuilder apiKey={apiKey} />;
    case "resume-analyzer":
      return <ResumeAnalyzer />;
    case "skill-gap":
      return <SkillGap />;
    case "career-roadmap":
      return <CareerRoadmap />;
    case "interview-sim":
      return <InterviewSim />;
    case "cover-letter":
      return <CoverLetter />;
    case "job-tracker":
      return <JobTracker />;
    case "learning":
      return <LearningHub />;
    case "productivity":
      return <Productivity />;

    default:
      return (
        <div className="p-8">
          <div className="text-white text-xl font-bold capitalize mb-2">
            {page.replace("-", " ")}
          </div>
          <div className="text-gray-500 text-sm">Coming in the next step!</div>
        </div>
      );
  }
}

function AppShell() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("cp_gemini_key") || "",
  );

  function handleApiKeyChange(e) {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem("cp_gemini_key", val);
  }

  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Left column: Sidebar + API key input */}
      <div className="flex flex-col w-56 min-w-56">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

        <div className="bg-gray-900 border-r border-t border-gray-800 p-3">
          <label className="text-gray-500 text-xs block mb-1">
            Groq API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Paste key here..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-violet-500"
          />
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-violet-400 text-xs mt-1 block hover:underline"
          >
            Get free key &#8594;
          </a>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-x-hidden">
        <PageContent
          page={currentPage}
          onNavigate={setCurrentPage}
          apiKey={apiKey}
        />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
