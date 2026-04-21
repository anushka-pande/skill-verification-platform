import { Star } from "lucide-react"
import { useState } from "react"
import axios from "axios"

function RecruiterPage(props) {
  const [view, setView] = useState("overview")
  const {
    setPage,
    recruiterData,
    selectedCandidate,
    setSelectedCandidate,
    candidateSort,
    setCandidateSort,
    skillFilter,
    setSkillFilter,
    candidateStatus,
    setCandidateStatus,
    plagiarismData
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage("dashboard")}
              className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-purple-400">
              Recruiter Dashboard
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setView("overview")}
              className={`px-4 py-2 rounded-lg ${
                view === "overview"
                  ? "bg-purple-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              Candidate Overview
            </button>

            <button
              onClick={() => setView("plagiarism")}
              className={`px-4 py-2 rounded-lg ${
                view === "plagiarism"
                  ? "bg-red-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              Plagiarism Alerts
            </button>
          </div>
        </div>

        {view === "overview" && (
          <>
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
                          {candidateStatus[u.email] === "shortlisted" && (
                            <span className="text-green-400 text-sm">Shortlisted</span>
                          )}

                          {candidateStatus[u.email] === "rejected" && (
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
                    onClick={async () => {
                      await axios.post(
                        "http://127.0.0.1:8000/recruiter/status",
                        {
                          email: selectedCandidate.email,
                          status: "shortlisted"
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                          }
                        }
                      )

                      setCandidateStatus({
                        ...candidateStatus,
                        [selectedCandidate.email]: "shortlisted"
                      })
                    }}
                    className="bg-green-500 px-4 py-2 rounded"
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={async () => {
                      await axios.post(
                        "http://127.0.0.1:8000/recruiter/status",
                        {
                          email: selectedCandidate.email,
                          status: "rejected"
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                          }
                        }
                      )

                      setCandidateStatus({
                        ...candidateStatus,
                        [selectedCandidate.email]: "rejected"
                      })
                    }}
                    className="bg-red-500 px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {view === "plagiarism" && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-6">
              Plagiarism Alerts
            </h2>

            {plagiarismData.length === 0 ? (
              <p className="text-slate-400">
                No suspicious submissions found.
              </p>
            ) : (
              <div className="space-y-4">
                {plagiarismData.map((p, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 p-4 rounded-lg border-l-4 border-red-400"
                  >
                    <p className="font-semibold text-white">
                      {p.task_id}
                    </p>

                    <p className="text-slate-300 mt-1">
                      User {p.user1} ↔ User {p.user2}
                    </p>

                    <p className="text-red-400 font-bold mt-2">
                      Similarity: {p.similarity}%
                    </p>

                    <p className="text-slate-400 text-sm">
                      Language: {p.language}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default RecruiterPage