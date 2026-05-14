// src/pages/ResumeBuilder.js
import { useState } from "react";
import { callGemini } from "../lib/gemini";
import jsPDF from "jspdf";

function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "",
    target: "",
    contact: "",
    location: "",
    education: "",
    skills: "",
    experience: "",
    projects: "",
    certifications: "",
  });

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    if (!form.name || !form.target) {
      alert("Please fill in at least your name and target job title.");
      return;
    }
    setLoading(true);
    setOutput("");

    const prompt = `Create a professional ATS-friendly resume in plain text for:
Name: ${form.name}
Target Role: ${form.target}
Contact: ${form.contact}
Location: ${form.location}
Education: ${form.education}
Skills: ${form.skills}
Experience: ${form.experience}
Projects: ${form.projects}
Certifications: ${form.certifications}

STRICT FORMATTING RULES:
- First line: full name only
- Second line: contact | location
- Section headers in ALL CAPS (e.g. PROFESSIONAL SUMMARY, EDUCATION, SKILLS, EXPERIENCE, PROJECTS, CERTIFICATIONS)
- Skills: list EACH skill on its own line starting with a dash: - HTML
- Experience bullets: start with "- "
- Project bullets: start with "- ProjectName: description (Tech: ...)"
- NO markdown symbols like ** or ## or __
- Plain text only
- Keep concise for 1 page`;

    const result = await callGemini(prompt);
    setOutput(result);
    const count = parseInt(localStorage.getItem("cp_resumes") || "0") + 1;
    localStorage.setItem("cp_resumes", count);
    setLoading(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadPDF() {
    if (!output) {
      alert("Please generate a resume first.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 18;
    const contentW = pageW - marginX * 2;
    let y = 22;

    function drawLine(color = [200, 200, 200]) {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.3);
      doc.line(marginX, y, pageW - marginX, y);
      y += 5;
    }

    const allLines = output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // ── Name ─────────────────────────────────────────
    const nameLine = allLines[0] || form.name;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text(nameLine.replace(/\*/g, ""), pageW / 2, y, { align: "center" });
    y += 8;

    // ── Contact line ─────────────────────────────────
    const contactLine = allLines[1] || "";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(contactLine.replace(/\*/g, ""), pageW / 2, y, { align: "center" });
    y += 6;

    drawLine([180, 180, 180]);

    // ── Sections ─────────────────────────────────────
    let inSection = false;
    let sectionName = "";

    for (let i = 2; i < allLines.length; i++) {
      if (y > 272) break;

      const raw = allLines[i];
      const clean = raw.replace(/\*/g, "").trim();

      // Detect section header (ALL CAPS, no bullet)
      const isHeader =
        clean === clean.toUpperCase() &&
        clean.length > 3 &&
        !clean.startsWith("-") &&
        !clean.startsWith("•") &&
        isNaN(clean[0]);

      if (isHeader) {
        if (inSection) y += 1;
        inSection = true;
        sectionName = clean;

        // Section title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(90, 60, 200);
        doc.text(clean, marginX, y);
        y += 2;
        drawLine([90, 60, 200]);
        continue;
      }

      // Skills section — each skill as a bullet pill
      if (sectionName === "SKILLS") {
        const skillText = clean.replace(/^[-•]\s*/, "");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text(`• ${skillText}`, marginX + 3, y);
        y += 5;
        continue;
      }

      // Bullet lines
      if (clean.startsWith("-") || clean.startsWith("•")) {
        const bulletText = clean.replace(/^[-•]\s*/, "");
        const wrapped = doc.splitTextToSize(bulletText, contentW - 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        wrapped.forEach((line, wi) => {
          if (y > 275) return;
          doc.text(wi === 0 ? `•  ${line}` : `    ${line}`, marginX + 3, y);
          y += 4.8;
        });
        continue;
      }

      // Regular text line
      const wrapped = doc.splitTextToSize(clean, contentW);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      wrapped.forEach((line) => {
        if (y > 275) return;
        doc.text(line, marginX, y);
        y += 4.8;
      });
    }

    const fileName = `${form.name || "Resume"}_Resume.pdf`.replace(/\s+/g, "_");
    doc.save(fileName);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">
          AI Resume Builder
        </h1>
        <p className="text-gray-400 text-sm">
          Fill in your details and Groq AI will craft a professional resume
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — Form */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Personal Info
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Full Name *
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
                  value={form.target}
                  onChange={(e) => handleChange("target", e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Email & Phone
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="email@gmail.com | +63 912 345 6789"
                  value={form.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Location
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. Quezon City, Metro Manila"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Education & Skills
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Education
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. BS Business Administration, 2024, University of the Philippines"
                  value={form.education}
                  onChange={(e) => handleChange("education", e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Technical Skills{" "}
                  <span className="text-gray-600 ml-1 font-normal">
                    (one per line)
                  </span>
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                  rows={4}
                  placeholder={
                    "Communication Skills\nProblem Solving\nMS Office\nCustomer Handling"
                  }
                  value={form.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Work / Internship Experience
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                  rows={3}
                  placeholder="e.g. IT Intern at Sutherland — built web apps using React and Firebase"
                  value={form.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Projects & Extras
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Projects
                  <span className="text-gray-600 ml-1 font-normal">
                    (one per line with * )
                  </span>
                </label>
                {/* Helper tip */}
                <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 mb-2 text-xs text-gray-500">
                  <span className="text-violet-400 font-semibold">Format:</span>{" "}
                  * ProjectName - description (Tools used: ...)
                </div>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
                  rows={4}
                  placeholder={
                    "* Customer Retention Campaign - Reduced churn by 15%\n  Tools used (MS Excel, Google Sheets)\n* Employee Onboarding Guide - Created training docs\n  Tools used (Google Docs, Canva)"
                  }
                  value={form.projects}
                  onChange={(e) => handleChange("projects", e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Certifications / Awards
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder="e.g. TESDA NC II, Customer Service Excellence Certificate, Dean's Lister"
                  value={form.certifications}
                  onChange={(e) =>
                    handleChange("certifications", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
          >
            {loading ? "✦ Generating your resume..." : "✦ Generate AI Resume"}
          </button>
        </div>

        {/* RIGHT — Output */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-600/20 rounded-lg px-3 py-1 text-xs font-bold">
                ✦ AI OUTPUT
              </span>
              {output && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white text-xs border border-gray-700 rounded-lg px-3 py-1.5 transition"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg px-3 py-1.5 transition"
                  >
                    ⬇ Download PDF
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 bg-gray-800 rounded-lg p-4 min-h-96">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                  Generating your resume...
                </div>
              ) : output ? (
                <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                  {output}
                </pre>
              ) : (
                <p className="text-gray-600 text-sm">
                  Your AI-generated resume will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
