import Editor from "@monaco-editor/react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import {
  FiClock,
  FiArrowLeft,
  FiPlay,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle
} from "react-icons/fi"

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
    <div className="min-h-screen text-main flex flex-col lg:flex-row">
      {/* LEFT PANEL — Problem */}
      <div className="w-full lg:w-1/2 p-4 md:p-8 lg:border-r border-[var(--border)] overflow-y-auto">
        {/* Navbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-bold text-3xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
            Provenix
          </h1>

          <span className="subtle">
            {sessionStorage.getItem("user_email")}
          </span>

          <span className="flex items-center gap-2 text-warning font-semibold">
            <FiClock className="text-[var(--icon)] opacity-90 text-[18px]" />
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>

        <button
          onClick={() => {
            setResult(null)
            setPage("dashboard")
          }}
          className="mb-6 flex items-center gap-2 btn-primary btn-glass px-4 py-2 rounded-lg hover:themed-input"
        >
          <FiArrowLeft className="text-[var(--icon)] text-[18px]" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-accent">
          {selectedTask.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm subtle">
          <span>Difficulty: {selectedTask.difficulty}</span>
          <span>Runtime Limit: {selectedTask.execution_time_limit || 1}s</span>
          <span>Recommended Time: {selectedTask.solve_time_limit || 20} min</span>
        </div>

        <div className="mt-6 glass p-6 rounded-xl space-y-5">
          <p className="subtle whitespace-pre-line">
            {selectedTask.description || 
              "Read input from standard input and print the result."
            }
          </p>

          {selectedTask.constraints?.length > 0 && (
            <div>
              <h3 className="text-accent font-semibold mb-2">
                Constraints
              </h3>

              {selectedTask.constraints.map((x, i) => (
                <p key={i} className="subtle text-sm">• {x}</p>
              ))}
            </div>
          )}

          {selectedTask.output_format && (
            <div>
              <h3 className="text-success font-semibold mb-2">
                Output Format
              </h3>

              <p className="subtle text-sm">
                {selectedTask.output_format}
              </p>
            </div>
          )}

          {selectedTask.edge_cases?.length > 0 && (
            <div>
              <h3 className="text-warning font-semibold mb-2">
                Edge Cases
              </h3>

              {selectedTask.edge_cases.map((x, i) => (
                <p key={i} className="subtle text-sm">• {x}</p>
              ))}
            </div>
          )}

          {selectedTask.examples?.length > 0 && (
            <div>
              <h3 className="text-accent font-semibold mb-3">
                Examples
              </h3>

              <div className="space-y-4">
                {selectedTask.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="glass rounded-xl p-4 border border-[var(--border)]"
                  >
                    <p className="text-main font-semibold mb-3">
                      Example {i + 1}
                    </p>

                    <div className="subtle mt-2">
                      <span className="font-semibold text-main">Input:</span>
                      <pre className="mt-1 whitespace-pre-wrap">{ex.input}</pre>
                    </div>

                    <div className="subtle mt-2">
                      <span className="font-semibold text-main">Output:</span>
                      <pre className="mt-1 whitespace-pre-wrap">{ex.output}</pre>
                    </div>

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
      </div>


      {/* RIGHT PANEL — Editor */}
      <div className="w-full lg:w-1/2 p-4 md:p-6 flex flex-col">
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-4 themed-input p-2 rounded text-main"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
        </select>

        <Editor
          height="50vh"
          theme={sessionStorage.getItem("theme")==="light" ? "vs" : "vs-dark"}
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value)}
        />

        <textarea
          rows="4"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Custom input for Run Code"
          className="mt-4 glass p-3 rounded text-main"
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
                toast.error("Run failed")
              } finally {
                setRunLoading(false)
              }
            }}
            className="flex items-center justify-center gap-2 btn-primary btn-glass px-6 py-3 rounded-lg"
          >
            <FiPlay className="text-[var(--icon)] text-[18px]" />
              {runLoading ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={async () => {
              try {
                setSubmitLoading(true)

                const userId = parseInt(sessionStorage.getItem("user_id"))

                if (!userId) {
                  toast.error("User session expired. Please login again.")
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
                toast.success("Code submitted successfully")

              } catch (err) {
                console.log(err)
                console.log(err.response?.data)
                toast.error(
                  err.response?.data?.detail ||
                  err.message ||
                  "Submission failed"
                )
              } finally {
                setSubmitLoading(false)
              }
            }}
            className="flex items-center justify-center gap-2 btn-primary px-6 py-3 rounded-lg"
          >
            <FiSend className="text-[var(--icon)] text-[18px]" />
              {submitLoading ? "Submitting..." : "Submit Code"}
          </button>
        </div>

        {result?.runOnly && (
          <div className="mt-6 glass p-6 rounded-xl">
            <h2 className="text-accent text-xl mb-3">Run Result</h2>

            {result.error ? (
              <pre className="text-danger whitespace-pre-wrap">
                {result.error}
              </pre>
            ) : (
              <pre className="text-success whitespace-pre-wrap">
                {result.output}
              </pre>
            )}

            <p className="subtle mt-2">
              Execution Time: {result.execution_time}s
            </p>
            {result.hint && (
              <div className="mt-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-400/30 text-warning px-3 py-2 rounded-lg">
                <FiAlertTriangle className="text-[18px]" />
                Hint: {result.hint}
              </div>
            )}
          </div>
        )}

        {result && !result.runOnly && (
          <div className="mt-6 glass p-6 rounded-xl">
            <h2 className="text-success text-3xl font-bold mb-4">
              Score: {result.score}
            </h2>

            <div className="flex gap-6 mt-4 text-lg font-semibold">
              <span className="flex items-center gap-2 text-success">
                <FiCheckCircle className="text-[18px]" />
                {result.test_cases.passed} Passed
              </span>

              <span className="flex items-center gap-2 text-danger">
                <FiXCircle className="text-[18px]" />
                {result.test_cases.failed} Failed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 subtle text-sm mt-4">
              <p>Execution:</p>
              <p>{result.breakdown.execution}</p>

              <p>Quality:</p>
              <p>{result.breakdown.quality}</p>

              <p>Time:</p>
              <p>{result.breakdown.time}</p>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-accent">
                Test Case Results
              </h3>

              {result.details.map((d, index) => (
              <div
                key={index}
                className={`glass p-4 rounded-lg text-sm border-l-4 
                ${d.status === 'passed' ? 'border-green-400' : 'border-red-400'}`}
              >
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <span>Test Case {index + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    d.hidden ? "bg-red-500/20 text-danger" : "bg-green-500/20 text-success"
                  }`}>
                    {d.hidden ? "Hidden" : "Public"}
                  </span>
                </p>

                {d.hidden ? (
                  <p
                    className={
                      d.status === "passed"
                      ? "text-success font-semibold"
                      : "text-danger font-semibold"
                    }
                  >
                    {d.status.toUpperCase()}
                  </p>
                ) : (
                  <>
                    <div>
                      <strong>Input:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{d.input}</pre>
                    </div>
                    <p><strong>Expected:</strong> {d.expected}</p>

                    {d.error ? (
                      <p className="text-danger">
                        <strong>Error:</strong> {d.error}
                      </p>
                    ) : (
                      <>
                        <div>
                          <strong>Actual:</strong> 
                          <pre className="mt-1 whitespace-pre-wrap subtle">
                            {d.actual}
                          </pre> 
                        </div>
                        <p
                          className={
                            d.status === "passed"
                              ? "text-success font-semibold"
                              : "text-danger font-semibold"
                          }
                        >
                          {d.status.toUpperCase()}
                        </p>

                        {d.hint && (
                          <div className="mt-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-400/30 text-warning px-3 py-2 rounded-lg">
                            <FiAlertTriangle className="text-[18px]" />
                            Hint: {d.hint}
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