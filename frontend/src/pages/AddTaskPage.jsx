import axios from "axios"
 
function AddTaskPage(props) {
  const {
    setPage,
    title,
    setTitle,
    skill,
    setSkill,
    timeLimit,
    setTimeLimit,
    difficulty,
    setDifficulty,
    testCases,
    setTestCases,
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

        {/* Time Limit */}
        <input
          type="number"
          value={timeLimit}
          placeholder="Time Limit (seconds)"
          className="w-full p-3 mb-3 bg-slate-700 rounded"
          onChange={(e) => setTimeLimit(Number(e.target.value))}
        />

        {testCases.map((tc, index) => (
          <div key={index} className="mb-4">
            <input
              placeholder={`Test Case ${index + 1} Input`}
              className="w-full p-3 mb-2 bg-slate-700 rounded"
              value={tc.input}
              onChange={(e) => {
                const updated = [...testCases]
                updated[index].input = e.target.value
                setTestCases(updated)
              }}
            />

            <input
              placeholder={`Expected Output`}
              className="w-full p-3 bg-slate-700 rounded"
              value={tc.output}
              onChange={(e) => {
                const updated = [...testCases]
                updated[index].output = e.target.value
                setTestCases(updated)
              }}
            />
          </div>
        ))}

        <div className="mt-6 border-t border-slate-700 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <button
              onClick={() =>
                setTestCases([...testCases, { input: "", output: "" }])
              }
              className="flex items-center gap-2 px-4 py-2 mb-4 
                        bg-slate-700 hover:bg-slate-600 
                        text-purple-400 rounded-lg 
                        transition duration-200"
            >
              + Add Test Case
            </button>

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
                    time_limit: timeLimit,
                    test_cases: testCases
                  })

                  setTaskSuccess(true)

                  setTimeout(() => setTaskSuccess(false), 3000)

                  setTitle("")
                  setSkill("")
                  setTimeLimit(1)
                  setDifficulty("")
                  setTestCases([
                    { input: "", output: "" },
                    { input: "", output: "" }
                  ])

                } catch (err) {
                    console.error("FULL ERROR:", err)
                    alert(err.response?.data?.detail || "Error creating task")
                  }
              }}
              className="w-full md:w-auto 
                        bg-gradient-to-r from-purple-500 to-blue-500 
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