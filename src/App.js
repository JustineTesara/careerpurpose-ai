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
      return <ResumeBuilder />;
    case "resume-analyzer":
      return <ResumeAnalyzer />;
    case "career-roadmap":
      return <CareerRoadmap />;
    case "interview-sim":
      return <InterviewSim />;
    case "skill-gap":
      return <SkillGap />;
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

  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar — handles its own API key input and mobile menu */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main content — pt-14 adds space for mobile top bar */}
      <main className="flex-1 overflow-x-hidden pt-14 md:pt-0">
        <PageContent page={currentPage} onNavigate={setCurrentPage} />
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
