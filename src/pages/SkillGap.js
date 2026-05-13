// src/pages/SkillGap.js
import { useState } from "react";
import { callGemini } from "../lib/gemini";

const jobRoles = [
  "Customer Service Representative",
  "Virtual Assistant",
  "Administrative Assistant",
  "Data Entry Specialist",
  "Social Media Manager",
  "Content Writer",
  "Web Developer",
  "Software Developer",
  "IT Support Specialist",
  "Data Analyst",
  "Digital Marketer",
  "Sales Representative",
  "Human Resources Staff",
  "Accountant / Bookkeeper",
  "Teacher / Tutor",
  "Graphic Designer",
  "Business Analyst",
  "Project Manager",
];

function SkillGap() {
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experience, setExperience] = useState(
    "Fresh Graduate / No Experience",
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    const finalRole = customRole.trim() || role;
    if (!finalRole) {
      alert("Please select or type a target job role.");
      return;
    }
    if (!currentSkills.trim()) {
      alert("Please enter your current skills.");
      return;
    }

    setLoading(true);
    setOutput("");

    const prompt = `Do a skill gap analysis for someone who wants to be a ${finalRole}.

Their current skills: ${currentSkills}
Experience level: ${experience}

Provide this exact structure:

REQUIRED SKILLS FOR ${finalRole.toUpperCase()}:
List the top 10 most important skills needed, mark each as (Essential) or (Helpful)

SKILLS YOU ALREADY HAVE:
From their current skills list, identify which ones match the requirements

SKILLS YOU ARE MISSING:
List missing skills ranked by importance - mark as (HIGH PRIORITY), (MEDIUM), or (LOW)

LEARNING PRIORITY ORDER:
Number the top 5 skills to learn first and why

HOW LONG TO CLOSE THE GAP:
Realistic timeline estimate

FREE RESOURCES FOR TOP 3 MISSING SKILLS:
For each of the top 3 missing skills, list 2 free resources

QUICK WINS THIS WEEK:
3 things they can do in the next 7 days to start closing the gap

Be specific, practical, and encouraging for a Filipino job seeker.`;

    const result = await callGemini(prompt);
    setOutput(result);
    setLoading(false);

    const count = parseInt(localStorage.getItem("cp_skills") || "0") + 1;
    localStorage.setItem("cp_skills", count);
  }

  // Clean markdown from text
  function cleanText(text) {
    return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  }

  // Render output with colored sections
  function renderOutput() {
    if (!output) return null;

    const lines = output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const elements = [];
    let key = 0;

    const sectionColors = {
      "REQUIRED SKILLS": {
        bg: "bg-violet-600/10",
        border: "border-violet-600/30",
        text: "text-violet-400",
      },
      "SKILLS YOU ALREADY": {
        bg: "bg-green-600/10",
        border: "border-green-600/30",
        text: "text-green-400",
      },
      "SKILLS YOU ARE": {
        bg: "bg-red-600/10",
        border: "border-red-600/30",
        text: "text-red-400",
      },
      "LEARNING PRIORITY": {
        bg: "bg-amber-600/10",
        border: "border-amber-600/30",
        text: "text-amber-400",
      },
      "HOW LONG": {
        bg: "bg-teal-600/10",
        border: "border-teal-600/30",
        text: "text-teal-400",
      },
      "FREE RESOURCES": {
        bg: "bg-blue-600/10",
        border: "border-blue-600/30",
        text: "text-blue-400",
      },
      "QUICK WINS": {
        bg: "bg-pink-600/10",
        border: "border-pink-600/30",
        text: "text-pink-400",
      },
    };

    let currentSection = null;
    let currentColor = null;
    let currentItems = [];

    function flushSection() {
      if (!currentSection || currentItems.length === 0) return;
      const color = currentColor || {
        bg: "bg-gray-800/50",
        border: "border-gray-700",
        text: "text-gray-300",
      };
      elements.push(
        <div
          key={`sec-${key++}`}
          className={`${color.bg} border ${color.border} rounded-xl p-5 mb-4`}
        >
          <h3 className={`font-bold text-sm mb-3 ${color.text}`}>
            {cleanText(currentSection)}
          </h3>
          <ul className="flex flex-col gap-2">
            {currentItems.map((item, i) => {
              const isHigh =
                item.toUpperCase().includes("HIGH PRIORITY") ||
                item.toUpperCase().includes("ESSENTIAL");
              const isMedium = item.toUpperCase().includes("MEDIUM");
              const isLow = item.toUpperCase().includes("LOW");
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60"></span>
                  <span
                    className={
                      isHigh
                        ? "text-red-300"
                        : isMedium
                          ? "text-amber-300"
                          : isLow
                            ? "text-gray-400"
                            : "text-gray-300"
                    }
                  >
                    {cleanText(item)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>,
      );
      currentSection = null;
      currentItems = [];
      currentColor = null;
    }

    lines.forEach((line) => {
      const cleaned = cleanText(line);
      const upper = cleaned.toUpperCase();

      // Check if it's a section header
      const matchedKey = Object.keys(sectionColors).find((k) =>
        upper.startsWith(k),
      );

      if (matchedKey) {
        flushSection();
        currentSection = cleaned;
        currentColor = sectionColors[matchedKey];
        return;
      }

      // Bullet or numbered item
      if (
        line.startsWith("-") ||
        line.startsWith("•") ||
        line.startsWith("*") ||
        line.match(/^\d+\./)
      ) {
        const text = cleaned.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, "");
        if (currentSection) {
          currentItems.push(text);
        } else {
          elements.push(
            <li
              key={`b-${key++}`}
              className="flex items-start gap-2 text-gray-300 text-sm mb-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0"></span>
              {text}
            </li>,
          );
        }
        return;
      }

      // Regular text under current section
      if (currentSection) {
        currentItems.push(cleaned);
      } else {
        elements.push(
          <p key={`p-${key++}`} className="text-gray-400 text-sm mb-2">
            {cleaned}
          </p>,
        );
      }
    });

    flushSection();
    return elements;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">
          Skill Gap Analysis
        </h1>
        <p className="text-gray-400 text-sm">
          Find out exactly what skills you need to land your target job
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT — Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Your Profile
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Target Job Role
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Choose a role...</option>
                  {jobRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Or type your own
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. Barista, Chef, Pilot"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Experience Level
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option>Fresh Graduate / No Experience</option>
                  <option>Student (currently studying)</option>
                  <option>Career Shifter</option>
                  <option>Less than 1 year</option>
                  <option>1-2 years</option>
                  <option>3-5 years</option>
                </select>
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Your Current Skills
                  <span className="text-gray-600 ml-1 font-normal">
                    (be honest!)
                  </span>
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                  rows={6}
                  placeholder={
                    "e.g.\n- Basic computer skills\n- MS Word and Excel\n- Good communication\n- Typing (50 WPM)\n- Customer handling"
                  }
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
              >
                {loading ? "📊 Analyzing..." : "📊 Analyze Skill Gap"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Output */}
        <div className="md:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 min-h-96">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-600/20 rounded-lg px-3 py-1 text-xs font-bold">
                ✦ GAP ANALYSIS
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">
                  Analyzing your skill gaps...
                </p>
              </div>
            ) : output ? (
              <div>{renderOutput()}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-gray-400 font-semibold mb-2">
                  Your analysis will appear here
                </h3>
                <p className="text-gray-600 text-sm max-w-sm">
                  Enter your target role and current skills on the left, then
                  click Analyze.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillGap;
