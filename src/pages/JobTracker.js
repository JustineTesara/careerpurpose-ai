// src/pages/JobTracker.js
import { useState, useEffect } from "react";

const STATUS_STYLES = {
  Applied: {
    bg: "bg-violet-600/15",
    text: "text-violet-400",
    border: "border-violet-600/30",
  },
  Interview: {
    bg: "bg-amber-600/15",
    text: "text-amber-400",
    border: "border-amber-600/30",
  },
  Offer: {
    bg: "bg-green-600/15",
    text: "text-green-400",
    border: "border-green-600/30",
  },
  Rejected: {
    bg: "bg-red-600/15",
    text: "text-red-400",
    border: "border-red-600/30",
  },
  Ghosted: {
    bg: "bg-gray-600/15",
    text: "text-gray-400",
    border: "border-gray-600/30",
  },
};

const EMPTY_FORM = {
  title: "",
  company: "",
  location: "",
  salary: "",
  link: "",
  status: "Applied",
  notes: "",
};

function JobTracker() {
  const [jobs, setJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cp_jobs") || "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // Save to localStorage whenever jobs change
  useEffect(() => {
    localStorage.setItem("cp_jobs", JSON.stringify(jobs));
    localStorage.setItem("cp_jobs_count", jobs.length);
  }, [jobs]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.title || !form.company) {
      alert("Please fill in Job Title and Company.");
      return;
    }

    if (editId !== null) {
      // Update existing
      setJobs((prev) =>
        prev.map((j) => (j.id === editId ? { ...form, id: editId } : j)),
      );
      setEditId(null);
    } else {
      // Add new
      const newJob = {
        ...form,
        id: Date.now(),
        dateAdded: new Date().toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      setJobs((prev) => [newJob, ...prev]);
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleEdit(job) {
    setForm(job);
    setEditId(job.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (window.confirm("Delete this job?")) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  }

  function handleStatusChange(id, newStatus) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j)),
    );
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  }

  // Filter + search
  const filtered = jobs.filter((j) => {
    const matchFilter = filter === "All" || j.status === filter;
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Stats
  const stats = Object.keys(STATUS_STYLES).map((s) => ({
    label: s,
    count: jobs.filter((j) => j.status === s).length,
    style: STATUS_STYLES[s],
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Job Tracker</h1>
          <p className="text-gray-400 text-sm">
            Track your job applications and interview schedule
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm(EMPTY_FORM);
          }}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
        >
          {showForm ? "✕ Cancel" : "+ Add Job"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{jobs.length}</div>
          <div className="text-gray-500 text-xs mt-0.5">Total</div>
        </div>
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.style.bg} border ${s.style.border} rounded-xl p-3 text-center`}
          >
            <div className={`text-2xl font-bold ${s.style.text}`}>
              {s.count}
            </div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-gray-900 border border-violet-600/30 rounded-xl p-5 mb-6">
          <h2 className="text-white font-bold text-sm mb-4">
            {editId !== null ? "✏️ Edit Job" : "➕ Add New Job"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {[
              {
                label: "Job Title *",
                field: "title",
                placeholder: "e.g. Customer Service Rep",
              },
              {
                label: "Company *",
                field: "company",
                placeholder: "e.g. Concentrix",
              },
              {
                label: "Location",
                field: "location",
                placeholder: "e.g. Makati, WFH, Hybrid",
              },
              {
                label: "Salary Range",
                field: "salary",
                placeholder: "e.g. ₱20,000 - ₱25,000",
              },
              {
                label: "Job Post URL",
                field: "link",
                placeholder: "e.g. linkedin.com/jobs/...",
              },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="text-gray-500 text-xs block mb-1">
                  {label}
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className="text-gray-500 text-xs block mb-1">Status</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {Object.keys(STATUS_STYLES).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-gray-500 text-xs block mb-1">Notes</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500 resize-none"
              rows={2}
              placeholder="e.g. Interview scheduled for May 20 at 2pm, contact: hr@company.com"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition"
            >
              {editId !== null ? "Save Changes" : "Add Job"}
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white border border-gray-700 px-6 py-2 rounded-xl text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-violet-500"
          placeholder="Search by job title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {["All", ...Object.keys(STATUS_STYLES)].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === s
                  ? "bg-violet-600 text-white"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">💼</div>
          <h3 className="text-gray-400 font-semibold mb-1">
            {jobs.length === 0 ? "No jobs tracked yet" : "No results found"}
          </h3>
          <p className="text-gray-600 text-sm">
            {jobs.length === 0
              ? "Click '+ Add Job' to start tracking your applications"
              : "Try a different search or filter"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => {
            const style = STATUS_STYLES[job.status] || STATUS_STYLES["Applied"];
            return (
              <div
                key={job.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Company initial */}
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {job.company?.[0]?.toUpperCase() || "?"}
                  </div>

                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold text-sm">
                        {job.title}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mb-1">
                      {job.company}
                      {job.location && (
                        <span className="text-gray-600"> · {job.location}</span>
                      )}
                      {job.salary && (
                        <span className="text-gray-600"> · {job.salary}</span>
                      )}
                    </div>
                    {job.notes && (
                      <div className="text-gray-500 text-xs mt-1 italic">
                        {job.notes}
                      </div>
                    )}
                    {job.link && (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 text-xs hover:underline mt-1 block"
                      >
                        View job post →
                      </a>
                    )}
                  </div>

                  {/* Right side: status change + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <select
                      value={job.status}
                      onChange={(e) =>
                        handleStatusChange(job.id, e.target.value)
                      }
                      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-xs outline-none"
                    >
                      {Object.keys(STATUS_STYLES).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-gray-500 hover:text-white text-xs border border-gray-700 rounded-lg px-2 py-1 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-gray-500 hover:text-red-400 text-xs border border-gray-700 rounded-lg px-2 py-1 transition"
                      >
                        Delete
                      </button>
                    </div>
                    {job.dateAdded && (
                      <span className="text-gray-600 text-xs">
                        {job.dateAdded}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobTracker;
