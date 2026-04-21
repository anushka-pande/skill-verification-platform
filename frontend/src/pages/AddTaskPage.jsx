import axios from "axios"
 
function AddTaskPage(props) {
  const {
    setPage,
    title,
    setTitle,
    skill,
    setSkill,
    executionTime,
    setExecutionTime,
    solveTime,
    setSolveTime,
    difficulty,
    setDifficulty,
    publicCases,
    setPublicCases,
    hiddenCases,
    setHiddenCases,
    taskSuccess,
    setTaskSuccess
  } = props

  return (
    <>
      <div className="min-h-screen bg-slate-900 p-10 text-white">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setPage("dashboard")}
            className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-2xl text-purple-400 mb-6">Create Task</h1>

        {/* Title */}
        <input
          placeholder="Title"
          value={title}
          className="w-full p-3 mb-3 bg-slate-700 rounded"
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Difficulty */}
        <select
          value={difficulty}
          className="w-full p-3 mb-3 bg-slate-700 rounded"
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Skill */}
        <input
          placeholder="Skill (e.g. Array, DP)"
          value={skill}
          className="w-full p-3 mb-3 bg-slate-700 rounded"
          onChange={(e) => setSkill(e.target.value)}
        />

        {/* Execution time Limit */}
        <div className="mb-3">
          <label className="block text-sm text-slate-300 mb-2">
            Execution Time Limit (seconds)
          </label>

          <select
            value={executionTime}
            className="w-full p-3 bg-slate-700 rounded"
            onChange={(e) => setExecutionTime(Number(e.target.value))}
          >
            <option value={1}>1 second</option>
            <option value={2}>2 seconds</option>
            <option value={3}>3 seconds</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
          </select>

          <div className="mb-3">
            <label className="block text-sm text-slate-300 mb-2">
              Recommended Solve Time (minutes)
            </label>

            <select
              value={solveTime}
              className="w-full p-3 bg-slate-700 rounded"
              onChange={(e) => setSolveTime(Number(e.target.value))}
            >
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
        </div>

        <h2 className="text-lg text-green-400 mb-3">Public Test Cases</h2>

        {publicCases.map((tc, index) => (
          <div key={index} className="mb-4">
            <textarea
              rows="3"
              placeholder={`Public Input ${index + 1}`}
              className="w-full p-3 mb-2 bg-slate-700 rounded"
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
              className="w-full p-3 bg-slate-700 rounded"
              value={tc.output}
              onChange={(e) => {
                const updated = [...publicCases]
                updated[index].output = e.target.value
                setPublicCases(updated)
              }}
            />
          </div>
        ))}

        <h2 className="text-lg text-red-400 mt-6 mb-3">Hidden Test Cases</h2>

        {hiddenCases.map((tc, index) => (
          <div key={index} className="mb-4">
            <textarea
              rows="3"
              placeholder={`Hidden Input ${index + 1}`}
              className="w-full p-3 mb-2 bg-slate-700 rounded"
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
              className="w-full p-3 bg-slate-700 rounded"
              value={tc.output}
              onChange={(e) => {
                const updated = [...hiddenCases]
                updated[index].output = e.target.value
                setHiddenCases(updated)
              }}
            />
          </div>
        ))}

        <div className="mt-6 border-t border-slate-700 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <div>
              <button
                onClick={() =>
                  setPublicCases([...publicCases, { input: "", output: "" }])
                }
                className="flex items-center gap-2 px-4 py-2 mb-4 
                          bg-slate-700 hover:bg-slate-600 
                          text-purple-400 rounded-lg 
                          transition duration-200"
              >
                + Add Test Case
              </button>

              <button
                onClick={() =>
                  setHiddenCases([
                    ...hiddenCases,
                    { input: "", output: "" }
                  ])
                }
                className="flex items-center gap-2 px-4 py-2 mb-4
                          bg-slate-700 hover:bg-slate-600
                          text-red-400 rounded-lg
                          transition duration-200"
              >
                + Add Hidden Test Case
              </button>
            </div>

            {taskSuccess && (
              <p className="text-green-400 mb-4">
                Task created successfully ✅
              </p>
            )}

            <button
              onClick={async () => {
                try {
                  if (!difficulty) {
                    alert("Please select difficulty")
                    return
                  }

                  await axios.post("http://127.0.0.1:8000/tasks", {
                    title,
                    difficulty,
                    skill,
                    execution_time_limit: executionTime,
                    solve_time_limit: solveTime,
                    public_test_cases: publicCases,
                    hidden_test_cases: hiddenCases
                  })

                  setTaskSuccess(true)

                  setTimeout(() => setTaskSuccess(false), 3000)

                  setTitle("")
                  setSkill("")
                  setExecutionTime(1)
                  setSolveTime(20)
                  setDifficulty("")
                  setPublicCases([
                    { input: "", output: "" }
                  ])
                  setHiddenCases([
                    { input: "", output: "" }
                  ])

                } catch (err) {
                    console.error("FULL ERROR:", err)
                    alert(err.response?.data?.detail || "Error creating task")
                  }
              }}
              className="w-full md:w-auto 
                        bg-gradient-to-r from-indigo-500 to-cyan-400
                        px-6 py-3 rounded-lg 
                        font-semibold 
                        hover:opacity-90 
                        transition duration-200 
                        shadow-lg"
            >
              Add Task
            </button>
          </div>
        </div>

      </div>
    </>
  )
}

export default AddTaskPage