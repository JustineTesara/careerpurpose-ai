// src/pages/InterviewSim.js
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
  "Nurse / Healthcare Worker",
  "Business Analyst",
  "Project Manager",
];

function InterviewSim() {
  const [step, setStep] = useState("setup"); // setup | interview | feedback
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [type, setType] = useState("Mixed (Behavioral + Technical)");
  const [difficulty, setDifficulty] = useState("Entry Level / Fresh Graduate");
  const [questionCount, setQuestionCount] = useState("5");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  async function handleStart() {
    const finalRole = customRole.trim() || role;
    if (!finalRole) {
      alert("Please select or type a job role.");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setAnswers({});

    const prompt = `Generate exactly ${questionCount} interview questions for a ${difficulty} ${finalRole} position.
Interview type: ${type}

Rules:
- Return ONLY a numbered list of questions
- No intro text, no explanations, no extra commentary
- Just the questions like:
1. Question here
2. Question here

Make questions realistic and appropriate for the Philippines job market.`;

    const result = await callGemini(prompt);

    // Parse numbered questions from result
    const parsed = result
      .split("\n")
      .filter((l) => l.trim().match(/^\d+[.)]/))
      .map((l) => l.replace(/^\d+[.)]\s*/, "").trim())
      .filter(Boolean);

    // Fallback if parsing failed
    const finalQuestions =
      parsed.length > 0
        ? parsed
        : result
            .split("\n")
            .filter((l) => l.trim().length > 10)
            .slice(0, parseInt(questionCount));

    setQuestions(finalQuestions);
    setLoading(false);
    setStep("interview");

    // Track interviews count
    const count = parseInt(localStorage.getItem("cp_interviews") || "0") + 1;
    localStorage.setItem("cp_interviews", count);
  }

  function handleAnswerChange(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  async function handleSubmit() {
    const finalRole = customRole.trim() || role;
    const unanswered = questions.filter((_, i) => !answers[i]?.trim());
    if (unanswered.length === questions.length) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    setFeedbackLoading(true);
    setStep("feedback");

    const qaPairs = questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q}\nAnswer: ${answers[i] || "(no answer provided)"}`,
      )
      .join("\n\n");

    const prompt = `You are an experienced HR interviewer reviewing a candidate for ${finalRole}.

Here are their interview answers:

${qaPairs}

Please provide:

OVERALL SCORE: X/10

SUMMARY:
A 2-3 sentence overall assessment

QUESTION BY QUESTION FEEDBACK:
For each question give: rating (Good/Needs Work/Poor), what was good, what was missing

COMMUNICATION STRENGTHS:
- List strong points

AREAS TO IMPROVE:
- List specific improvements

SAMPLE BETTER ANSWERS:
Provide improved versions for 2 weak answers

FINAL VERDICT:
Would you recommend this candidate? Why or why not?

Be honest, constructive, and encouraging. This is for a Filipino job seeker.`;

    const result = await callGemini(prompt);
    setFeedback(result);
    setFeedbackLoading(false);
  }

  function handleReset() {
    setStep("setup");
    setQuestions([]);
    setAnswers({});
    setFeedback("");
    setRole("");
    setCustomRole("");
  }

  // ── SETUP SCREEN ─────────────────────────────────
  if (step === "setup") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold mb-1">
            AI Interview Simulator
          </h1>
          <p className="text-gray-400 text-sm">
            Practice mock interviews and get AI-powered feedback on your answers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Interview Setup
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Select Job Role
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
                  Or type your own role
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. Barista, Flight Attendant, Chef"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Interview Type
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>Behavioral (HR Interview)</option>
                  <option>Technical Interview</option>
                  <option>Mixed (Behavioral + Technical)</option>
                  <option>English Proficiency</option>
                </select>
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Difficulty Level
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option>Entry Level / Fresh Graduate</option>
                  <option>Junior (1-2 years experience)</option>
                  <option>Mid-level (3-5 years)</option>
                  <option>Senior Level</option>
                </select>
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Number of Questions
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                >
                  <option value="3">3 questions (quick practice)</option>
                  <option value="5">5 questions (standard)</option>
                  <option value="8">8 questions (full interview)</option>
                  <option value="10">10 questions (intensive)</option>
                </select>
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm mt-2"
              >
                {loading ? "🎤 Preparing questions..." : "🎤 Start Interview"}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Tips for Success
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: "⭐",
                  title: "Use the STAR Method",
                  desc: "Situation, Task, Action, Result — structure your behavioral answers this way.",
                },
                {
                  icon: "🎯",
                  title: "Be Specific",
                  desc: "Use real examples and numbers. 'I handled 50 calls per day' is better than 'I handled many calls'.",
                },
                {
                  icon: "⏱️",
                  title: "Think Before Typing",
                  desc: "It's okay to take 30 seconds to gather your thoughts before answering.",
                },
                {
                  icon: "😊",
                  title: "Show Personality",
                  desc: "Interviewers hire people, not robots. Be professional but let your personality shine.",
                },
                {
                  icon: "✅",
                  title: "Answer Completely",
                  desc: "Address all parts of the question. Don't leave things vague.",
                },
              ].map((tip) => (
                <div key={tip.title} className="flex gap-3">
                  <div className="text-xl flex-shrink-0">{tip.icon}</div>
                  <div>
                    <div className="text-white text-sm font-semibold mb-0.5">
                      {tip.title}
                    </div>
                    <div className="text-gray-500 text-xs leading-relaxed">
                      {tip.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── INTERVIEW SCREEN ─────────────────────────────
  if (step === "interview") {
    const finalRole = customRole.trim() || role;
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">
              Mock Interview
            </h1>
            <p className="text-gray-400 text-sm">
              {finalRole} · {type} · {difficulty}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-white text-xs border border-gray-700 rounded-lg px-3 py-1.5 transition"
          >
            ✕ Cancel
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-800 rounded-full h-1.5 mb-6">
          <div
            className="bg-violet-600 h-1.5 rounded-full transition-all"
            style={{
              width: `${(Object.keys(answers).filter((k) => answers[k]?.trim()).length / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-4 mb-6">
          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-violet-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Question {i + 1} of {questions.length}
                </span>
                {answers[i]?.trim() && (
                  <span className="ml-auto text-green-400 text-xs">
                    ✓ Answered
                  </span>
                )}
              </div>
              <p className="text-white text-sm font-medium leading-relaxed mb-3">
                {q}
              </p>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                rows={4}
                placeholder="Type your answer here..."
                value={answers[i] || ""}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition text-sm"
        >
          ✦ Submit for AI Feedback
        </button>
      </div>
    );
  }

  // ── FEEDBACK SCREEN ──────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">
            Interview Feedback
          </h1>
          <p className="text-gray-400 text-sm">
            Here's what the AI thinks about your answers
          </p>
        </div>
        <button
          onClick={handleReset}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg px-4 py-2 transition"
        >
          Practice Again
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-teal-600/20 text-teal-400 border border-teal-600/20 rounded-lg px-3 py-1 text-xs font-bold">
            ✦ AI FEEDBACK
          </span>
        </div>

        {feedbackLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Analyzing your answers...</p>
          </div>
        ) : (
          <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
            {feedback}
          </pre>
        )}
      </div>
    </div>
  );
}

export default InterviewSim;
