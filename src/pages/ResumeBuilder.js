// src/pages/ResumeBuilder.js
import { useState } from "react";
import { callGemini } from "../lib/gemini";
import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

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
  const [generated, setGenerated] = useState(false);

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
    setGenerated(false);

    const prompt = `You are a professional resume writer. Create a powerful, ATS-optimized resume for:

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
- First line: full name only (no labels)
- Second line: contact | location
- Use these exact section headers in ALL CAPS: PROFESSIONAL SUMMARY, EDUCATION, SKILLS, EXPERIENCE, PROJECTS, CERTIFICATIONS
- Skills: one per line starting with "- "
- Experience and project bullets: start with "- "
- NO markdown symbols like ** or ## or __ or *
- Plain text only, no special characters

PROFESSIONAL SUMMARY RULES (most important section):
- Write 3-4 powerful sentences
- Sentence 1: Who they are + education + years of experience
- Sentence 2: Their top 3 most relevant skills for ${form.target}
- Sentence 3: A specific achievement or strength with a number if possible
- Sentence 4: What value they bring to the employer and career goal
- Make it sound confident, human, and tailored specifically for ${form.target}
- Avoid generic phrases like "hardworking" or "team player" unless backed by evidence

EXPERIENCE RULES:
- Start each bullet with a strong action verb (Managed, Built, Increased, Reduced, Led)
- Include numbers, percentages, or scale wherever possible
- Focus on impact and results, not just tasks

Keep the entire resume concise enough to fit on 1 page.`;

    const result = await callGemini(prompt);
    setOutput(result);
    setGenerated(true);
    const count = parseInt(localStorage.getItem("cp_resumes") || "0") + 1;
    localStorage.setItem("cp_resumes", count);
    setLoading(false);
  }

  // ── Download as PDF ───────────────────────────
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

    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text((allLines[0] || form.name).replace(/\*/g, ""), pageW / 2, y, {
      align: "center",
    });
    y += 8;

    // Contact
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text((allLines[1] || "").replace(/\*/g, ""), pageW / 2, y, {
      align: "center",
    });
    y += 6;
    drawLine([180, 180, 180]);

    let sectionName = "";
    for (let i = 2; i < allLines.length; i++) {
      if (y > 272) break;
      const raw = allLines[i];
      const clean = raw.replace(/\*/g, "").trim();
      const isHeader =
        clean === clean.toUpperCase() &&
        clean.length > 3 &&
        !clean.startsWith("-") &&
        !clean.startsWith("•") &&
        isNaN(clean[0]);

      if (isHeader) {
        y += 1;
        sectionName = clean;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(90, 60, 200);
        doc.text(clean, marginX, y);
        y += 2;
        drawLine([90, 60, 200]);
        continue;
      }

      if (sectionName === "SKILLS") {
        const skillText = clean.replace(/^[-•]\s*/, "");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text(`• ${skillText}`, marginX + 3, y);
        y += 5;
        continue;
      }

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

    doc.save(`${form.name || "Resume"}_Resume.pdf`.replace(/\s+/g, "_"));
  }

  // ── Download as Word (.docx) ──────────────────
  async function handleDownloadWord() {
    if (!output) {
      alert("Please generate a resume first.");
      return;
    }

    const lines = output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const children = [];

    // Name
    children.push(
      new Paragraph({
        text: (lines[0] || form.name).replace(/\*/g, ""),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    );

    // Contact
    if (lines[1]) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: lines[1].replace(/\*/g, ""),
              size: 18,
              color: "555555",
            }),
          ],
        }),
      );
    }

    let currentSection = "";
    for (let i = 2; i < lines.length; i++) {
      const raw = lines[i];
      const clean = raw.replace(/\*/g, "").trim();
      const isHeader =
        clean === clean.toUpperCase() &&
        clean.length > 3 &&
        !clean.startsWith("-") &&
        !clean.startsWith("•") &&
        isNaN(clean[0]);

      if (isHeader) {
        currentSection = clean;
        // Section heading
        children.push(
          new Paragraph({
            spacing: { before: 240, after: 60 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "5A3CC8" },
            },
            children: [
              new TextRun({
                text: clean,
                bold: true,
                size: 22,
                color: "5A3CC8",
              }),
            ],
          }),
        );
        continue;
      }

      if (clean.startsWith("-") || clean.startsWith("•")) {
        const bulletText = clean.replace(/^[-•]\s*/, "");
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [new TextRun({ text: bulletText, size: 18 })],
          }),
        );
        continue;
      }

      // Skills section
      if (currentSection === "SKILLS") {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text: clean, size: 18 })],
          }),
        );
        continue;
      }

      // Regular line
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: clean, size: 18 })],
        }),
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 900, right: 900 },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${form.name || "Resume"}_Resume.docx`.replace(/\s+/g, "_"));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
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
                  placeholder="e.g. BS Business Administration, 2024"
                  value={form.education}
                  onChange={(e) => handleChange("education", e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Skills{" "}
                  <span className="text-gray-600 font-normal">
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
                  placeholder="Tell us about your professional experience, internships, freelance work, or major projects that showcase your skills and achievements. Example: Front-End Developer at ABC Company (2023–2025) — Developed responsive web applications using React and Tailwind CSS."
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
                  Projects{" "}
                  <span className="text-gray-600 font-normal">
                    (one per line with *)
                  </span>
                </label>
                <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 mb-2 text-xs text-gray-500">
                  <span className="text-violet-400 font-semibold">Format:</span>{" "}
                  * ProjectName - description (Tools: ...)
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
                  placeholder="e.g. TESDA NC II, Dean's Lister, Customer Service Certificate"
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

        {/* RIGHT — Download Options */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-600/20 rounded-lg px-3 py-1 text-xs font-bold">
                ✦ DOWNLOAD RESUME
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-2 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">
                  AI is writing your resume...
                </p>
                <p className="text-gray-600 text-xs">
                  This may take a few seconds
                </p>
              </div>
            ) : generated ? (
              <div className="flex flex-col gap-4">
                {/* Success message */}
                <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="text-green-400 font-semibold text-sm">
                      Resume Generated!
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      Your resume is ready. Choose your preferred format below.
                    </div>
                  </div>
                </div>

                {/* PDF Download */}
                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-white rounded-xl p-5 flex items-center gap-4 transition group"
                >
                  <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition">
                    📄
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm mb-0.5">
                      Download as PDF
                    </div>
                    <div className="text-gray-500 text-xs">
                      Best for sending by email or applying online
                    </div>
                  </div>
                  <div className="ml-auto text-gray-600 group-hover:text-red-400 transition text-lg">
                    ⬇
                  </div>
                </button>

                {/* Word Download */}
                <button
                  onClick={handleDownloadWord}
                  className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-white rounded-xl p-5 flex items-center gap-4 transition group"
                >
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition">
                    📝
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm mb-0.5">
                      Download as Word (.docx)
                    </div>
                    <div className="text-gray-500 text-xs">
                      Best for editing or submitting to HR systems
                    </div>
                  </div>
                  <div className="ml-auto text-gray-600 group-hover:text-blue-400 transition text-lg">
                    ⬇
                  </div>
                </button>

                {/* Regenerate */}
                <button
                  onClick={handleGenerate}
                  className="w-full text-gray-500 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl py-3 text-sm transition"
                >
                  ↺ Regenerate Resume
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="text-6xl">📋</div>
                <div>
                  <h3 className="text-gray-400 font-semibold mb-2">
                    Your resume will be ready here
                  </h3>
                  <p className="text-gray-600 text-sm max-w-xs">
                    Fill in your details on the left and click Generate. You can
                    download as PDF or Word.
                  </p>
                </div>

                {/* Format badges */}
                <div className="flex gap-3 mt-2">
                  <div className="bg-red-600/10 border border-red-600/20 rounded-lg px-4 py-2 text-center">
                    <div className="text-xl mb-1">📄</div>
                    <div className="text-red-400 text-xs font-bold">PDF</div>
                  </div>
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg px-4 py-2 text-center">
                    <div className="text-xl mb-1">📝</div>
                    <div className="text-blue-400 text-xs font-bold">WORD</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
