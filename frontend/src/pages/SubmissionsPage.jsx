import { useState } from "react"

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
      <div className="min-h-screen bg-slate-900 p-10 text-white">
          {/* Top Bar */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setPage("dashboard")}
              className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-purple-400">
              Submission History
            </h1>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-xl">
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl">
              <p className="text-slate-400 text-sm">Passed</p>
              <p className="text-2xl font-bold text-green-400">{passed}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl">
              <p className="text-slate-400 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-400">{failed}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl">
              <p className="text-slate-400 text-sm">Best</p>
              <p className="text-2xl font-bold text-yellow-400">{best}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl">
              <p className="text-slate-400 text-sm">Avg</p>
              <p className="text-2xl font-bold text-purple-400">{avg}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <input
              placeholder="Search by task..."
              value={submissionSearch}
              onChange={(e) =>
                setSubmissionSearch(e.target.value)
              }
              className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg w-full md:w-80"
            />

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg"
            >
              <option value="latest">Latest</option>
              <option value="score">Highest Score</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left">
              <thead className="bg-slate-700 text-slate-300">
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
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition duration-200 cursor-pointer"
                    >
                      <td className="p-4">{s.task_id}</td>
                      <td className="p-4 uppercase text-cyan-400">
                        {s.language}
                      </td>
                      <td className={`p-4 font-semibold ${
                        s.score >= 80
                          ? "text-green-400"
                          : s.score >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}>
                        {s.score}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          s.status === "Passed"
                            ? "bg-green-500/20 text-green-400 border border-green-400/30"
                            : "bg-red-500/20 text-red-400 border border-red-400/30"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(s.date).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-400">
                      No submissions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      {selectedSubmission && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400">
                  {selectedSubmission.task_id}
                </h2>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="bg-slate-700 px-3 py-2 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700 p-3 rounded">
                  Score: {selectedSubmission.score}
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  Exec: {selectedSubmission.execution_score}
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  Quality: {selectedSubmission.quality_score}
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  Time: {selectedSubmission.time_score}
                </div>
              </div>

              <p className="mb-3 text-slate-400 uppercase">
                Language: {selectedSubmission.language}
              </p>

              <h3 className="text-purple-300 mb-2">
                Submitted Code
              </h3>

              <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm mb-6">
                {selectedSubmission.code}
              </pre>

              <h3 className="text-purple-300 mb-3">
                Test Cases
              </h3>

              <div className="space-y-3">
                {(selectedSubmission.details || []).map((t, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 p-3 rounded"
                  >
                    <p>Case {i + 1}</p>
                    <p>Status: {t.status}</p>
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