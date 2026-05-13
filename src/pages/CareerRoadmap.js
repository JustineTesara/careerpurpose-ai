// src/pages/CareerRoadmap.js
import { useState } from "react";
import { callGemini } from "../lib/gemini";

const careerGoals = [
  "Customer Service Representative",
  "Virtual Assistant",
  "Administrative Assistant",
  "Data Entry Specialist",
  "Social Media Manager",
  "Content Writer",
  "Graphic Designer",
  "Web Developer",
  "Software Developer",
  "IT Support Specialist",
  "Data Analyst",
  "Digital Marketer",
  "Accountant / Bookkeeper",
  "Human Resources Staff",
  "Sales Representative",
  "Teacher / Tutor",
  "Nurse / Healthcare Worker",
  "Business Analyst",
  "Project Manager",
  "Cybersecurity Analyst",
];

function CareerRoadmap() {
  const [goal, setGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [level, setLevel] = useState("Fresh Graduate / No Experience");
  const [skills, setSkills] = useState("");
  const [time, setTime] = useState("1-2 hours/day");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    const finalGoal = customGoal.trim() || goal;
    if (!finalGoal) {
      alert("Please select or type a career goal.");
      return;
    }

    setLoading(true);
    setOutput("");

    const prompt = `Create a detailed, actionable career roadmap for someone who wants to become a ${finalGoal}.

Current Level: ${level}
Current Skills: ${skills || "none listed"}
Available Study/Practice Time: ${time}

Please provide:

PHASE 1 - FOUNDATION (Month 1-2):
- What to learn first
- Free resources (YouTube channels, websites, apps)
- Simple tasks to practice

PHASE 2 - BUILDING SKILLS (Month 3-4):
- Core skills to develop
- Free courses or certifications
- Practice projects or tasks

PHASE 3 - JOB READY (Month 5-6):
- Advanced skills needed
- Portfolio or experience to build
- How to find your first job or client

TOP FREE RESOURCES:
- List 5 specific free platforms or YouTube channels

CERTIFICATIONS TO GET:
- List free or affordable certifications

REALISTIC TIMELINE:
- How long realistically to land first job

FIRST STEPS THIS WEEK:
- 3 things they can do starting today

Make it practical, motivating, and realistic for a Filipino job seeker. Use simple language.`;

    const result = await callGemini(prompt);
    setOutput(result);
    setLoading(false);
  }

  // Parse output into phases for visual rendering
  function renderOutput() {
    if (!output) return null;

    const lines = output.split("\n");
    const elements = [];
    let key = 0;

    const phaseColors = {
      "PHASE 1": {
        bg: "bg-violet-600/10",
        border: "border-violet-600/30",
        text: "text-violet-400",
        dot: "bg-violet-600",
      },
      "PHASE 2": {
        bg: "bg-teal-600/10",
        border: "border-teal-600/30",
        text: "text-teal-400",
        dot: "bg-teal-600",
      },
      "PHASE 3": {
        bg: "bg-amber-600/10",
        border: "border-amber-600/30",
        text: "text-amber-400",
        dot: "bg-amber-600",
      },
    };

    let currentPhase = null;
    let currentItems = [];
    let currentColor = null;

    function flushPhase() {
      if (!currentPhase) return;
      const color = currentColor || {
        bg: "bg-gray-800",
        border: "border-gray-700",
        text: "text-gray-300",
        dot: "bg-gray-500",
      };
      elements.push(
        <div
          key={`phase-${key++}`}
          className={`${color.bg} border ${color.border} rounded-xl p-5 mb-4`}
        >
          <h3 className={`font-bold text-sm mb-3 ${color.text}`}>
            {currentPhase}
          </h3>
          <ul className="flex flex-col gap-2">
            {currentItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-300 text-sm"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${color.dot} mt-2 flex-shrink-0`}
                ></span>
                {item}
              </li>
            ))}
          </ul>
        </div>,
      );
      currentPhase = null;
      currentItems = [];
      currentColor = null;
    }

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Detect phase headers
      const phaseKey = Object.keys(phaseColors).find((p) =>
        trimmed.toUpperCase().startsWith(p),
      );
      if (phaseKey) {
        flushPhase();
        currentPhase = trimmed;
        currentColor = phaseColors[phaseKey];
        return;
      }

      // Detect other section headers (ALL CAPS or title-like)
      const isHeader =
        trimmed === trimmed.toUpperCase() &&
        trimmed.length > 4 &&
        !trimmed.startsWith("-") &&
        !trimmed.startsWith("•");

      if (isHeader && !currentPhase) {
        flushPhase();
        elements.push(
          <div key={`header-${key++}`} className="mt-4 mb-2">
            <h3 className="text-white font-bold text-sm border-b border-gray-700 pb-2">
              {trimmed}
            </h3>
          </div>,
        );
        return;
      }

      if (isHeader && currentPhase) {
        flushPhase();
        currentPhase = trimmed;
        currentColor = {
          bg: "bg-gray-800/50",
          border: "border-gray-700",
          text: "text-gray-300",
          dot: "bg-gray-500",
        };
        return;
      }

      // Bullet items
      if (
        trimmed.startsWith("-") ||
        trimmed.startsWith("•") ||
        trimmed.startsWith("*")
      ) {
        const text = trimmed.replace(/^[-•*]\s*/, "");
        if (currentPhase) {
          currentItems.push(text);
        } else {
          elements.push(
            <li
              key={`bullet-${key++}`}
              className="flex items-start gap-2 text-gray-300 text-sm mb-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0"></span>
              {text}
            </li>,
          );
        }
        return;
      }

      // Regular text
      if (currentPhase) {
        currentItems.push(trimmed);
      } else {
        elements.push(
          <p key={`text-${key++}`} className="text-gray-400 text-sm mb-2">
            {trimmed}
          </p>,
        );
      }
    });

    flushPhase();
    return elements;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">
          AI Career Roadmap
        </h1>
        <p className="text-gray-400 text-sm">
          Tell us your career goal and get a personalized step-by-step learning
          roadmap
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT — Input (1/3 width) */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Your Goal
            </h2>

            {/* Career goal dropdown */}
            <div className="mb-3">
              <label className="text-gray-500 text-xs block mb-1">
                Select Career Goal
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="">Choose a career...</option>
                {careerGoals.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom goal */}
            <div className="mb-3">
              <label className="text-gray-500 text-xs block mb-1">
                Or type your own goal
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                placeholder="e.g. Flight Attendant, Chef, Lawyer"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
              />
            </div>

            {/* Current level */}
            <div className="mb-3">
              <label className="text-gray-500 text-xs block mb-1">
                Current Level
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option>Fresh Graduate / No Experience</option>
                <option>Student (currently studying)</option>
                <option>Career Shifter</option>
                <option>Some Experience (less than 1 year)</option>
                <option>1-2 Years Experience</option>
                <option>3+ Years Experience</option>
              </select>
            </div>

            {/* Current skills */}
            <div className="mb-3">
              <label className="text-gray-500 text-xs block mb-1">
                Current Skills (optional)
              </label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                rows={3}
                placeholder="e.g. Basic computer skills, MS Word, English communication"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            {/* Study time */}
            <div className="mb-4">
              <label className="text-gray-500 text-xs block mb-1">
                Available Time to Study
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option>30 minutes/day</option>
                <option>1-2 hours/day</option>
                <option>3-4 hours/day</option>
                <option>5+ hours/day (full-time)</option>
                <option>Weekends only</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
            >
              {loading ? "🗺️ Generating roadmap..." : "🗺️ Generate Roadmap"}
            </button>
          </div>
        </div>

        {/* RIGHT — Output (2/3 width) */}
        <div className="md:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 min-h-96">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-600/20 rounded-lg px-3 py-1 text-xs font-bold">
                ✦ AI ROADMAP
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">
                  Building your personalized roadmap...
                </p>
              </div>
            ) : output ? (
              <div>{renderOutput()}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="text-gray-400 font-semibold mb-2">
                  Your roadmap will appear here
                </h3>
                <p className="text-gray-600 text-sm max-w-sm">
                  Select your career goal on the left and click Generate Roadmap
                  to get your personalized step-by-step plan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerRoadmap;
