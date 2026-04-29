import { useState } from "react"
import {
  FiArrowLeft,
  FiSearch,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiAward,
  FiX
} from "react-icons/fi"

function SubmissionsPage(props) {
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [submissionSearch, setSubmissionSearch] = useState("")
  const {
    setPage,
    submissions,
    sortType,
    setSortType,
  } = props

  const safeSubmissions = submissions || []

  const filteredSubmissions = safeSubmissions.filter((s) => {
    const task = String(s.task_id || "").trim().toLowerCase()
    const query = String(submissionSearch || "").trim().toLowerCase()

    return task.includes(query)
  })

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (sortType === "latest")
      return new Date(b.date || 0) - new Date(a.date || 0)

    if (sortType === "score")
      return b.score - a.score

    return 0
  })

  const total = safeSubmissions.length
  const passed = safeSubmissions.filter(s => s.status === "Passed").length
  const failed = safeSubmissions.filter(s => s.status === "Failed").length
  const best = safeSubmissions.length
    ? Math.max(...safeSubmissions.map(s => s.score || 0))
    : 0

  const avg = safeSubmissions.length
    ? (
        safeSubmissions.reduce(
          (sum, s) => sum + (s.score || 0), 0
        ) / safeSubmissions.length
      ).toFixed(1)
    : 0

  return (
    <>
      <div className="page-shell text-main fade-in">
          {/* Top Bar */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setPage("dashboard")}
              className="btn-glass px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FiArrowLeft className="text-[var(--icon)] text-[18px]" />
              Back
            </button>

            <h1 className="text-2xl font-bold text-accent">
              Submission History
            </h1>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Total</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <FiTrendingUp className="text-[var(--icon)] text-xl" />
            </div>

            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Passed</p>
                <p className="text-2xl font-bold text-success">{passed}</p>
              </div>
              <FiCheckCircle className="text-success text-xl" />
            </div>

            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Failed</p>
                <p className="text-2xl font-bold text-danger">{failed}</p>
              </div>
              <FiXCircle className="text-danger text-xl" />
            </div>

            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Best</p>
                <p className="text-2xl font-bold text-warning">{best}</p>
              </div>
              <FiAward className="text-warning text-xl" />
            </div>

            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Avg</p>
                <p className="text-2xl font-bold text-accent">{avg}</p>
              </div>
              <FiTrendingUp className="text-accent text-xl" />
            </div>

          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--icon)]" />

              <input
                placeholder="Search by task..."
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                className="themed-input pl-10 pr-4 py-2 rounded-lg w-full"
              />
            </div>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="glass border border-[var(--border)] px-3 py-2 rounded-lg"
            >
              <option value="latest">Latest</option>
              <option value="score">Highest Score</option>
            </select>
          </div>

          {/* Table */}
          <div className="glass rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="themed-input subtle">
                    <tr>
                        <th className="p-4">Task</th>
                        <th className="p-4">Language</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                    </tr>
                </thead>

                <tbody>
                  {sortedSubmissions.length > 0 ? (
                    sortedSubmissions.map((s, index) => (
                      <tr
                        onClick={() => setSelectedSubmission(s)}
                        key={index}
                        className="border-b border-[var(--border)] hover:themed-input transition duration-200 cursor-pointer"
                      >
                        <td className="p-4">{s.task_id}</td>
                        <td className="p-4 uppercase text-accent">
                          {s.language}
                        </td>
                        <td className={`p-4 font-semibold ${
                          s.score >= 80
                            ? "text-success"
                            : s.score >= 50
                            ? "text-warning"
                            : "text-danger"
                        }`}>
                          {s.score}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            s.status === "Passed"
                              ? "bg-[rgba(34,197,94,0.15)] text-success border border-[rgba(34,197,94,0.3)]"
                              : "bg-[rgba(239,68,68,0.15)] text-danger border border-[rgba(239,68,68,0.3)]"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-4 subtle">
                          {new Date(s.date).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-4 text-center subtle">
                        No submissions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {selectedSubmission && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="glass w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-accent">
                  {selectedSubmission.task_id}
                </h2>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="themed-input px-3 py-2 rounded flex items-center justify-center"
                >
                  <FiX className="text-[var(--icon)] text-[18px]" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="themed-input p-3 rounded">
                  Score: {selectedSubmission.score}
                </div>
                <div className="themed-input p-3 rounded">
                  Exec: {selectedSubmission.execution_score}
                </div>
                <div className="themed-input p-3 rounded">
                  Quality: {selectedSubmission.quality_score}
                </div>
                <div className="themed-input p-3 rounded">
                  Time: {selectedSubmission.time_score}
                </div>
              </div>

              <p className="mb-3 subtle uppercase">
                Language: {selectedSubmission.language}
              </p>

              <h3 className="text-accent mb-2">
                Submitted Code
              </h3>

              <pre className="glass p-4 rounded-lg overflow-x-auto text-sm mb-6">
                {selectedSubmission.code}
              </pre>

              <h3 className="text-accent mb-3">
                Test Cases
              </h3>

              <div className="space-y-3">
                {(selectedSubmission.details || []).map((t, i) => (
                  <div
                    key={i}
                    className="themed-input p-3 rounded"
                  >
                    <p>Case {i + 1}</p>
                    <p className="flex items-center gap-2">
                      {t.status === "passed" ? (
                        <FiCheckCircle className="text-success" />
                      ) : (
                        <FiXCircle className="text-danger" />
                      )}
                      {t.status}
                    </p>
                    <p>Expected: {t.expected}</p>
                    <p>Actual: {t.actual}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </>
      )}
    </>
  )
}

export default SubmissionsPage