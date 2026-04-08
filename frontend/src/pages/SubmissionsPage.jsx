function SubmissionsPage(props) {
  const {
    setPage,
    submissions,
    sortType,
    setSortType
  } = props

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortType === "latest") return new Date(b.date || 0) - new Date(a.date || 0)
    if (sortType === "score") return b.score - a.score
    return 0
  })

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

          <div className="mb-4 flex justify-end">
            <select
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
                      <th className="p-4">Score</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                  </tr>
              </thead>

              <tbody>
                {sortedSubmissions.length > 0 ? (
                  sortedSubmissions.map((s, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition duration-200"
                    >
                      <td className="p-4">{s.task_id}</td>
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
                      <td className="p-4 text-slate-400">{s.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-slate-400">
                      No submissions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </>
  )
}

export default SubmissionsPage