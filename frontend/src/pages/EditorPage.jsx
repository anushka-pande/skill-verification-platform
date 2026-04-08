import Editor from "@monaco-editor/react"
import { useEffect } from "react"
import axios from "axios"

function EditorPage(props) {
  const {
    selectedTask,
    setPage,
    code,
    setCode,
    language,
    setLanguage,
    result,
    setResult,
    loading,
    setLoading
  } = props

  useEffect(() => {
    setCode("")
    setResult(null)
  }, [selectedTask])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* LEFT PANEL — Problem */}
      <div className="w-1/2 p-8 border-r border-slate-800 overflow-y-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-purple-400">
            Provenix
          </h1>

          <span className="text-slate-400">
            {localStorage.getItem("user_email")}
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

              const userId = localStorage.getItem("user_id")
              
              const submitRes = await axios.post(
                "http://127.0.0.1:8000/submit-code",
              {
                user_id: userId,
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
              Score: {result.score}
            </h2>

            <div className="flex gap-6 mt-4 text-lg font-semibold">
              <span className="text-green-400">
                ✅ {result.test_cases.passed} Passed
              </span>
              <span className="text-red-400">
                ❌ {result.test_cases.failed} Failed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-slate-300 text-sm mt-4">
              <p>Execution:</p>
              <p>{result.breakdown.execution}</p>

              <p>Quality:</p>
              <p>{result.breakdown.quality}</p>

              <p>Time:</p>
              <p>{result.breakdown.time}</p>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">
                Test Case Results
              </h3>

              {result.details.map((d, index) => (
              <div
                key={index}
                className={`bg-slate-700 p-4 rounded-lg text-sm border-l-4 
                ${d.status === 'passed' ? 'border-green-400' : 'border-red-400'}`}
              >
                <p className="font-semibold mb-1">
                  Test Case {index + 1}
                </p>

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
                      ? "text-green-400 font-semibold"
                      : "text-red-400 font-semibold"
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
  )
}

export default EditorPage