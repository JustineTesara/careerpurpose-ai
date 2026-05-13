// src/pages/CoverLetter.js
import { useState } from "react";
import { callGemini } from "../lib/gemini";

function CoverLetter() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    skills: "",
    experience: "",
    why: "",
    tone: "Professional & Formal",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    if (!form.name || !form.role) {
      alert("Please fill in your name and the job role.");
      return;
    }

    setLoading(true);
    setOutput("");

    const prompt = `Write a ${form.tone} cover letter for a job application.

Applicant Name: ${form.name}
Job Role Applying For: ${form.role}
Company Name: ${form.company || "the company"}
Skills and Background: ${form.skills}
Work Experience: ${form.experience || "fresh graduate with no formal experience"}
Why this company: ${form.why || "the company's reputation and growth opportunities"}

Instructions:
- Write a complete, ready-to-send cover letter
- 3-4 paragraphs
- Strong opening that grabs attention
- Middle: highlight relevant skills and experience
- Closing: confident call to action
- Tone: ${form.tone}
- Tailor it for the Philippine job market
- Do NOT use placeholder brackets like [Your Name]
- Use the actual information provided
- Plain text, no markdown symbols`;

    const result = await callGemini(prompt);
    setOutput(result);
    setLoading(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">
          AI Cover Letter Generator
        </h1>
        <p className="text-gray-400 text-sm">
          Generate a personalized, professional cover letter in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — Form */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Your Details
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Your Full Name *
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. Maria Santos"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Job Title Applying For *
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. Customer Service Representative"
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Company Name
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. Concentrix, Accenture, SM Supermalls"
                  value={form.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Your Key Skills
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                  rows={3}
                  placeholder="e.g. Strong communication, MS Office, problem solving, customer handling, 60 WPM typing"
                  value={form.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Work Experience
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                  rows={3}
                  placeholder="e.g. 6 months OJT at BDO as teller assistant, or leave blank if fresh graduate"
                  value={form.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Why this company?
                  <span className="text-gray-600 ml-1 font-normal">
                    (optional but recommended)
                  </span>
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. I admire their customer-first culture and growth opportunities"
                  value={form.why}
                  onChange={(e) => handleChange("why", e.target.value)}
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Letter Tone
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  value={form.tone}
                  onChange={(e) => handleChange("tone", e.target.value)}
                >
                  <option>Professional & Formal</option>
                  <option>Warm & Friendly</option>
                  <option>Enthusiastic & Energetic</option>
                  <option>Concise & Direct</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm mt-1"
              >
                {loading
                  ? "✉️ Writing your letter..."
                  : "✉️ Generate Cover Letter"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Output */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-600/20 rounded-lg px-3 py-1 text-xs font-bold">
                ✦ AI OUTPUT
              </span>
              {output && (
                <button
                  onClick={handleCopy}
                  className="text-gray-400 hover:text-white text-xs border border-gray-700 rounded-lg px-3 py-1.5 transition"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              )}
            </div>

            <div className="flex-1 bg-gray-800 rounded-lg p-5 min-h-96">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                  Writing your cover letter...
                </div>
              ) : output ? (
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {output}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="text-5xl mb-4">✉️</div>
                  <h3 className="text-gray-400 font-semibold mb-2">
                    Your cover letter will appear here
                  </h3>
                  <p className="text-gray-600 text-sm max-w-xs">
                    Fill in your details on the left and click Generate to get a
                    personalized cover letter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoverLetter;
