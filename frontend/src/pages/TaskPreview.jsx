import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"

function TaskPreview(props) {
  const [stats, setStats] = useState(null)

  const {
    task,
    setPage
  } = props

  useEffect(() => {
    if (!task) return

    axios
      .get(`http://127.0.0.1:8000/task-analytics/${task.title}`)
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load task analytics")
      })
  }, [task])

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-10">
        No task selected
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <button
          onClick={() => setPage("dashboard")}
          className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 w-fit"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-purple-400">
          Task Preview
        </h1>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-3xl font-bold text-white">
              {task.title}
            </h2>

            <p className="text-slate-400 mt-2">
              {task.difficulty} • {task.skill}
            </p>

            {task.description && (
              <p className="text-slate-300 mt-6 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            )}

            {/* Constraints */}
            {task.constraints?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-purple-400 font-semibold mb-3">
                  Constraints
                </h3>

                <div className="space-y-2">
                  {task.constraints.map((item, i) => (
                    <div
                      key={i}
                      className="bg-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Format */}
            {task.output_format && (
              <div className="mt-8">
                <h3 className="text-green-400 font-semibold mb-3">
                  Output Format
                </h3>

                <div className="bg-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300">
                  {task.output_format}
                </div>
              </div>
            )}

            {/* Examples */}
            {task.examples?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-cyan-400 font-semibold mb-3">
                  Examples
                </h3>

                <div className="space-y-4">
                  {task.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="bg-slate-700 rounded-xl p-5 break-words"
                    >
                      <p className="font-semibold text-white mb-3">
                        Example {i + 1}
                      </p>

                      <p className="text-slate-300">
                        <span className="font-semibold text-white">
                          Input:
                        </span>{" "}
                        {ex.input}
                      </p>

                      <p className="text-slate-300 mt-2">
                        <span className="font-semibold text-white">
                          Output:
                        </span>{" "}
                        {ex.output}
                      </p>

                      {ex.explanation && (
                        <p className="text-slate-400 mt-2">
                          <span className="font-semibold text-white">
                            Explanation:
                          </span>{" "}
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Solve Limit</p>
              <p className="text-xl font-bold mt-1">
                {task.solve_time_limit || 15} min
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Execution</p>
              <p className="text-xl font-bold mt-1">
                {task.execution_time_limit || 1}s
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Public Tests</p>
              <p className="text-xl font-bold mt-1">
                {task.public_test_cases?.length || 0}
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Hidden Tests</p>
              <p className="text-xl font-bold mt-1">
                {task.hidden_test_cases?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Analytics */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-blue-300 mb-6">
              Candidate Analytics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-xl p-4">
                <p className="text-sm text-slate-400">Avg Score</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {stats?.avg_score || 0}%
                </p>
              </div>

              <div className="bg-slate-700 rounded-xl p-4">
                <p className="text-sm text-slate-400">Attempts</p>
                <p className="text-2xl font-bold mt-1">
                  {stats?.attempts || 0}
                </p>
              </div>

              <div className="bg-slate-700 rounded-xl p-4">
                <p className="text-sm text-slate-400">Pass Rate</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">
                  {stats?.pass_rate || 0}%
                </p>
              </div>

              <div className="bg-slate-700 rounded-xl p-4">
                <p className="text-sm text-slate-400">Hidden Fails</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {stats?.failed_hidden || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg min-h-[260px]">
            <h3 className="text-xl font-bold text-red-300 mb-4">
              Common Mistakes
            </h3>

            <div className="space-y-3">
              {stats?.common_mistakes?.length > 0 ? (
                stats.common_mistakes.map((item, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 leading-relaxed"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="bg-slate-700 rounded-lg px-4 py-3 text-sm text-slate-400">
                  No mistake insights available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskPreview