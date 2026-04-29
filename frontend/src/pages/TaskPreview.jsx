import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import {
  FiArrowLeft,
  FiClock,
  FiCpu,
  FiLayers,
  FiEye,
  FiTrendingUp,
  FiBarChart2,
  FiAlertTriangle
} from "react-icons/fi"

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
      <div className="glass rounded-2xl p-10 text-center subtle">
        No task selected
      </div>
    )
  }

  return (
    <div className="page-shell text-main fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <button
          onClick={() => setPage("dashboard")}
          className="btn-glass px-4 py-2 rounded-lg flex items-center gap-2 w-fit"
        >
          <FiArrowLeft className="text-[var(--icon)]" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-accent">
          Task Preview
        </h1>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="glass rounded-2xl p-6 shadow-lg">
            <h2 className="text-3xl font-bold card-title">
              {task.title}
            </h2>

            <p className="subtle mt-2 flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-[var(--border)] text-xs">
                {task.difficulty}
              </span>
              <span className="flex items-center gap-1">
                <FiLayers className="text-[var(--icon)] text-sm" />
                {task.skill}
              </span>
            </p>

            {task.description && (
              <p className="subtle mt-6 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            )}

            {/* Constraints */}
            {task.constraints?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-accent font-semibold mb-3">
                  Constraints
                </h3>

                <div className="space-y-2">
                  {task.constraints.map((item, i) => (
                    <div
                      key={i}
                      className="glass rounded-lg px-4 py-3 text-sm subtle"
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
                <h3 className="text-success font-semibold mb-3">
                  Output Format
                </h3>

                <div className="glass rounded-lg px-4 py-3 text-sm subtle">
                  {task.output_format}
                </div>
              </div>
            )}

            {/* Examples */}
            {task.examples?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-accent font-semibold mb-3">
                  Examples
                </h3>

                <div className="space-y-4">
                  {task.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="glass rounded-xl p-5 break-words"
                    >
                      <p className="font-semibold text-main mb-3">
                        Example {i + 1}
                      </p>

                      <p className="subtle">
                        <span className="font-semibold text-main">
                          Input:
                        </span>{" "}
                        {ex.input}
                      </p>

                      <p className="subtle mt-2">
                        <span className="font-semibold text-main">
                          Output:
                        </span>{" "}
                        {ex.output}
                      </p>

                      {ex.explanation && (
                        <p className="subtle mt-2">
                          <span className="font-semibold text-main">
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
            {/* Solve Limit */}
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Solve Limit</p>
                <p className="text-xl font-bold mt-1">
                  {task.solve_time_limit || 15} min
                </p>
              </div>
              <FiClock className="text-[var(--icon)] text-xl" />
            </div>

            {/* Execution */}
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Execution</p>
                <p className="text-xl font-bold mt-1">
                  {task.execution_time_limit || 1}s
                </p>
              </div>
              <FiCpu className="text-[var(--icon)] text-xl" />
            </div>

            {/* Public Tests */}
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Public Tests</p>
                <p className="text-xl font-bold mt-1">
                  {task.public_test_cases?.length || 0}
                </p>
              </div>
              <FiEye className="text-[var(--icon)] text-xl" />
            </div>

            {/* Hidden Tests */}
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="subtle text-sm">Hidden Tests</p>
                <p className="text-xl font-bold mt-1">
                  {task.hidden_test_cases?.length || 0}
                </p>
              </div>
              <FiLayers className="text-[var(--icon)] text-xl" />
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Analytics */}
          <div className="glass rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-accent mb-6">
              Candidate Analytics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Avg Score */}
              <div className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="subtle text-sm">Avg Score</p>
                  <p className="text-2xl font-bold text-success mt-1">
                    {stats?.avg_score || 0}%
                  </p>
                </div>
                <FiTrendingUp className="text-success text-xl" />
              </div>

              {/* Attempts */}
              <div className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="subtle text-sm">Attempts</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.attempts || 0}
                  </p>
                </div>
                <FiBarChart2 className="text-[var(--icon)] text-xl" />
              </div>

              {/* Pass Rate */}
              <div className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="subtle text-sm">Pass Rate</p>
                  <p className="text-2xl font-bold text-accent mt-1">
                    {stats?.pass_rate || 0}%
                  </p>
                </div>
                <FiTrendingUp className="text-accent text-xl" />
              </div>

              {/* Hidden Fails */}
              <div className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="subtle text-sm">Hidden Fails</p>
                  <p className="text-2xl font-bold text-danger mt-1">
                    {stats?.failed_hidden || 0}
                  </p>
                </div>
                <FiAlertTriangle className="text-danger text-xl" />
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="glass rounded-2xl p-6 shadow-lg min-h-[260px]">
            <h3 className="text-xl font-bold text-danger mb-4 flex items-center gap-2">
              <FiAlertTriangle />
              Common Mistakes
            </h3>

            <div className="space-y-3">
              {stats?.common_mistakes?.length > 0 ? (
                stats.common_mistakes.map((item, i) => (
                  <div
                    key={i}
                    className="glass rounded-lg px-4 py-3 text-sm subtle leading-relaxed"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="glass rounded-lg px-4 py-3 text-sm subtle">
                  No mistake insights available yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {!stats && 
          <p className="subtle animate-pulse flex items-center gap-2">
            <FiBarChart2 className="text-[var(--icon)]" />
            Loading analytics...
          </p>
        }
      </div>
    </div>
  )
}

export default TaskPreview