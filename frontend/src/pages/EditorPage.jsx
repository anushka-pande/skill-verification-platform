import Editor from "@monaco-editor/react"
import { useEffect, useState } from "react"
import axios from "axios"

function EditorPage(props) {
  const [customInput, setCustomInput] = useState("")
  const [runLoading, setRunLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [hint, setHint] = useState("")
  const {
    selectedTask,
    setPage,
    code,
    setCode,
    language,
    setLanguage,
    result,
    setResult
  } = props

  useEffect(() => {
    setCode("")
    setResult(null)
  }, [selectedTask])

  useEffect(() => {
    if (language === "python") setCode("print(input())")
    if (language === "cpp") setCode("#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n}")
    if (language === "c") setCode("#include<stdio.h>\nint main(){\n}")
    if (language === "javascript") setCode("process.stdin.on('data', d => console.log(d.toString()))")
    if (language === "java") setCode("public class Main {\n public static void main(String[] args) {\n }\n}")
  }, [language])

  useEffect(() => {
    const minutes = selectedTask.solve_time_limit || 20
    setTimeLeft(minutes * 60)
  }, [selectedTask])

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

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
            {sessionStorage.getItem("user_email")}
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

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Difficulty: {selectedTask.difficulty}</span>
          <span>Runtime Limit: {selectedTask.execution_time_limit || 1}s</span>
          <span>Recommended Time: {selectedTask.solve_time_limit || 20} min</span>

          <span className="text-yellow-400 font-semibold">
            ⏱ {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>

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
          <option value="c">C</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
        </select>

        <Editor
          height="420px"
          theme="vs-dark"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value)}
        />

        <textarea
          rows="4"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Custom input for Run Code"
          className="mt-4 bg-slate-800 p-3 rounded text-white"
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={async () => {
              try {
                setRunLoading(true)
                setResult(null)

                console.log("TASK=", selectedTask)
                console.log("EXPECTED=", selectedTask.public_test_cases?.[0]?.output)

                const res = await axios.post(
                "http://127.0.0.1:8000/run-code", 
                {
                  code,
                  language,
                  input: customInput || selectedTask.public_test_cases?.[0]?.input ||
                    selectedTask.test_cases?.[0]?.output ||
                    "",
                  expected:
                    selectedTask.public_test_cases?.[0]?.output || 
                    selectedTask.test_cases?.[0]?.input ||
                    ""
                })

                console.log("RUN RESPONSE = ", res.data)
                setResult({
                  runOnly: true,
                  ...res.data
                })

              } catch (err) {
                alert("Run failed")
              } finally {
                setRunLoading(false)
              }
            }}
            className="bg-slate-700 px-6 py-3 rounded-lg"
          >
            {runLoading ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={async () => {
              try {
                setSubmitLoading(true)

                const userId = parseInt(sessionStorage.getItem("user_id"))

                if (!userId) {
                  alert("User session expired. Please login again.")
                  return
                }

                const submitRes = await axios.post(
                  "http://127.0.0.1:8000/submit-code",
                  {
                    user_id: userId,
                    task_id: selectedTask.title,
                    code,
                    language
                  }
                )

                const submissionId = submitRes.data.submission_id

                const execRes = await axios.post(
                  `http://127.0.0.1:8000/execute/${submissionId}`
                )

                setResult(execRes.data)

              } catch (err) {
                console.log(err)
                console.log(err.response?.data)
                alert(
                  err.response?.data?.detail ||
                  err.message ||
                  "Submission failed"
                )
              } finally {
                setSubmitLoading(false)
              }
            }}
            className="bg-purple-600 px-6 py-3 rounded-lg"
          >
            {submitLoading ? "Submitting..." : "Submit Code"}
          </button>
        </div>

        {result?.runOnly && (
          <div className="mt-6 bg-slate-800 p-6 rounded-xl">
            <h2 className="text-cyan-400 text-xl mb-3">Run Result</h2>

            {result.error ? (
              <pre className="text-red-400 whitespace-pre-wrap">
                {result.error}
              </pre>
            ) : (
              <pre className="text-green-400 whitespace-pre-wrap">
                {result.output}
              </pre>
            )}

            <p className="text-slate-400 mt-2">
              Execution Time: {result.execution_time}s
            </p>
            {result.hint && (
              <div className="mt-3 bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 px-3 py-2 rounded-lg">
                ⚠ Hint: {result.hint}
              </div>
            )}
          </div>
        )}

        {result && !result.runOnly && (
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
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <span>Test Case {index + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    d.hidden ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"
                  }`}>
                    {d.hidden ? "Hidden" : "Public"}
                  </span>
                </p>

                {d.hidden ? (
                  <p
                    className={
                      d.status === "passed"
                      ? "text-green-400 font-semibold"
                      : "text-red-400 font-semibold"
                    }
                  >
                    {d.status.toUpperCase()}
                  </p>
                ) : (
                  <>
                    <p><strong>Input:</strong> {d.input}</p>
                    <p><strong>Expected:</strong> {d.expected}</p>

                    {d.error ? (
                      <p className="text-red-400">
                        <strong>Error:</strong> {d.error}
                      </p>
                    ) : (
                      <>
                        <div>
                          <strong>Actual:</strong> 
                          <pre className="mt-1 whitespace-pre-wrap text-slate-300">
                            {d.actual}
                          </pre> 
                        </div>
                        <p
                          className={
                            d.status === "passed"
                              ? "text-green-400 font-semibold"
                              : "text-red-400 font-semibold"
                          }
                        >
                          {d.status.toUpperCase()}
                        </p>

                        {d.hint && (
                          <div className="mt-3 bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 px-3 py-2 rounded-lg">
                            ⚠ Hint: {d.hint}
                          </div>
                        )}
                      </>
                    )}
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