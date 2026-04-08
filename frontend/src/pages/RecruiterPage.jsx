import { Star } from "lucide-react"

function RecruiterPage(props) {
  const {
    setPage,
    recruiterData,
    selectedCandidate,
    setSelectedCandidate,
    candidateSort,
    setCandidateSort,
    skillFilter,
    setSkillFilter,
    shortlisted,
    setShortlisted,
    rejected,
    setRejected
  } = props

  const sortedCandidates = [...recruiterData].sort((a, b) => {
    if (candidateSort === "score") return b.average_score - a.average_score
    if (candidateSort === "submissions") return b.total_submissions - a.total_submissions
    return 0
  })

  const filteredCandidates = sortedCandidates.filter(u => {
    if (!skillFilter) return true
    return Object.keys(u.skills || {}).includes(skillFilter)
  })

  const bestCandidate = sortedCandidates[0]

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
            Candidate Overview
          </h1>
        </div>

        {/* TABLE VIEW */}
        {!selectedCandidate && (
          <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b border-slate-700">
              <div className="flex gap-3">
                <select
                  value={candidateSort}
                  onChange={(e) => setCandidateSort(e.target.value)}
                  className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm"
                >
                  <option value="score">Sort by Score</option>
                  <option value="submissions">Sort by Submissions</option>
                </select>

                <input
                  placeholder="Filter by skill (e.g. Array)"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm w-48 md:w-64"
                />
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-700 text-slate-300 text-sm uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Submissions</th>
                  <th className="p-4 text-center">Avg Score</th>
                  <th className="p-4 text-center">Level</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.map((u, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedCandidate(u)}
                    className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition"
                  >
                    {/* NAME */}
                    <td className="p-4 font-medium flex items-center gap-2">
                      {u.name}
                      {bestCandidate?.email === u.email && (
                        <Star
                          size={16}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      )}
                    </td>

                    {/* EMAIL */}
                    <td className="p-4 text-slate-400">{u.email}</td>

                    {/* SUBMISSIONS */}
                    <td className="p-4 text-center">{u.total_submissions}</td>

                    {/* SCORE */}
                    <td className="p-4 text-center font-semibold">
                      {u.average_score}
                    </td>

                    {/* LEVEL */}
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          u.skill_level === "Advanced"
                            ? "bg-green-500/20 text-green-400"
                            : u.skill_level === "Intermediate"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {u.skill_level}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="p-4 text-center">
                      {shortlisted.includes(u.email) && (
                        <span className="text-green-400 text-sm">Shortlisted</span>
                      )}
                      {rejected.includes(u.email) && (
                        <span className="text-red-400 text-sm">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recruiterData.length === 0 && (
              <p className="text-center text-slate-400 p-6">
                No candidates found
              </p>
            )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {selectedCandidate && (
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg max-w-2xl">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="mb-4 bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
            >
              ← Back to list
            </button>

            {bestCandidate?.email === selectedCandidate.email && (
              <p className="flex items-center gap-2 text-yellow-400 mt-2">
                <Star size={18} className="fill-yellow-400" />
                Top Performer
              </p>             
            )}

            <h2 className="text-xl font-bold text-purple-400">
              {selectedCandidate.name}
            </h2>

            <p className="text-slate-400 mb-4">
              {selectedCandidate.email}
            </p>

            <div className="flex gap-6 text-sm text-slate-300 mb-6">
              <p>Submissions: {selectedCandidate.total_submissions}</p>
              <p>Avg Score: {selectedCandidate.average_score}</p>
              <p>Level: {selectedCandidate.skill_level}</p>
            </div>

            {/* Skills */}
            <h3 className="text-lg text-purple-300 mb-2">Skill Breakdown</h3>

            {Object.keys(selectedCandidate.skills || {}).length === 0 ? (
              <p className="text-slate-400">No skill data available</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(selectedCandidate.skills).map(([skill, score]) => (
                  <div key={skill} className="flex justify-between text-sm">
                    <span>{skill}</span>
                    <span className="text-purple-400">{score}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShortlisted([...shortlisted, selectedCandidate.email])}
                className="bg-green-500 px-4 py-2 rounded"
              >
                Shortlist
              </button>

              <button
                onClick={() => setRejected([...rejected, selectedCandidate.email])}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default RecruiterPage