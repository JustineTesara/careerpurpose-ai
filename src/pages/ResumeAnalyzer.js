// src/pages/ResumeAnalyzer.js
import { useState, useRef } from "react";
import { callGemini } from "../lib/gemini";

function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Extract text from uploaded PDF
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setFileName(file.name);
    setPdfLoading(true);

    try {
      // Load pdfjs from CDN to avoid build issues
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      setResumeText(fullText.trim());
      setPdfLoading(false);
    } catch (err) {
      setPdfLoading(false);
      alert("Could not read PDF. Try copying and pasting the text manually.");
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) {
      alert("Please paste your resume text or upload a PDF first.");
      return;
    }
    setLoading(true);
    setOutput("");
    setScore(null);

    const prompt = `Analyze this resume${targetRole ? " for the role of " + targetRole : ""}:

${resumeText}

Provide a detailed analysis with these exact sections:

ATS SCORE: [give a number out of 100]

STRENGTHS:
- List what the resume does well

WEAKNESSES:
- List what needs improvement

MISSING SKILLS:
- List skills missing for ${targetRole || "general IT roles"}

SPECIFIC IMPROVEMENTS:
- List actionable things to fix

OVERALL VERDICT:
A short paragraph summary

Be specific, honest, and helpful.`;

    const result = await callGemini(prompt);
    setOutput(result);

    const match = result.match(/ATS SCORE[:\s]+(\d+)/i);
    if (match) setScore(parseInt(match[1]));

    setLoading(false);
  }

  function getScoreColor(s) {
    if (s >= 75) return "#34d399";
    if (s >= 50) return "#ffb340";
    return "#ff5f57";
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">
          AI Resume Analyzer
        </h1>
        <p className="text-gray-400 text-sm">
          Upload a PDF or paste your resume text to get instant AI feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {/* PDF Upload Area */}
            <div className="mb-4">
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">
                Upload Resume PDF
              </label>
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-700 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer transition"
              >
                {pdfLoading ? (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                    Reading PDF...
                  </div>
                ) : fileName ? (
                  <div>
                    <div className="text-2xl mb-1">📄</div>
                    <div className="text-violet-400 text-sm font-semibold">
                      {fileName}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Click to change file
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">⬆️</div>
                    <div className="text-gray-400 text-sm font-semibold">
                      Click to upload PDF
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      or paste text below
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="text-gray-600 text-xs">or paste text</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            {/* Target role */}
            <div className="mb-3">
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">
                Target Job Role (optional)
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                placeholder="e.g. Customer Service Representative, Admin Assistant"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {/* Manual text input */}
            <div className="mb-4">
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">
                Resume Text
              </label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                rows={10}
                placeholder="Paste your resume text here, or upload a PDF above...&#10;&#10;e.g. Maria Santos&#10;Customer Service Representative&#10;Quezon City | maria@gmail.com&#10;&#10;PROFESSIONAL SUMMARY&#10;Dedicated customer service professional with 2 years experience..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
            >
              {loading ? "🔍 Analyzing..." : "🔍 Analyze Resume"}
            </button>
          </div>
        </div>

        {/* RIGHT — Output */}
        <div className="flex flex-col gap-4">
          {/* ATS Score */}
          {score !== null && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
                ATS Compatibility Score
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="#ffffff10"
                      strokeWidth="7"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={getScoreColor(score)}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                      transform="rotate(-90 40 40)"
                      style={{ transition: "stroke-dashoffset 0.8s" }}
                    />
                  </svg>
                  <div
                    className="absolute font-bold text-lg"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score}
                  </div>
                </div>
                <div>
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score >= 75
                      ? "Great!"
                      : score >= 50
                        ? "Needs Work"
                        : "Needs Major Work"}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {score >= 75
                      ? "Well-optimized for ATS systems"
                      : score >= 50
                        ? "Some improvements needed"
                        : "Significant improvements needed"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Output */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-600/20 rounded-lg px-3 py-1 text-xs font-bold">
                ✦ AI ANALYSIS
              </span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                Analyzing your resume...
              </div>
            ) : output ? (
              <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                {output}
              </pre>
            ) : (
              <p className="text-gray-600 text-sm">
                Upload a PDF or paste your resume then click Analyze.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
