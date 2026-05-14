// src/components/Sidebar.js
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "resume-builder", label: "Resume Builder", icon: "📄" },
  { id: "resume-analyzer", label: "Resume Analyzer", icon: "🔍" },
  { id: "career-roadmap", label: "Career Roadmap", icon: "🗺️" },
  { id: "interview-sim", label: "Interview Sim", icon: "🎤" },
  { id: "skill-gap", label: "Skill Gap", icon: "📊" },
  { id: "cover-letter", label: "Cover Letter", icon: "✉️" },
  { id: "job-tracker", label: "Job Tracker", icon: "💼" },
  { id: "learning", label: "Learning Hub", icon: "📚" },
  { id: "productivity", label: "Productivity", icon: "🎯" },
];

function Sidebar({ currentPage, onNavigate }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOut(auth);
  }

  function handleNav(id) {
    onNavigate(id);
    setMobileOpen(false); // close menu on mobile after clicking
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-sm">
            ✦
          </div>
          <span className="text-white font-bold text-sm">
            Career<span className="text-violet-400">Purpose</span> AI
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-gray-500 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all
              ${
                currentPage === item.id
                  ? "bg-violet-600/20 text-violet-400 border border-violet-600/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* API Key */}
      <div className="p-3 border-t border-gray-800">
        <label className="text-gray-500 text-xs block mb-1">Groq API Key</label>
        <input
          type="password"
          defaultValue={localStorage.getItem("cp_gemini_key") || ""}
          onChange={(e) =>
            localStorage.setItem("cp_gemini_key", e.target.value)
          }
          placeholder="Paste Groq key..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-violet-500"
        />
        href="https://console.groq.com" target="_blank" rel="noreferrer"
        className="text-violet-400 text-xs mt-1 block hover:underline"
        <a>Get free Groq key &#8594;</a>
      </div>

      {/* User info */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={user?.photoURL || "https://ui-avatars.com/api/?name=User"}
            alt="avatar"
            className="w-7 h-7 rounded-full"
          />
          <div className="overflow-hidden">
            <div className="text-white text-xs font-semibold truncate">
              {user?.displayName || "User"}
            </div>
            <div className="text-gray-500 text-xs truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-500 hover:text-red-400 transition py-1"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP sidebar ─────────────────────── */}
      <div className="hidden md:flex flex-col w-56 min-w-56 bg-gray-900 border-r border-gray-800 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* ── MOBILE top bar ──────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-white text-xs">
            ✦
          </div>
          <span className="text-white font-bold text-sm">
            Career<span className="text-violet-400">Purpose</span> AI
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {/* ── MOBILE drawer overlay ────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="w-72 bg-gray-900 border-l border-gray-800 h-full overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
