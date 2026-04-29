import { useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import {
  FiClipboard,
  FiSettings,
  FiUser,
  FiChevronDown,
  FiPlusCircle,
  FiBarChart2,
  FiSearch,
  FiLogOut,
  FiX
} from "react-icons/fi"

function Dashboard(props) {
  const [aiOpen, setAiOpen] = useState(false)
  const [coachText, setCoachText] = useState("")
  const [coachLoading, setCoachLoading] = useState(false)
  const [search, setSearch] = useState("")
  const role = sessionStorage.getItem("role")
  const {
    tasks,
    setPage,
    setSelectedTask,
    difficulty,
    setDifficulty,
    isAdmin,
    profileOpen,
    setProfileOpen,
    aiData,
    setAiData,
    aiLoading,
    setAiLoading
  } = props

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-shell">
        <div className="sticky top-0 z-40 glass rounded-2xl px-4 md:px-6 py-4 mb-8">
          <div className="flex flex-col xl:flex-row lg:items-center lg:justify-between gap-4">

            {/* LEFT */}
            <div>
              <h1 className="font-bold text-3xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
                Provenix
              </h1>

              <p className="text-sm subtle mt-1">
                {role === "recruiter"
                  ? "Assessment Catalog"
                  : "Coding Dashboard"}
              </p>
            </div>

            {/* CENTER SEARCH */}
            <div className="relative w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--icon)] opacity-90 text-[18px] pointer-events-none z-10" />

              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass rounded-xl pl-12 pr-4 py-3"
              />
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="glass px-4 py-3 rounded-xl text-main min-w-[100px]"
              >
                <option>All</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              {role === "candidate" && (
                <button
                  onClick={() => setPage("submissions")}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass hover:opacity-90"
                >
                  <FiClipboard className="text-[var(--icon)] opacity-90 text-[18px]" />
                    Submissions
                </button>
              )}

              {role === "recruiter" && (
                <>
                  <button
                    onClick={() => setPage("add-task")}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl glass hover:opacity-90 whitespace-nowrap"
                  >
                    <FiPlusCircle className="text-[var(--icon)] opacity-90 text-[18px]" />
                      Add Task
                  </button>

                  <button
                    onClick={() => setPage("recruiter")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass hover:opacity-90"
                  >
                    <FiBarChart2 className="text-[var(--icon)] opacity-90 text-[18px]" />
                      Reports
                  </button>
                </>
              )}

              <button
                onClick={() => setPage("settings")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass border border-[var(--border)]"
              >
                <FiSettings className="text-[var(--icon)] opacity-90 text-[18px]" />
                  Settings
              </button>

              {/* PROFILE */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass whitespace-nowrap"
                >
                  <FiUser className="text-[var(--icon)] opacity-90 text-[18px]" />
                    Profile
                  <FiChevronDown className="text-[var(--icon)] opacity-70 text-[16px]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 glass border border-[var(--border)] rounded-xl shadow-2xl z-50">

                    <button
                      onClick={() => {
                        setPage("profile")
                        setProfileOpen(false)
                      }}
                      className="w-full flex items-center justify-center text-left px-4 py-3 hover:themed-input"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        sessionStorage.clear()
                        setPage("auth")
                      }}
                      className="w-full flex items-center justify-center gap-2 text-left px-4 py-3 text-danger hover:themed-input"
                    >
                      <FiLogOut className="text-danger text-[18px]" />
                        Logout
                    </button>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 exl:grid-cols-4 gap-5">
          {filteredTasks.map((task, index) => (
            <div
            key={index}
            className="glass p-6 rounded-2xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold card-title mb-2">
                  {task.title}
                </h2>

                <span
                className={`inline-block px-3 py-1 text-xs rounded-full ${
                  task.difficulty === "Easy"
                  ? "bg-green-500/15 text-success"
                  : task.difficulty === "Medium"
                  ? "bg-yellow-500/15 text-warning"
                  : "bg-red-500/15 text-danger"
                }`}
                >
                  {task.difficulty}
                </span>

                <p className="subtle">
                  Skill: {task.skill}
                </p>

                <button
                  onClick={() => {
                    console.log("CLICKED", task)
                    setSelectedTask(task)

                    if (role === "recruiter") {
                      setPage("task-preview")
                    } else {
                      setPage("editor")
                    }
                  }}
                  className="mt-4 w-full btn-primary px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold"
                >
                  {role === "recruiter" ? "View Task" : "Solve"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="col-span-full glass rounded-2xl p-10 text-center subtle">
            No tasks found for selected difficulty.
          </div>
        )}

        {role === "candidate" && 
          <button
            onClick={() => {
              setAiOpen(true)
              setAiLoading(true)

              axios.post(
                "http://127.0.0.1:8000/ai-coach",
                {
                  stats: aiData
                }
              )
              .then(res => {
                setCoachText(res.data.message)

                setTimeout(() => {
                  setAiLoading(false)
                }, 900)
              })
              .catch(() => {
                setCoachText("Unable to generate coach advice right now.")
                toast.error("AI coach unavailable")
                setAiLoading(false)
              })
            }}
            className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full btn-primary text-white text-lg shadow-xl hover:scale-110 transition z-50"
          >
            AI
          </button>
        }

        {role === "candidate" && aiOpen && (
          <div className="fixed top-0 right-0 h-full w-[380px] glass z-50 shadow-2xl p-6 overflow-y-auto">
            {aiLoading ? (
              <div className="space-y-4 animate-pulse mt-8">
                <p className="text-accent">Analyzing your performance...</p>

                <div className="h-5 themed-input rounded"></div>
                <div className="h-5 themed-input rounded"></div>
                <div className="h-20 themed-input rounded"></div>
                <div className="h-10 themed-input rounded"></div>
              </div>
            ) : (
              <>
                <div className="fixed inset-0 bg-black/50 z-50">
                  <div className="absolute right-0 top-0 h-full w-[430px] max-w-full glass p-6 overflow-y-auto shadow-2xl">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-accent">
                        AI Help Panel
                      </h2>

                      <button
                        onClick={() => setAiOpen(false)}
                        className="text-main text-xl"
                      >
                        <FiX className="text-[var(--icon)] opacity-90 text-[20px]" />
                      </button>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-blue-600 font-bold mt-6">
                        AI Coach Summary
                      </h3>

                      {coachLoading ? (
                        <p className="subtle">Generating advice...</p>
                      ) : (
                        <div className="themed-input rounded-xl p-4 max-h-72 overflow-y-auto">
                          <div className="whitespace-pre-line text-sm subtle leading-7">
                            {coachText}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Strengths */}
                    <div className="mb-6">
                      <p className="font-semibold text-success mb-2">
                        Strengths
                      </p>

                      {aiData?.strengths?.map((x, i) => (
                        <p key={i} className="mb-1">• {x}</p>
                      ))}
                    </div>

                    {/* Weaknesses */}
                    <div className="mb-6">
                      <p className="font-semibold text-danger mb-2">
                        Weak Areas
                      </p>

                      {aiData?.weaknesses?.map((x, i) => (
                        <p key={i} className="mb-1">• {x}</p>
                      ))}
                    </div>

                    {/* Trend */}
                    <div className="mb-6">
                      <p className="font-semibold text-blue-600 mb-2">
                        Trend
                      </p>

                      <p>{aiData.trend || "No Data"}</p>
                    </div>

                    {/* Readiness */}
                    <div className="mb-6">
                      <p className="font-semibold text-warning mb-2">
                        Readiness Score
                      </p>

                      <p className="text-3xl font-bold">
                        {aiData.readiness_score ?? 0}%
                      </p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <p className="font-semibold text-accent mb-2">
                        Recommendations
                      </p>

                      {aiData?.recommendations?.map((x, i) => (
                        <p key={i} className="mb-1">• {x}</p>
                      ))}

                      <h3 className="text-accent font-semibold mt-6 mb-3">
                        Recommended Tasks
                      </h3>

                      {aiData?.suggested_tasks?.map((task, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const fullTask = tasks.find(
                              t => t.title === task.title
                            )

                            if (fullTask) {
                              setSelectedTask(fullTask)
                              setAiOpen(false)
                              setPage("editor")
                            }
                          }}
                          className="themed-input rounded-xl p-3 mb-3 cursor-pointer hover:themed-input transition"
                        >
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm subtle">
                            {task.skill} • {task.difficulty}
                          </p>
                          <p className="text-sm text-success mt-1">
                            {task.reason}
                          </p>
                          <button
                            className="mt-3 w-full bg-accent text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Solve Now
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard