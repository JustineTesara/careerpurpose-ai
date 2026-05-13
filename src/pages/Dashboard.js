// src/pages/Dashboard.js
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { callGemini } from "../lib/gemini";

function Dashboard({ onNavigate, apiKey }) {
  const { user } = useAuth();
  const [tip, setTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);

  // Get first name only from Google account
  const firstName = user?.displayName?.split(" ")[0] || "there";

  async function handleGetTip() {
    setTipLoading(true);
    const result = await callGemini(
      `You are a career coach for people from different backgrounds, courses, and career paths — including students, graduates, career shifters, freelancers, and those without a degree. Give one specific, actionable, and motivating career tip for today. Keep it concise (2–3 sentences), direct, practical, and easy to apply in real life.`,
      "daily_tip",
    );
    setTip(result);
    setTipLoading(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600/20 to-teal-600/10 border border-violet-600/20 rounded-2xl p-6 mb-6">
        <h2 className="text-white text-2xl font-bold mb-1">
          Welcome back, {firstName}! 👋
        </h2>
        <p className="text-gray-400 text-sm">
          Ready to level up your career today? Let's get to work.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Jobs Applied",
            value: localStorage.getItem("cp_jobs_count") || "0",
            color: "text-violet-400",
            icon: "💼",
          },
          {
            label: "Mock Interviews",
            value: localStorage.getItem("cp_interviews") || "0",
            color: "text-teal-400",
            icon: "🎤",
          },
          {
            label: "Resumes Built",
            value: localStorage.getItem("cp_resumes") || "0",
            color: "text-amber-400",
            icon: "📄",
          },
          {
            label: "Goals Completed",
            value: localStorage.getItem("cp_goals_done") || "0",
            color: "text-green-400",
            icon: "🎯",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + AI Tip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            ⚡ Quick Actions
          </h3>
          <div className="flex flex-col gap-2">
            {[
              {
                label: "Build New Resume",
                page: "resume-builder",
                color: "bg-violet-600 hover:bg-violet-700 text-white",
              },
              {
                label: "Start Mock Interview",
                page: "interview-sim",
                color: "bg-teal-600 hover:bg-teal-700 text-white",
              },
              {
                label: "Generate Career Roadmap",
                page: "career-roadmap",
                color: "bg-amber-600 hover:bg-amber-700 text-white",
              },
              {
                label: "Write Cover Letter",
                page: "cover-letter",
                color: "bg-gray-700 hover:bg-gray-600 text-white",
              },
            ].map((action) => (
              <button
                key={action.page}
                onClick={() => onNavigate(action.page)}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Daily Tip */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            ✦ AI Career Tip of the Day
          </h3>

          {tip ? (
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{tip}</p>
          ) : (
            <p className="text-gray-600 text-sm mb-4">
              Click the button to get a personalized AI career tip.
            </p>
          )}

          <button
            onClick={handleGetTip}
            disabled={tipLoading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            {tipLoading ? "Thinking..." : "✦ Get AI Tip"}
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: "🔍",
            title: "Resume Analyzer",
            desc: "Get AI feedback on your resume's strengths and ATS score",
            page: "resume-analyzer",
          },
          {
            icon: "📊",
            title: "Skill Gap",
            desc: "See exactly what skills you're missing for your target role",
            page: "skill-gap",
          },
          {
            icon: "📚",
            title: "Learning Hub",
            desc: "Get a free personalized learning plan for any tech skill",
            page: "learning",
          },
        ].map((card) => (
          <button
            key={card.page}
            onClick={() => onNavigate(card.page)}
            className="bg-gray-900 border border-gray-800 hover:border-violet-600/40 rounded-xl p-5 text-left transition group"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-white font-bold text-sm mb-1 group-hover:text-violet-400 transition">
              {card.title}
            </div>
            <div className="text-gray-500 text-xs leading-relaxed">
              {card.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
