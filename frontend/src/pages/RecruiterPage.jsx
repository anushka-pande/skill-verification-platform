import { Star } from "lucide-react"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import { 
  BarChart, Bar, 
  LineChart, Line,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts"

function RecruiterPage(props) {
  const [view, setView] = useState("overview")
  const [candidateSubmissions, setCandidateSubmissions] = useState([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [drawerTab, setDrawerTab] = useState("profile")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [candidateNote, setCandidateNote] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [submissionDetail, setSubmissionDetail] = useState(null)
  const perPage = 5
  const token = sessionStorage.getItem("token")
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

  const filteredCandidates = recruiterData.filter((candidate) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      candidate.name.toLowerCase().includes(search) ||
      candidate.email.toLowerCase().includes(search)

    const matchesSkill =
      skillFilter.trim() === "" ||
      Object.keys(candidate.skills || {}).some(skill =>
        skill.toLowerCase().includes(skillFilter.toLowerCase())
      )

    return matchesSearch && matchesSkill
  })

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (candidateSort === "rank") {
      return a.rank - b.rank
    }

    if (candidateSort === "score") {
      return b.average_score - a.average_score
    }

    if (candidateSort === "submissions") {
      return b.total_submissions - a.total_submissions
    }

    if (candidateSort === "name") {
      return a.name.localeCompare(b.name)
    }

    return 0
  })

  const totalPages = Math.ceil(
    sortedCandidates.length / perPage
  )

  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage

  const paginatedCandidates =
    sortedCandidates.slice(startIndex, endIndex)

  const bestCandidate = recruiterData.find(c => c.rank === 1)

  const totalCandidates = recruiterData.length

  const shortlistedCount = Object.values(candidateStatus).filter(
    s => s === "shortlisted"
  ).length

  const rejectedCount = Object.values(candidateStatus).filter(
    s => s === "rejected"
  ).length

  const avgScore =
    recruiterData.length > 0
      ? (
          recruiterData.reduce(
            (sum, c) => sum + c.average_score,
            0
          ) / recruiterData.length
        ).toFixed(1)
      : 0

  const downloadCSV = () => {
    if (!selectedCandidate) return

    const rows = [
      ["Task Name", "Score", "Status", "Date"]
    ]

    candidateSubmissions.forEach((item) => {
      rows.push([
        item.task_id,
        item.score,
        item.status,
        item.date
      ])
    })

    const csvContent = rows
      .map(row => row.map(value => `"${value}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url

    link.download =
      `${selectedCandidate.name}_report.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    toast.success("Report downloaded")
  }

  const skillChartData = selectedCandidate
    ? Object.entries(selectedCandidate.skills || {}).map(
        ([skill, score]) => ({
          skill,
          score
        })
      )
    : []

  const trendData = candidateSubmissions.map((item, index) => ({
    name: item.task_id.length > 12
      ? item.task_id.slice(0, 12) + "..."
      : item.task_id,
    score: item.score || 0,
    index: index + 1
  }))

  const downloadAllCSV = () => {
    const rows = [
      ["Name", "Email", "Avg Score", "Submissions", "Level"]
    ]

    recruiterData.forEach((c) => {
      rows.push([
        c.name,
        c.email,
        c.average_score,
        c.total_submissions,
        c.skill_level
      ])
    })

    const csv = rows.map(r => r.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "all_candidates.csv"
    a.click()

    URL.revokeObjectURL(url)

    toast.success("All candidates exported")
  }

  useEffect(() => {
    if (!selectedCandidate) return

    const loadDetails = async () => {
      try {
        setLoadingDetails(true)

        const token = sessionStorage.getItem("token")

        // submissions
        const res = await axios.get(
          `http://127.0.0.1:8000/submissions/${selectedCandidate.id || selectedCandidate.user_id}`
        )

        setCandidateSubmissions(res.data)

        // recruiter note
        const noteRes = await axios.get(
          `http://127.0.0.1:8000/recruiter/note/${selectedCandidate.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        setCandidateNote(noteRes.data.note)

      } catch (err) {
        console.log(err)
        setCandidateSubmissions([])
        setCandidateNote("")
      } finally {
        setLoadingDetails(false)
      }
    }

    loadDetails()

  }, [selectedCandidate])

  return (
    <>
      <div className={`min-h-screen bg-slate-900 p-10 text-white transition-all duration-300 ${
        selectedCandidate ? "pr-[540px]" : ""
      }`}>
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

          <div className="flex items-center gap-3">
            <button
              onClick={downloadAllCSV}
              className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold"
            >
              Export All CSV
            </button>

            <button
              onClick={async () => {
                try {
                  const res = await axios.post(
                    "http://127.0.0.1:8000/recruiter/email-shortlisted",
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  )
                  toast.success(res.data.message)
                } catch(err) {
                  console.log(err)
                  toast.error(err.response?.data?.detail || err.message)
                }
              }}
              className="bg-emerald-500 px-4 py-2 rounded-lg"
            >
              Email Shortlisted
            </button>

            <div className="flex bg-slate-800 rounded-xl p-1 w-fit shadow-md">
              <button
                onClick={() => setView("overview")}
                className={`px-5 py-2 rounded-lg transition ${
                  view === "overview"
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                Candidate Overview
              </button>

              <button
                onClick={() => setView("plagiarism")}
                className={`px-5 py-2 rounded-lg transition ${
                  view === "plagiarism"
                    ? "bg-red-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                Plagiarism Alerts
              </button>
            </div>
          </div>
        </div>

        {view === "overview" && (
          <>
            {!selectedCandidate && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-xl shadow">
                  <p className="text-slate-400 text-sm">Total Candidates</p>
                  <h3 className="text-2xl font-bold text-white">
                    {totalCandidates}
                  </h3>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl shadow">
                  <p className="text-slate-400 text-sm">Shortlisted</p>
                  <h3 className="text-2xl font-bold text-green-400">
                    {shortlistedCount}
                  </h3>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl shadow">
                  <p className="text-slate-400 text-sm">Rejected</p>
                  <h3 className="text-2xl font-bold text-red-400">
                    {rejectedCount}
                  </h3>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl shadow">
                  <p className="text-slate-400 text-sm">Top Performer</p>
                  <h3 className="text-lg font-bold text-yellow-400 truncate">
                    {bestCandidate?.name || "-"}
                  </h3>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl shadow">
                  <p className="text-slate-400 text-sm">Avg Score</p>
                  <h3 className="text-2xl font-bold text-purple-400">
                    {avgScore}
                  </h3>
                </div>
              </div>
            )}

            {/* TABLE VIEW */}
            {!selectedCandidate && (
              <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b border-slate-700">
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={candidateSort}
                      onChange={(e) => {
                        setCandidateSort(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm"
                    >
                      <option value="rank">Sort by Rank</option>
                      <option value="score">Sort by Avg Score</option>
                      <option value="submissions">Sort by Submissions</option>
                      <option value="name">Sort by Name</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Search name or email"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm w-56"
                    />

                    <input
                      placeholder="Filter by skill"
                      value={skillFilter}
                      onChange={(e) => {
                        setSkillFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm w-48"
                    />
                  </div>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-slate-700 text-slate-300 text-sm uppercase">
                    <tr>
                      <th className="p-4">Rank</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-center">Submissions</th>
                      <th className="p-4 text-center">Recruiter Score</th>
                      <th className="p-4 text-center">Avg Score</th>
                      <th className="p-4 text-center">Level</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedCandidates.map((u, i) => (
                      <tr
                        key={i}
                        onClick={() => setSelectedCandidate(u)}
                        className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition"
                      >
                        <td className="p-4 font-bold text-yellow-400">
                          #{u.rank}
                        </td>
                        {/* Name */}
                        <td className="p-4 font-medium flex items-center gap-2">
                          {u.name}
                          {u.rank === 1 && (
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          )}
                        </td>

                        {/* Email */}
                        <td className="p-4 text-slate-400">{u.email}</td>

                        {/* Submissions */}
                        <td className="p-4 text-center">{u.total_submissions}</td>

                        {/* Recruiter score */}
                        <td className="p-4 text-center text-purple-400 font-bold">
                          {u.rank_score}
                        </td>

                        {/* Score */}
                        <td className="p-4 text-center font-semibold">
                          {u.average_score}
                        </td>

                        {/* Level */}
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

                        {/* Status */}
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

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 p-4 border-t border-slate-700">

                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-4 py-2 rounded bg-slate-700 disabled:opacity-40"
                    >
                      Prev
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-4 py-2 rounded bg-slate-700 disabled:opacity-40"
                    >
                      Next
                    </button>

                  </div>
                )}

                {sortedCandidates.length === 0 && (
                  <p className="text-center text-slate-400 p-6">
                    No candidates found
                  </p>
                )}
              </div>
            )}

            {/* DETAIL VIEW */}
            {selectedCandidate && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-40 transition-all duration-300"
                  onClick={() => setSelectedCandidate(null)}
                />

                {/* Drawer */}
                <div className="fixed top-0 right-0 h-full w-full md:w-[540px] bg-slate-800 z-50 shadow-2xl overflow-y-auto p-6 border-l border-slate-700 transform transition-transform duration-300 translate-x-0">

                  {/* Header */}
                  <div className="mb-6 border-b border-slate-700 pb-4">

                    {/* Row 1 */}
                    <div className="flex justify-between items-start gap-3">
                      
                      <div className="min-w-0">
                        <h2 className="text-3xl font-bold text-purple-400 truncate">
                          {selectedCandidate.name}
                        </h2>

                        <p className="text-slate-400 text-sm truncate">
                          {selectedCandidate.email}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedCandidate(null)}
                        className="shrink-0 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Row 2 Tabs */}
                    <div className="mt-4 overflow-x-auto">
                      <div className="flex gap-2 min-w-max">
                        {["profile", "submissions", "skills", "export"].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setDrawerTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm capitalize whitespace-nowrap transition ${
                              drawerTab === tab
                                ? "bg-purple-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {drawerTab === "profile" && (
                    <>
                      {/* Profile */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-700 p-3 rounded">
                          <p className="text-xs text-slate-400">Submissions</p>
                          <p className="font-bold">{selectedCandidate.total_submissions}</p>
                        </div>

                        <div className="bg-slate-700 p-3 rounded">
                          <p className="text-xs text-slate-400">Avg Score</p>
                          <p className="font-bold">{selectedCandidate.average_score}</p>
                        </div>

                        <div className="bg-slate-700 p-3 rounded">
                          <p className="text-xs text-slate-400">Level</p>
                          <p className="font-bold">{selectedCandidate.skill_level}</p>
                        </div>

                        <div className="mt-6 w-full col-span-3">
                          <p className="text-sm text-slate-400 mb-2">
                            Recruiter Notes
                          </p>

                          <textarea
                            value={candidateNote}
                            onChange={(e) => setCandidateNote(e.target.value)}
                            rows="4"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <button
                            onClick={async () => {
                              await axios.post(
                                "http://127.0.0.1:8000/recruiter/note",
                                {
                                  email: selectedCandidate.email,
                                  note: candidateNote
                                },
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`
                                  }
                                }
                              )
                              toast.success("Note saved")
                            }}
                            className="mt-3 w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {drawerTab === "skills" && (
                    <>
                      {/* Skills */}
                      <h3 className="text-lg text-purple-300 mb-4">
                        Skill Breakdown
                      </h3>

                      <div className="bg-slate-800 rounded-xl p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={skillChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                            <XAxis
                              dataKey="skill"
                              stroke="#cbd5e1"
                            />

                            <YAxis
                              domain={[0, 100]}
                              stroke="#cbd5e1"
                            />

                            <Tooltip />

                            <Bar
                              dataKey="score"
                              radius={[6, 6, 0, 0]}
                              fill="#a855f7"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}

                  {drawerTab === "submissions" && (
                    <>
                      {/* Submissions */}
                      <h3 className="text-lg text-purple-300 mb-4">
                        Score Trend
                      </h3>

                      <div className="bg-slate-800 rounded-xl p-4 h-72 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                            <XAxis
                              dataKey="name"
                              stroke="#cbd5e1"
                            />

                            <YAxis
                              domain={[0, 100]}
                              stroke="#cbd5e1"
                            />

                            <Tooltip />

                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#22c55e"
                              strokeWidth={3}
                              dot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <h3 className="text-lg text-purple-300 mb-3">
                        Submission History
                      </h3>

                      {loadingDetails ? (
                        <p className="text-slate-400">Loading...</p>
                      ) : candidateSubmissions.length === 0 ? (
                        <p className="text-slate-400">No submissions found</p>
                      ) : (
                        <div className="space-y-3 mb-6">
                          {candidateSubmissions.map((s, i) => (
                            <div key={i} 
                              onClick={async () => {
                                const res = await axios.get(
                                  `http://127.0.0.1:8000/recruiter/submission/${s.id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`
                                    }
                                  }
                                )
                                setSubmissionDetail(res.data)
                                setSelectedSubmission(s)
                              }}
                              className="bg-slate-700 p-3 rounded cursor-pointer hover:bg-slate-600 transition"
                            >
                              <p className="font-medium">{s.task_id}</p>
                              <p className="text-sm text-slate-300">
                                Score: {s.score}
                              </p>
                              <p className="text-xs text-slate-400">
                                {s.date}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {drawerTab === "export" && (
                    <div className="mb-6">
                      <button 
                        onClick={downloadCSV}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-lg font-semibold"
                      >
                        Download {selectedCandidate.name}'s Report
                      </button>

                      <p className="text-sm text-slate-400 mt-2">
                        Export this candidate's submission data.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-8">
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
                              Authorization: `Bearer ${sessionStorage.getItem("token")}`
                            }
                          }
                        )

                        setCandidateStatus({
                          ...candidateStatus,
                          [selectedCandidate.email]: "shortlisted"
                        })
                        toast.success("Candidate Shortlisted")
                      }}
                      className={`w-full py-3 rounded-lg font-semibold transition ${
                        candidateStatus[selectedCandidate.email] === "shortlisted"
                          ? "bg-green-500 text-white"
                          : "bg-slate-700 hover:bg-green-600"
                      }`}
                    >
                      {candidateStatus[selectedCandidate.email] === "shortlisted"
                        ? "✓ Shortlisted"
                        : "Shortlist"}
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
                              Authorization: `Bearer ${sessionStorage.getItem("token")}`
                            }
                          }
                        )

                        setCandidateStatus({
                          ...candidateStatus,
                          [selectedCandidate.email]: "rejected"
                        })
                        toast.success("Candidate Rejected")
                      }}
                      className={`w-full py-3 rounded-lg font-semibold transition ${
                        candidateStatus[selectedCandidate.email] === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-slate-700 hover:bg-red-600"
                      }`}
                    >
                      {candidateStatus[selectedCandidate.email] === "rejected"
                        ? "✕ Rejected"
                        : "Reject"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {view === "plagiarism" && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-400">
                Plagiarism Alerts
              </h2>

              <span className="text-sm text-slate-400">
                {plagiarismData.length} flagged pair(s)
              </span>
            </div>

            {plagiarismData.length === 0 ? (
              <p className="text-slate-400">
                No suspicious submissions found.
              </p>
            ) : (
              <div className="space-y-4">
                {plagiarismData.map((p, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 p-5 rounded-xl border-l-4 border-red-400 hover:bg-slate-700/80 transition"
                  >
                    {/* Task */}
                    <p className="font-semibold text-white text-lg">
                      {p.task_id}
                    </p>

                    {/* Users */}
                    <div className="mt-2">
                      <p className="text-slate-200 font-medium">
                        {p.user1_name || `User ${p.user1}`} ↔{" "}
                        {p.user2_name || `User ${p.user2}`}
                      </p>

                      {(p.user1_email || p.user2_email) && (
                        <p className="text-xs text-slate-400 mt-1">
                          {p.user1_email} • {p.user2_email}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                        Similarity: {p.similarity}%
                      </span>

                      <span className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full text-sm">
                        {p.language?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedSubmission && submissionDetail && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[80] p-6">
            <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400">
                  {submissionDetail.task_id}
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
                  Score: {submissionDetail.score}
                </div>

                <div className="bg-slate-700 p-3 rounded">
                  Exec: {submissionDetail.execution_score}
                </div>

                <div className="bg-slate-700 p-3 rounded">
                  Quality: {submissionDetail.quality_score}
                </div>

                <div className="bg-slate-700 p-3 rounded">
                  Time: {submissionDetail.time_score}
                </div>
              </div>

              <p className="mb-3 text-slate-400">
                Language: {submissionDetail.language}
              </p>

              <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm mb-6">
      {submissionDetail.code}
              </pre>

              <h3 className="text-lg text-purple-300 mb-3">
                Test Case Results
              </h3>

              <div className="space-y-3">
                {submissionDetail.details.map((t, i) => (
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

export default RecruiterPage