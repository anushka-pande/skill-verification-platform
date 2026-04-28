import { useEffect, useState } from "react"
import axios from "axios"

function TaskPreview(props) {
  const [stats, setStats] = useState(null)
  const { 
    task, 
    setPage 
  } = props

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/task-analytics/${task.title}`)
      .then(res => setStats(res.data))
  }, [])

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-10">
        No task selected
      </div>
    )
  }

  const getMistakes = () => {
    const skill = task.skill?.toLowerCase() || ""
    const title = task.title?.toLowerCase() || ""

    if (skill.includes("string")) {
      return [
        "Wrong reverse logic",
        "Case sensitivity missed",
        "Spaces / symbols mishandled"
      ]
    }

    if (skill.includes("array")) {
      return [
        "Loop boundary errors",
        "Index out of range",
        "Incorrect accumulation"
      ]
    }

    if (skill.includes("math")) {
      return [
        "Input conversion mistakes",
        "Wrong formula usage",
        "Overflow edge cases"
      ]
    }

    if (title.includes("palindrome")) {
      return [
        "Improper comparison logic",
        "Ignored uppercase/lowercase",
        "Extra spaces not handled"
      ]
    }

    return [
      "Input parsing mistakes",
      "Edge cases missed",
      "Inefficient logic"
    ]
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setPage("dashboard")}
          className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-purple-400">
          Task Preview
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Left */}
        <div className="bg-slate-800 rounded-2xl p-6">

          <h2 className="text-3xl font-bold text-white mb-2">
            {task.title}
          </h2>

          <p className="text-slate-400 mb-6">
            {task.difficulty} • {task.skill}
          </p>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Solve Limit</p>
              <p className="text-xl font-bold">
                {task.solve_time_limit || 15} min
              </p>
            </div>

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Execution</p>
              <p className="text-xl font-bold">
                {task.execution_time_limit || 1}s
              </p>
            </div>

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Public Tests</p>
              <p className="text-xl font-bold">
                {task.public_test_cases?.length || 0}
              </p>
            </div>

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Hidden Tests</p>
              <p className="text-xl font-bold">
                {task.hidden_test_cases?.length || 0}
              </p>
            </div>

          </div>
        </div>

        {/* Right */}
        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-2xl font-bold text-blue-300 mb-6">
            Candidate Analytics
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400">Avg Score</p>
              <p className="text-2xl font-bold text-green-400">
                {stats?.avg_score || 0}%
              </p>
            </div>

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400">Attempts</p>
              <p className="text-2xl font-bold">
                {stats?.attempts || 0}
              </p>
            </div>

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400">Pass Rate</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats?.pass_rate || 0}%
              </p>
            </div>

            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400">Hidden Fails</p>
              <p className="text-2xl font-bold text-red-400">
                {stats?.failed_hidden || 0}
              </p>
            </div>

          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <h4 className="font-semibold text-red-300 mb-3">
            Common Mistakes
          </h4>

          <div className="space-y-2">
            {getMistakes().map((x, i) => (
              <div
                key={i}
                className="bg-slate-700 rounded-lg px-4 py-3 text-sm"
              >
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskPreview