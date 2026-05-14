// src/pages/ResumeAnalyzer.js
import { useState, useRef } from "react";
import { callGemini } from "../lib/gemini";
import * as mammoth from "mammoth";

function ResumeAnalyzer() {
  const [targetRole, setTargetRole] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const fileInputRef = useRef(null);

  // ── Read PDF ──────────────────────────────────
  async function readPDF(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result);

          // Load PDF.js from CDN directly
          if (!window.pdfjsLib) {
            await new Promise((res, rej) => {
              const script = document.createElement("script");
              script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
              script.onload = res;
              script.onerror = rej;
              document.head.appendChild(script);
            });
          }

          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          const pdf = await window.pdfjsLib.getDocument({ data: typedArray })
            .promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }

          resolve(fullText.trim());
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // ── Read Word (.docx) ─────────────────────────
  async function readWord(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  }

  // ── Handle file upload ────────────────────────
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const isPDF = file.type === "application/pdf";
    const isWord =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc");

    if (!isPDF && !isWord) {
      alert("Please upload a PDF or Word document (.pdf, .docx, .doc)");
      return;
    }

    setFileName(file.name);
    setFileLoading(true);
    setResumeText("");
    setOutput("");
    setScore(null);

    try {
      let text = "";
      if (isPDF) {
        text = await readPDF(file);
      } else {
        text = await readWord(file);
      }

      if (!text || text.length < 50) {
        alert(
          "Could not read enough text from this file. Make sure it's not a scanned image.",
        );
        setFileLoading(false);
        setFileName("");
        return;
      }

      setResumeText(text);
      setFileLoading(false);

      // Auto-analyze after upload
      await analyzeResume(text);
    } catch (err) {
      console.error(err);
      setFileLoading(false);
      alert(
        "Failed to read file. Try a different format or check if the file is corrupted.",
      );
    }
  }

  // ── Analyze resume text ───────────────────────
  async function analyzeResume(text) {
    setLoading(true);
    setOutput("");
    setScore(null);

    const prompt = `Analyze this resume${targetRole ? " for the role of " + targetRole : ""}:

${text}

Provide a detailed analysis with these exact sections:

ATS SCORE: [give a number out of 100]

STRENGTHS:
- List what the resume does well

WEAKNESSES:
- List what needs improvement

MISSING SKILLS:
- List skills missing for ${targetRole || "general job roles"}

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

  async function handleAnalyzeClick() {
    if (!resumeText.trim()) {
      alert("Please upload your resume first.");
      return;
    }
    await analyzeResume(resumeText);
  }

  function getScoreColor(s) {
    if (s >= 75) return "#34d399";
    if (s >= 50) return "#ffb340";
    return "#ff5f57";
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">
          AI Resume Analyzer
        </h1>
        <p className="text-gray-400 text-sm">
          Upload your resume and get instant AI feedback, ATS score, and
          improvement tips
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — Upload */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {/* Target role */}
            <div className="mb-4">
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">
                Target Job Role
                <span className="text-gray-600 ml-1 font-normal normal-case">
                  (optional but recommended)
                </span>
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                placeholder="e.g. Customer Service Representative, Admin Assistant"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {/* Upload area */}
            <div className="mb-4">
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">
                Upload Resume
              </label>

              <div
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
                  ${
                    fileName
                      ? "border-violet-600/50 bg-violet-600/5"
                      : "border-gray-700 hover:border-violet-500 hover:bg-gray-800/50"
                  }`}
              >
                {fileLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                    <div className="text-gray-400 text-sm">
                      Reading your resume...
                    </div>
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">
                      {fileName.endsWith(".pdf") ? "📄" : "📝"}
                    </div>
                    <div className="text-violet-400 text-sm font-semibold">
                      {fileName}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Click to upload a different file
                    </div>
                    {resumeText && (
                      <div className="text-green-400 text-xs mt-1">
                        ✓ {resumeText.split(" ").length} words read successfully
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center text-3xl">
                      ⬆️
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold mb-1">
                        Click to upload your resume
                      </div>
                      <div className="text-gray-500 text-xs">
                        Supports PDF and Word (.docx, .doc)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Supported formats */}
            <div className="flex gap-2 mb-4">
              {["PDF", "DOCX", "DOC"].map((fmt) => (
                <span
                  key={fmt}
                  className="bg-gray-800 text-gray-400 text-xs font-semibold px-3 py-1 rounded-full border border-gray-700"
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* Re-analyze button */}
            {resumeText && (
              <button
                onClick={handleAnalyzeClick}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
              >
                {loading ? "🔍 Analyzing..." : "🔍 Re-analyze Resume"}
              </button>
            )}
          </div>

          {/* Tips card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
              Tips for Better Results
            </h2>
            <div className="flex flex-col gap-2.5">
              {[
                "Enter your target job role for more specific feedback",
                "Make sure your resume has selectable text (not a scanned image)",
                "Use a clean, simple resume format for best ATS results",
                "Include measurable achievements like percentages and numbers",
              ].map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-gray-500"
                >
                  <span className="text-violet-400 mt-0.5 flex-shrink-0">
                    ✦
                  </span>
                  {tip}
                </div>
              ))}
            </div>
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
                    className="text-2xl font-bold mb-1"
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
                      ? "Your resume is well-optimized for ATS"
                      : score >= 50
                        ? "Some improvements will help you pass ATS filters"
                        : "Significant improvements needed before applying"}
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
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">
                  Analyzing your resume...
                </p>
              </div>
            ) : output ? (
              <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                {output}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-gray-400 font-semibold mb-2">
                  Upload your resume to get started
                </h3>
                <p className="text-gray-600 text-sm max-w-xs">
                  We'll analyze your resume and give you an ATS score,
                  strengths, weaknesses, and specific improvements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
