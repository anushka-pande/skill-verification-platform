function Dashboard(props) {
  const {
    tasks,
    setPage,
    setSelectedTask,
    difficulty,
    setDifficulty,
    isAdmin,
    profileOpen,
    setProfileOpen
  } = props

  return (
    <>
      <div className="min-h-screen bg-slate-900 p-10">
          <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-4">
            <h1 className="text-2xl font-bold text-purple-400">
              Provenix
            </h1>

            <div className="flex items-center gap-4">
              {/* Difficulty Filter */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="p-2 rounded bg-slate-800 text-white border border-slate-700"
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Add Task Button */}
              {isAdmin && (
                <button
                  onClick={() => setPage("add-task")}
                  className="text-slate-300 hover:text-white transition"
                >
                  Add Task
                </button>
              )}

              {localStorage.getItem("role") === "recruiter" && (
              <button onClick={() => setPage("recruiter")}>
                Recruiter View
              </button>
              )}

              {/* Submissions Button */}
              <button
                onClick={() => setPage("submissions")}
                className="text-slate-300 hover:text-white transition"
              >
                Submissions
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2"
                >
                  Profile ▼
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                    <button
                      onClick={() => {
                      setPage("profile")
                      setProfileOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-slate-700"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                      setPage("settings")
                      setProfileOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-slate-700"
                    >
                      Settings
                    </button>

                    <button
                      onClick={() => {
                      localStorage.removeItem("user_id")
                      localStorage.removeItem("user_email")
                      setPage("auth")
                      setProfileOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
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
                        setPage("editor")
                    }}
                    className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold"
                  >
                    Solve
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
      </div>
    </>
  )
}

export default Dashboard