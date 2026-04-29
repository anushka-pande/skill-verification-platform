import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiArrowLeft,
  FiType,
  FiTag,
  FiLayers,
  FiClock,
  FiFileText,
  FiPlusCircle,
  FiCheckCircle,
  FiPlus
} from "react-icons/fi"
 
function AddTaskPage(props) {
  const {
    setPage,
    title,
    setTitle,
    description,
    setDescription,
    skill,
    setSkill,
    executionTimeLimit,
    setExecutionTimeLimit,
    solveTimeLimit,
    setSolveTimeLimit,
    difficulty,
    setDifficulty,
    constraints,
    setConstraints,
    outputFormat,
    setOutputFormat,
    edgeCases,
    setEdgeCases,
    examples,
    setExamples,
    publicCases,
    setPublicCases,
    hiddenCases,
    setHiddenCases,
    taskSuccess,
    setTaskSuccess
  } = props

  return (
    <>
      <div className="page-shell text-main fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setPage("dashboard")}
            className="btn-glass flex items-center gap-2 px-4 py-2 rounded-xl mb-6"
          >
            <FiArrowLeft />
            Back
          </button>
        </div>

        <h1 className="section-title text-accent mb-6">
          Add New Task
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Side */}
          <div className="space-y-4">
            {/* Title */}
            <div className="relative mb-4">
              <FiType className="absolute left-4 top-1/2 -translate-y-1/2 subtle text-lg" />

              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="themed-input w-full pl-12 p-3"
              />
            </div>

            {/* Description */}
            <div className="relative mb-4">
              <FiFileText className="absolute left-4 top-4 subtle text-lg" />

              <textarea
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="6"
                className="themed-input w-full pl-12 p-3"
              />
            </div>

            {/* Difficulty */}
            <div className="relative mb-4">
              <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 subtle text-lg z-10" />

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="themed-input w-full pl-12 p-3"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            {/* Skill */}
            <div className="relative mb-4">
              <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 subtle text-lg" />

              <input
                type="text"
                placeholder="Skill (Array, String, etc)"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="themed-input w-full pl-12 p-3"
              />
            </div>

            {/* Constraints */}
            <textarea
              rows="3"
              placeholder="Constraints (one per line)"
              value={constraints}
              className="w-full p-3 mb-3 themed-input rounded-xl"
              onChange={(e) => setConstraints(e.target.value)}
            />

            {/* Output format */}
            <textarea
              rows="2"
              placeholder="Output Format"
              value={outputFormat}
              className="w-full p-3 mb-3 themed-input rounded-xl"
              onChange={(e) => setOutputFormat(e.target.value)}
            />

            {/* Edge cases */}
            <textarea
              rows="3"
              placeholder="Edge Cases (one per line)"
              value={edgeCases}
              className="w-full p-3 mb-3 themed-input rounded-xl"
              onChange={(e) => setEdgeCases(e.target.value)}
            />

            {/* Execution time Limit */}
            <div className="mb-3 mt-6">
              <label className="block text-sm subtle mb-2">
                Execution Time Limit (seconds)
              </label>

              <select
                value={executionTimeLimit}
                className="w-full p-3 themed-input rounded-xl"
                onChange={(e) => setExecutionTimeLimit(Number(e.target.value))}
              >
                <option value={1}>1 second</option>
                <option value={2}>2 seconds</option>
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
              </select>

              <div className="mb-3">
                <label className="block text-sm subtle mb-2 mt-4">
                  Recommended Solve Time (minutes)
                </label>

                <div className="relative mb-4">
                  <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 subtle text-lg" />

                  <input
                    type="number"
                    placeholder="Recommended Time (minutes)"
                    value={solveTimeLimit}
                    onChange={(e) => setSolveTimeLimit(Number(e.target.value))}
                    className="themed-input w-full pl-12 p-3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Examples */}
            <h2 className="text-lg text-accent font-semibold mb-3">Examples</h2>
            {examples.map((ex, index) => (
              <div key={index} className="glass p-4 rounded-xl mb-4 space-y-3">

                <input
                  placeholder="Example Input"
                  value={ex.input}
                  className="w-full p-3 themed-input rounded-xl"
                  onChange={(e) => {
                    const updated = [...examples]
                    updated[index].input = e.target.value
                    setExamples(updated)
                  }}
                />

                <input
                  placeholder="Expected Output"
                  value={ex.output}
                  className="w-full p-3 themed-input rounded-xl"
                  onChange={(e) => {
                    const updated = [...examples]
                    updated[index].output = e.target.value
                    setExamples(updated)
                  }}
                />

                <textarea
                  rows="2"
                  placeholder="Explanation (optional)"
                  value={ex.explanation}
                  className="w-full p-3 themed-input rounded-xl"
                  onChange={(e) => {
                    const updated = [...examples]
                    updated[index].explanation = e.target.value
                    setExamples(updated)
                  }}
                />
              </div>
            ))}

            <button
              onClick={() =>
                setExamples([
                  ...examples,
                  { input: "", output: "", explanation: "" }
                ])
              }
              className="btn-glass text-accent px-4 py-2 rounded-lg"
            >
              + Add Example
            </button>

            <h2 className="text-lg text-success mb-3 mt-3">Public Test Cases</h2>
            {publicCases.map((tc, index) => (
              <div key={index} className="mb-4">
                <textarea
                  rows="3"
                  placeholder={`Public Input ${index + 1}`}
                  className="w-full p-3 mb-2 themed-input rounded-xl"
                  value={tc.input}
                  onChange={(e) => {
                    const updated = [...publicCases]
                    updated[index].input = e.target.value
                    setPublicCases(updated)
                  }}
                />

                <textarea
                  rows="2"
                  placeholder="Expected Output"
                  className="w-full p-3 themed-input rounded-xl"
                  value={tc.output}
                  onChange={(e) => {
                    const updated = [...publicCases]
                    updated[index].output = e.target.value
                    setPublicCases(updated)
                  }}
                />
              </div>
            ))}

            <h2 className="text-lg text-danger mt-3 mb-3">Hidden Test Cases</h2>
            {hiddenCases.map((tc, index) => (
              <div key={index} className="mb-4">
                <textarea
                  rows="3"
                  placeholder={`Hidden Input ${index + 1}`}
                  className="w-full p-3 mb-2 themed-input rounded-xl"
                  value={tc.input}
                  onChange={(e) => {
                    const updated = [...hiddenCases]
                    updated[index].input = e.target.value
                    setHiddenCases(updated)
                  }}
                />

                <textarea
                  rows="2"
                  placeholder="Expected Output"
                  className="w-full p-3 themed-input rounded-xl"
                  value={tc.output}
                  onChange={(e) => {
                    const updated = [...hiddenCases]
                    updated[index].output = e.target.value
                    setHiddenCases(updated)
                  }}
                />
              </div>
            ))}
            
          </div>
        </div>

        <div className="submit-area mt-8 border-t border-[var(--border)] pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            {/* LEFT: ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  setPublicCases([...publicCases, { input: "", output: "" }])
                }
                className="btn-glass px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiPlus className="text-[var(--icon)]" />
                Add Test Case
              </button>

              <button
                onClick={() =>
                  setHiddenCases([
                    ...hiddenCases,
                    { input: "", output: "" }
                  ])
                }
                className="btn-glass px-4 py-2 rounded-lg flex items-center gap-2 text-danger border border-red-300/40"
              >
                <FiPlus className="text-danger" />
                Hidden Test
              </button>

            </div>

            {/* CENTER: SUCCESS MESSAGE */}
            {taskSuccess && (
              <p className="text-success flex items-center gap-2 text-sm">
                <FiCheckCircle />
                Task created successfully
              </p>
            )}

            {/* RIGHT: PRIMARY BUTTON */}
            <button
              onClick={async () => {
                try {
                  if (!difficulty) {
                    toast.error("Please select difficulty")
                    return
                  }

                  await axios.post("http://127.0.0.1:8000/tasks", {
                    title,
                    description,
                    difficulty,
                    skill,
                    execution_time_limit: executionTimeLimit,
                    solve_time_limit: solveTimeLimit,
                    public_test_cases: publicCases,
                    hidden_test_cases: hiddenCases,
                    constraints: constraints.split("\n").filter(Boolean),
                    output_format: outputFormat,
                    edge_cases: edgeCases.split("\n").filter(Boolean),
                    examples
                  })

                  setTaskSuccess(true)
                  toast.success("Task created successfully")

                  setTimeout(() => setTaskSuccess(false), 3000)

                  setTitle("")
                  setDescription("")
                  setSkill("")
                  setExecutionTimeLimit(1)
                  setSolveTimeLimit(20)
                  setDifficulty("")
                  setPublicCases([{ input: "", output: "" }])
                  setHiddenCases([{ input: "", output: "" }])
                  setConstraints("")
                  setOutputFormat("")
                  setEdgeCases("")
                  setExamples([{ input: "", output: "", explanation: "" }])

                } catch (err) {
                  console.error("FULL ERROR:", err)
                  toast.error(err.response?.data?.detail || "Error creating task")
                }
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <FiCheckCircle />
              Add Task
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddTaskPage