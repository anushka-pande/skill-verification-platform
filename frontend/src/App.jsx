import { useState, useEffect } from "react"
import axios from "axios"
import Editor from "@monaco-editor/react"

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [page, setPage] = useState("auth")
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [code, setCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [sortType, setSortType] = useState("latest")
  const [profileData, setProfileData] = useState(null)
  const [language, setLanguage] = useState("python")

  const handleSubmit = async () => {
    try {
      if (isLogin) {

        await axios.post("http://127.0.0.1:8000/login", {
          email,
          password
        })

        localStorage.setItem("user", email)

        // Clear fields
        setEmail("")
        setPassword("")

        // Smooth redirect
        setPage("dashboard")
        setProfileOpen(false)

      } else {

        await axios.post("http://127.0.0.1:8000/register", {
          name,
          email,
          password
        })

        // Auto switch to login after register
        setIsLogin(true)

        // Clear fields
        setName("")
        setEmail("")
        setPassword("")
      }

    } catch (error) {
      // Keep error message but cleaner
      const message =
        error.response?.data?.detail || "Invalid credentials"

      alert(message)
    }
  }

  useEffect(() => {
    if (page === "dashboard") {
      axios.get("http://127.0.0.1:8000/tasks")
        .then(res => setTasks(res.data))
        .catch(err => console.error(err))
    }
  }, [page])

  useEffect(() => {
    if (page === "submissions") {
      axios
        .get("http://127.0.0.1:8000/submissions/1")
        .then(res => setSubmissions(res.data))
        .catch(err => console.error(err))
    }
  }, [page])

  useEffect(() => {
    if (page === "profile") {
      console.log("PROFILE PAGE TRIGGERED")  

      axios
        .get("http://127.0.0.1:8000/profile/1")
        .then(res => {
          console.log("PROFILE DATA:", res.data)  
          setProfileData(res.data)
        })
        .catch(err => {
          console.error("PROFILE ERROR:", err)    
        })
    }
  }, [page])

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortType === "latest") return new Date(b.date || 0) - new Date(a.date || 0)
    if (sortType === "score") return b.score - a.score
    return 0
  })

  return (
    <>
      {page === "auth" && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="bg-slate-800/70 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-[400px]">
            
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Skill Verification Platform
            </h1>

            <p className="text-slate-400 text-center mt-2 mb-6">
              {isLogin ? "Login to continue" : "Create your account"}
            </p>

            <div className="space-y-4">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={handleSubmit}
                className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition text-white font-semibold"
              >
                {isLogin ? "Login" : "Register"}
              </button>
            </div>

            <div className="text-center mt-6 text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-purple-400 hover:underline"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </div>

          </div>
        </div>
      )}

      {page === "dashboard" && (
        <div className="min-h-screen bg-slate-900 p-10">
          <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <h1 className="text-2xl font-bold text-purple-400">
              Provenix
            </h1>

            <button
              onClick={() => setPage("submissions")}
              className="text-slate-300 hover:text-white transition"
            >
              Submissions
            </button>

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
                      localStorage.removeItem("user")
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="bg-slate-800 p-6 rounded-xl shadow-lg hover:scale-105 transition"
              >
                <h2 className="text-xl font-semibold">{task.title}</h2>

                <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                  {task.difficulty}
                </span>

                <p className="text-slate-400">
                  Skill: {task.skill}
                </p>

                <button
                  onClick={() => {
                    setSelectedTask(task)
                    setPage("editor")
                  }}
                  className="mt-4 bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600"
                >
                  Solve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "editor" && selectedTask && (
        <div className="min-h-screen bg-slate-900 text-white flex">

          {/* LEFT PANEL — Problem */}
          <div className="w-1/2 p-8 border-r border-slate-800 overflow-y-auto">

            {/* Navbar */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-purple-400">
                Provenix
              </h1>

              <span className="text-slate-400">
                {localStorage.getItem("user")}
              </span>
            </div>

            <button
              onClick={() => {
                setResult(null)
                setPage("dashboard")
              }}
              className="mb-6 bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-purple-400">
              {selectedTask.title}
            </h1>

            <p className="mt-4 text-slate-400">
              Difficulty: {selectedTask.difficulty}
            </p>

            <div className="mt-6 bg-slate-800 p-6 rounded-xl">
              <p className="mt-6 text-slate-400">
                Read input from standard input and print the result.
              </p>
            </div>

          </div>


          {/* RIGHT PANEL — Editor */}
          <div className="w-1/2 p-6 flex flex-col">

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-4 bg-slate-700 p-2 rounded text-white"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>

            <Editor
              height="60%"
              theme="vs-dark"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value)}
            />

            <button
              onClick={async () => {
                try {
                  setLoading(true)

                  const submitRes = await axios.post(
                    "http://127.0.0.1:8000/submit-code",
                    {
                      user_id: 1,
                      task_id: selectedTask.title,
                      code: code,
                      language: language
                    }
                  )

                  const submissionId = submitRes.data.submission_id

                  const execRes = await axios.post(
                    `http://127.0.0.1:8000/execute/${submissionId}`
                  )

                  setResult(execRes.data)

                } catch(err) {
                  console.error(err)
                  alert(err.response?.data?.detail || "Submission failed")
                } finally {
                  setLoading(false)
                }
              }}
              className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition"
            >
              {loading ? "Evaluating..." : "Run Code"}
            </button>

            {result && (
              <div className="mt-6 bg-slate-800 p-6 rounded-xl">

                <h2 className="text-green-400 text-3xl font-bold mb-4">
                  Score: {result.final_score}
                </h2>

                <div className="grid grid-cols-2 gap-4 text-slate-300 text-sm">
                  <p>Execution:</p>
                  <p>{result.execution_score}</p>

                  <p>Quality:</p>
                  <p>{result.quality_score}</p>

                  <p>Time:</p>
                  <p>{result.time_score}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">
                    Test Case Results
                  </h3>

                  {result.details.map((d, index) => (
                    <div
                      key={index}
                      className="bg-slate-700 p-4 rounded-lg text-sm"
                    >
                      <p><strong>Input:</strong> {d.input}</p>
                      <p><strong>Expected:</strong> {d.expected}</p>

                      {d.error ? (
                        <p className="text-red-400">
                          <strong>Error:</strong> {d.error}
                        </p>
                      ) : (
                        <>
                          <p><strong>Actual:</strong> {d.actual}</p>
                          <p
                            className={
                              d.status === "passed"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {d.status.toUpperCase()}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {page === "profile" && (
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
              My Profile
            </h1>
          </div>

          {/* Content */}
          {profileData ? (
            <div className="bg-slate-800 p-6 rounded-xl w-[400px] space-y-4">

              <p>Email: {localStorage.getItem("user")}</p>

              <p>Total Submissions: {profileData.total_submissions}</p>
              <p>Average Score: {profileData.average_score}</p>
              <p>Best Score: {profileData.best_score}</p>
              <p>Success Rate: {profileData.success_rate}%</p>

            </div>
          ) : (
            <p className="text-slate-400">Loading...</p>
          )}

        </div>
      )}

      {page === "settings" && (
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
              Settings
            </h1>
          </div>

          {/* Content */}
          <div className="bg-slate-800 p-6 rounded-xl w-[400px]">
            <p className="text-slate-400">
              Settings coming soon...
            </p>
          </div>

        </div>
      )}

      {page === "submissions" && (
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
      )}
    </>
  )
}

export default App