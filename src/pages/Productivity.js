// src/pages/Productivity.js
import { useState, useEffect } from "react";

function Productivity() {
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cp_goals") || "[]");
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Job Search");

  useEffect(() => {
    localStorage.setItem("cp_goals", JSON.stringify(goals));
    const done = goals.filter((g) => g.done).length;
    localStorage.setItem("cp_goals_done", done);
  }, [goals]);

  function addGoal() {
    if (!input.trim()) return;
    const newGoal = {
      id: Date.now(),
      text: input.trim(),
      category,
      done: false,
      date: new Date().toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
    };
    setGoals((prev) => [newGoal, ...prev]);
    setInput("");
  }

  function toggleGoal(id) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    );
  }

  function deleteGoal(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function clearCompleted() {
    setGoals((prev) => prev.filter((g) => !g.done));
  }

  const total = goals.length;
  const done = goals.filter((g) => g.done).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const pending = goals.filter((g) => !g.done);
  const completed = goals.filter((g) => g.done);

  const categoryColors = {
    "Job Search": "bg-violet-600/20 text-violet-400",
    Learning: "bg-teal-600/20 text-teal-400",
    Resume: "bg-amber-600/20 text-amber-400",
    Interview: "bg-blue-600/20 text-blue-400",
    Personal: "bg-pink-600/20 text-pink-400",
    Other: "bg-gray-600/20 text-gray-400",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">Productivity</h1>
        <p className="text-gray-400 text-sm">
          Track your daily career goals and stay on track
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{total}</div>
          <div className="text-gray-500 text-xs mt-1">Total Goals</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{done}</div>
          <div className="text-gray-500 text-xs mt-1">Completed</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-violet-400">{percent}%</div>
          <div className="text-gray-500 text-xs mt-1">Progress</div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* Add goal */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
          Add New Goal
        </h2>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
            placeholder="e.g. Apply to 3 jobs today, Study Excel for 1 hour..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
          />
          <select
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {Object.keys(categoryColors).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={addGoal}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
          >
            Add
          </button>
        </div>
        <p className="text-gray-600 text-xs">
          Press Enter or click Add to save your goal
        </p>
      </div>

      {/* Pending Goals */}
      {pending.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
            Pending ({pending.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={goal.done}
                  onChange={() => toggleGoal(goal.id)}
                  className="w-4 h-4 accent-violet-600 cursor-pointer flex-shrink-0"
                />
                <span className="flex-1 text-white text-sm">{goal.text}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[goal.category] || categoryColors["Other"]}`}
                >
                  {goal.category}
                </span>
                <span className="text-gray-600 text-xs flex-shrink-0">
                  {goal.date}
                </span>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-gray-600 hover:text-red-400 text-xs transition flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completed.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Completed ({completed.length}) ✅
            </h2>
            <button
              onClick={clearCompleted}
              className="text-gray-600 hover:text-red-400 text-xs transition"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {completed.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg opacity-60"
              >
                <input
                  type="checkbox"
                  checked={goal.done}
                  onChange={() => toggleGoal(goal.id)}
                  className="w-4 h-4 accent-violet-600 cursor-pointer flex-shrink-0"
                />
                <span className="flex-1 text-gray-500 text-sm line-through">
                  {goal.text}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[goal.category] || categoryColors["Other"]}`}
                >
                  {goal.category}
                </span>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-gray-600 hover:text-red-400 text-xs transition flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-gray-400 font-semibold mb-1">No goals yet</h3>
          <p className="text-gray-600 text-sm">
            Add your first daily goal above to start tracking your progress
          </p>
        </div>
      )}
    </div>
  );
}

export default Productivity;
