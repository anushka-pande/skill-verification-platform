import { useState } from "react"
import axios from "axios"

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
      <div className="min-h-screen bg-slate-900 p-10">
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800 px-6 py-4">
          <div className="flex flex-col xl:flex-row lg:items-center lg:justify-between gap-4">

            {/* LEFT */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Provenix
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                {role === "recruiter"
                  ? "Assessment Catalog"
                  : "Coding Dashboard"}
              </p>
            </div>

            {/* CENTER SEARCH */}
            <div className="flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-xl text-white min-w-[100px]"
              >
                <option>All</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              {role === "candidate" && (
                <button
                  onClick={() => setPage("submissions")}
                  className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800"
                >
                  Submissions
                </button>
              )}

              {role === "recruiter" && (
                <>
                  <button
                    onClick={() => setPage("add-task")}
                    className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500"
                  >
                    Add Task
                  </button>

                  <button
                    onClick={() => setPage("recruiter")}
                    className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800"
                  >
                    Reports
                  </button>
                </>
              )}

              <button
                onClick={() => setPage("settings")}
                className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800"
              >
                Settings
              </button>

              {/* PROFILE */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700"
                >
                  Profile ▼
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">

                    <button
                      onClick={() => {
                        setPage("profile")
                        setProfileOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        sessionStorage.clear()
                        setPage("auth")
                      }}
                      className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <div
            key={index}
            className="bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.03] transition duration-300"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white mb-2">
                  {task.title}
                </h2>

                <span
                className={`inline-block px-3 py-1 text-xs rounded-full ${
                  task.difficulty === "Easy"
                  ? "bg-green-500/20 text-green-400"
                  : task.difficulty === "Medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
                }`}
                >
                  {task.difficulty}
                </span>

                <p className="text-slate-400">
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
                  className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold"
                >
                  {role === "recruiter" ? "View Task" : "Solve"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <p className="text-slate-400 text-center col-span-full">
            No tasks found for selected difficulty.
          </p>
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

                setAiLoading(false)
              })
            }}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl shadow-xl hover:scale-110 transition z-50"
          >
            AI
          </button>
        }

        {role === "candidate" && aiOpen && (
          <div className="fixed top-0 right-0 h-full w-[380px] bg-slate-800 z-50 shadow-2xl p-6 overflow-y-auto">
            {aiLoading ? (
              <div className="space-y-4 animate-pulse mt-8">
                <p className="text-purple-300">Analyzing your performance...</p>

                <div className="h-5 bg-slate-700 rounded"></div>
                <div className="h-5 bg-slate-700 rounded"></div>
                <div className="h-20 bg-slate-700 rounded"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
              </div>
            ) : (
              <>
                <div className="fixed inset-0 bg-black/50 z-50">
                  <div className="absolute right-0 top-0 h-full w-[430px] max-w-full bg-slate-800 p-6 overflow-y-auto shadow-2xl">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-purple-400">
                        AI Help Panel
                      </h2>

                      <button
                        onClick={() => setAiOpen(false)}
                        className="text-white text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-blue-200 font-bold mt-6">
                        AI Coach Summary
                      </h3>

                      {coachLoading ? (
                        <p className="text-slate-400">Generating advice...</p>
                      ) : (
                        <div className="bg-slate-700 rounded-xl p-4 max-h-72 overflow-y-auto">
                          <div className="whitespace-pre-line text-sm text-slate-200 leading-7">
                            {coachText}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Strengths */}
                    <div className="mb-6">
                      <p className="font-semibold text-green-400 mb-2">
                        Strengths
                      </p>

                      {aiData?.strengths?.map((x, i) => (
                        <p key={i} className="mb-1">• {x}</p>
                      ))}
                    </div>

                    {/* Weaknesses */}
                    <div className="mb-6">
                      <p className="font-semibold text-red-400 mb-2">
                        Weak Areas
                      </p>

                      {aiData?.weaknesses?.map((x, i) => (
                        <p key={i} className="mb-1">• {x}</p>
                      ))}
                    </div>

                    {/* Trend */}
                    <div className="mb-6">
                      <p className="font-semibold text-blue-400 mb-2">
                        Trend
                      </p>

                      <p>{aiData.trend || "No Data"}</p>
                    </div>

                    {/* Readiness */}
                    <div className="mb-6">
                      <p className="font-semibold text-yellow-400 mb-2">
                        Readiness Score
                      </p>

                      <p className="text-3xl font-bold">
                        {aiData.readiness_score ?? 0}%
                      </p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <p className="font-semibold text-purple-300 mb-2">
                        Recommendations
                      </p>

                      {aiData?.recommendations?.map((x, i) => (
                        <p key={i} className="mb-1">• {x}</p>
                      ))}

                      <h3 className="text-purple-300 font-semibold mt-6 mb-3">
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
                          className="bg-slate-700 rounded-xl p-3 mb-3 cursor-pointer hover:bg-slate-600 transition"
                        >
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm text-slate-400">
                            {task.skill} • {task.difficulty}
                          </p>
                          <p className="text-sm text-green-400 mt-1">
                            {task.reason}
                          </p>
                          <button
                            className="mt-3 w-full bg-purple-500 px-3 py-2 rounded-lg text-sm hover:bg-purple-600"
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