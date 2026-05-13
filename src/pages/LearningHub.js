// src/pages/LearningHub.js
import { useState } from "react";
import { callGemini } from "../lib/gemini";

const freePlatforms = [
  {
    icon: "▶️",
    name: "YouTube",
    desc: "Search '[topic] tutorial for beginners'",
    color: "text-red-400",
    link: "https://youtube.com",
  },
  {
    icon: "💻",
    name: "freeCodeCamp",
    desc: "Web dev, Python, Data Science — free certificates",
    color: "text-teal-400",
    link: "https://freecodecamp.org",
  },
  {
    icon: "🎓",
    name: "Coursera (Audit)",
    desc: "Audit courses free from Google, IBM, Meta",
    color: "text-blue-400",
    link: "https://coursera.org",
  },
  {
    icon: "📖",
    name: "Khan Academy",
    desc: "Math, science, business fundamentals — 100% free",
    color: "text-green-400",
    link: "https://khanacademy.org",
  },
  {
    icon: "⚡",
    name: "LinkedIn Learning",
    desc: "1 month free trial — professional courses",
    color: "text-blue-300",
    link: "https://linkedin.com/learning",
  },
  {
    icon: "🔥",
    name: "Google Skills",
    desc: "Google Digital Garage — free certificates",
    color: "text-amber-400",
    link: "https://learndigital.withgoogle.com",
  },
];

function LearningHub() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Absolute beginner");
  const [goal, setGoal] = useState("Get a job");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGetPlan() {
    if (!topic.trim()) {
      alert("Please enter a topic you want to learn.");
      return;
    }

    setLoading(true);
    setOutput("");

    const prompt = `Create a free learning plan for: ${topic}
Level: ${level}
Goal: ${goal}

Provide:

WHAT YOU WILL LEARN:
Brief overview of what this skill covers and why it matters

LEARNING PATH (Step by step):
- Step 1: [what to learn first]
- Step 2: [next step]
- Step 3: [and so on, up to 5 steps]

FREE RESOURCES:
- Specific YouTube channels or playlists (name them)
- Free websites (freeCodeCamp, MDN, etc.)
- Free apps or tools to practice

PRACTICE PROJECTS:
- 3 project ideas from easiest to hardest

REALISTIC TIMELINE:
How long it takes based on ${level} level studying regularly

HOW TO SHOW IT ON YOUR RESUME:
How to present this skill when job hunting

FIRST STEP RIGHT NOW:
One specific thing to do in the next 30 minutes

Keep it practical, free, and motivating. For a Filipino job seeker.`;

    const result = await callGemini(prompt);
    setOutput(result);
    setLoading(false);
  }

  function cleanText(text) {
    return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  }

  function renderOutput() {
    if (!output) return null;
    const lines = output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const elements = [];
    let key = 0;
    let currentSection = null;
    let currentItems = [];

    const sectionColors = {
      "WHAT YOU WILL": {
        bg: "bg-violet-600/10",
        border: "border-violet-600/30",
        text: "text-violet-400",
      },
      "LEARNING PATH": {
        bg: "bg-teal-600/10",
        border: "border-teal-600/30",
        text: "text-teal-400",
      },
      "FREE RESOURCES": {
        bg: "bg-amber-600/10",
        border: "border-amber-600/30",
        text: "text-amber-400",
      },
      PRACTICE: {
        bg: "bg-green-600/10",
        border: "border-green-600/30",
        text: "text-green-400",
      },
      REALISTIC: {
        bg: "bg-blue-600/10",
        border: "border-blue-600/30",
        text: "text-blue-400",
      },
      "HOW TO SHOW": {
        bg: "bg-pink-600/10",
        border: "border-pink-600/30",
        text: "text-pink-400",
      },
      "FIRST STEP": {
        bg: "bg-orange-600/10",
        border: "border-orange-600/30",
        text: "text-orange-400",
      },
    };

    function flush() {
      if (!currentSection || currentItems.length === 0) return;
      const matchKey = Object.keys(sectionColors).find((k) =>
        currentSection.toUpperCase().startsWith(k),
      );
      const color = matchKey
        ? sectionColors[matchKey]
        : {
            bg: "bg-gray-800/50",
            border: "border-gray-700",
            text: "text-gray-300",
          };

      elements.push(
        <div
          key={`s-${key++}`}
          className={`${color.bg} border ${color.border} rounded-xl p-5 mb-4`}
        >
          <h3 className={`font-bold text-sm mb-3 ${color.text}`}>
            {cleanText(currentSection)}
          </h3>
          <ul className="flex flex-col gap-2">
            {currentItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-300 text-sm"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${color.text.replace("text-", "bg-")}`}
                ></span>
                {cleanText(item)}
              </li>
            ))}
          </ul>
        </div>,
      );
      currentSection = null;
      currentItems = [];
    }

    lines.forEach((line) => {
      const cleaned = cleanText(line);
      const isHeader =
        cleaned === cleaned.toUpperCase() &&
        cleaned.length > 4 &&
        !cleaned.startsWith("-") &&
        !cleaned.startsWith("•") &&
        isNaN(cleaned[0]);

      if (isHeader) {
        flush();
        currentSection = cleaned;
        return;
      }

      const isBullet =
        line.startsWith("-") ||
        line.startsWith("•") ||
        line.startsWith("*") ||
        /^\d+[.)]\s/.test(line);

      if (isBullet) {
        const text = cleaned
          .replace(/^[-•*]\s*/, "")
          .replace(/^\d+[.)]\s*/, "")
          ;
        if (currentSection) currentItems.push(text);
        return;
      }

      if (currentSection) currentItems.push(cleaned);
      else
        elements.push(
          <p key={`p-${key++}`} className="text-gray-400 text-sm mb-2">
            {cleaned}
          </p>,
        );
    });

    flush();
    return elements;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">Learning Hub</h1>
        <p className="text-gray-400 text-sm">
          Get a personalized free learning plan for any skill or topic
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              What do you want to learn?
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Topic or Skill *
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. Microsoft Excel, Public Speaking, Canva, Python"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Your Current Level
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>Absolute beginner</option>
                  <option>Know the basics</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Your Goal
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option>Get a job</option>
                  <option>Freelance / side income</option>
                  <option>Personal growth</option>
                  <option>Start a business</option>
                  <option>Pass a certification exam</option>
                </select>
              </div>
              <button
                onClick={handleGetPlan}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                {loading ? "📚 Building your plan..." : "📚 Get Learning Plan"}
              </button>
            </div>
          </div>

          {/* Free platforms */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Free Platforms
            </h2>
            <div className="flex flex-col gap-3">
              {freePlatforms.map((p) => (
                <a
                  key={p.name}
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 hover:bg-gray-800 rounded-lg p-2 transition"
                >
                  <span className="text-xl flex-shrink-0">{p.icon}</span>
                  <div>
                    <div className={`text-sm font-semibold ${p.color}`}>
                      {p.name}
                    </div>
                    <div className="text-gray-500 text-xs">{p.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 min-h-96">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-600/20 rounded-lg px-3 py-1 text-xs font-bold">
                ✦ YOUR LEARNING PLAN
              </span>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">
                  Building your personalized learning plan...
                </p>
              </div>
            ) : output ? (
              <div>{renderOutput()}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-gray-400 font-semibold mb-2">
                  Your learning plan will appear here
                </h3>
                <p className="text-gray-600 text-sm max-w-sm">
                  Enter any skill or topic on the left — Excel, Canva, coding,
                  public speaking, anything!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningHub;
