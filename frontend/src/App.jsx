import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { FiUser, FiSettings, FiBarChart2 } from "react-icons/fi"
import { HiOutlineCode } from "react-icons/hi"
import { MdOutlineWork } from "react-icons/md"

import AuthPage from "./pages/AuthPage"
import Dashboard from "./pages/Dashboard"
import EditorPage from "./pages/EditorPage"
import ProfilePage from "./pages/Profile"
import SubmissionsPage from "./pages/SubmissionsPage"
import AddTaskPage from "./pages/AddTaskPage"
import RecruiterPage from "./pages/RecruiterPage"
import ChooseRole from "./pages/chooseRole"
import CompleteProfile from "./pages/CompleteProfile"
import SettingsPage from "./pages/SettingsPage"
import TaskPreview from "./pages/TaskPreview"

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpEmail, setOtpEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [page, setPage] = useState("auth")

  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)

  const [aiData, setAiData] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const [filteredDifficulty, setFilteredDifficulty] = useState("All")
  const [code, setCode] = useState("")
  const [result, setResult] = useState(null)
  const [language, setLanguage] = useState(
    sessionStorage.getItem("default_language") || "python"
  )

  const [profileOpen, setProfileOpen] = useState(false)

  const [submissions, setSubmissions] = useState([])
  const [sortType, setSortType] = useState("latest")

  const [title, setTitle] = useState("")
  const [taskDifficulty, setTaskDifficulty] = useState("")
  const [description, setDescription] = useState("")
  const [skill, setSkill] = useState("")
  const [constraints, setConstraints] = useState("")
  const [outputFormat, setOutputFormat] = useState("")
  const [edgeCases, setEdgeCases] = useState("")
  const [examples, setExamples] = useState([
    { input: "", output: "", explanation: ""}
  ])
  const [executionTimeLimit, setExecutionTimeLimit] = useState(1)
  const [solveTimeLimit, setSolveTimeLimit] = useState(20)
  const [publicCases, setPublicCases] = useState([
    { input: "", output: "" },
  ])
  const [hiddenCases, setHiddenCases] = useState([
    { input:"", output:"" }
  ])
  const [taskSuccess, setTaskSuccess] = useState(false)

  const [recruiterData, setRecruiterData] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [candidateSort, setCandidateSort] = useState("rank")
  const [skillFilter, setSkillFilter] = useState("")
  const [candidateStatus, setCandidateStatus] = useState({})
  const [plagiarismData, setPlagiarismData] = useState([])

  const [theme, setTheme] = useState(
    sessionStorage.getItem("theme") || "dark"
  )

  const role = sessionStorage.getItem("role")
  const userEmail = sessionStorage.getItem("user_email")
  const token = sessionStorage.getItem("token")

  const isAdmin = userEmail === "anushkapande04@gmail.com"

  const handleSubmit = async () => {
    if (isLogin === false) {
      if (passwordStrength !== "Strong") {
        alert("Password is not strong enough")
        return
      }
    }
    try {
      if (isLogin) {

        const res = await axios.post("http://127.0.0.1:8000/login", {
          email,
          password
        })

        sessionStorage.setItem("token", res.data.token)
        sessionStorage.setItem("user_id", res.data.user_id)
        sessionStorage.setItem("role", res.data.role)
        sessionStorage.setItem("user_email", email)

        // Clear fields
        setEmail("")
        setPassword("")

        // redirect
        if(res.data.role) {
          sessionStorage.setItem("role", res.data.role)
          
          const profileRes = await axios.get(
            `http://127.0.0.1:8000/profile/${res.data.user_id}`
          )

          const profile = profileRes.data

          if(res.data.role === "recruiter") {
            if(!profile.company_name) {
              setPage("complete-profile")
            }
            else {
              setPage("recruiter")
            }
          }
          else {
            if(!profile.skills) {
              setPage("complete-profile")
            }
            else {
              setPage("dashboard")
            }
          }
        }
        else {
          setPage("choose-role")
        }
        setProfileOpen(false)

      } else {

        await axios.post("http://127.0.0.1:8000/register", {
          name,
          email,
          password
        })

        setOtpEmail(email)
        setShowOtpInput(true)

        // Clear fields
        setName("")
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

      const url =
        filteredDifficulty === "All"
          ? "http://127.0.0.1:8000/tasks"
          : `http://127.0.0.1:8000/tasks?diffculty=${filteredDifficulty}`

      const userId = sessionStorage.getItem("user_id")

      setAiLoading(true)

      Promise.all([
        axios.get(url),
        axios.get(
          `http://127.0.0.1:8000/ai-insights/${userId}`
        )
      ])
      .then(([tasksRes, aiRes]) => {
        setTasks(tasksRes.data)
        setAiData(aiRes.data)
      })
      .catch(err => console.error(err))
      .finally(() => setAiLoading(false))
    }
  }, [page, filteredDifficulty])

  useEffect(() => {
    if (page === "submissions") {
      const userId = parseInt(sessionStorage.getItem("user_id"))

      axios
        .get(`http://127.0.0.1:8000/submissions/${userId}`)
        .then(res => setSubmissions(res.data))
        .catch(err => console.error(err))
    }
  }, [page])

  useEffect(() => {
    if (page === "recruiter") {
      Promise.all([
        axios.get(
          "http://127.0.0.1:8000/recruiter/overview",
          { headers: { Authorization: `Bearer ${token}` } }
        ),

        axios.get(
          "http://127.0.0.1:8000/recruiter/plagiarism",
          { headers: { Authorization: `Bearer ${token}` } }
        ),

        axios.get(
          "http://127.0.0.1:8000/recruiter/status",
          { headers: { Authorization:`Bearer ${token}` } }
        )
      ])
      .then(([overviewRes, plagiarismRes, statusRes]) => {
        setRecruiterData(overviewRes.data)
        setPlagiarismData(plagiarismRes.data)
        setCandidateStatus(statusRes.data)
      })
    }

  }, [page])

  useEffect(() => {
    setProfileOpen(false)
  }, [page])

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "light" : ""
    sessionStorage.setItem("theme", theme)
  }, [theme])

  return (
    <>
      {page === "auth" && (
        <AuthPage
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          passwordStrength={passwordStrength}
          setPasswordStrength={setPasswordStrength}
          showOtpInput={showOtpInput}
          setShowOtpInput={setShowOtpInput}
          otp={otp}
          setOtp={setOtp}
          otpEmail={otpEmail}
          setOtpEmail={setOtpEmail}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleSubmit={handleSubmit}
        />
      )}

      {page === "dashboard" && (
        <Dashboard
          tasks={tasks}
          setPage={setPage}
          setSelectedTask={setSelectedTask}
          difficulty={filteredDifficulty}
          setDifficulty={setFilteredDifficulty}
          isAdmin={isAdmin}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          aiData={aiData}
          setAiData={setAiData}
          aiLoading={aiLoading}
          setAiLoading={setAiLoading}
        />
      )}

      {page === "editor" && selectedTask && (
        <EditorPage
          selectedTask={selectedTask}
          setPage={setPage}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          result={result}
          setResult={setResult}
        />
      )}

      {page === "task-preview" && (
        <TaskPreview
          task={selectedTask}
          setPage={setPage}
        />
      )}

      {page === "profile" && (
        <ProfilePage
          setPage={setPage}
        />
      )}

      {page === "submissions" && (
        <SubmissionsPage
          setPage={setPage}
          submissions={submissions}
          sortType={sortType}
          setSortType={setSortType}
        />
      )}

      {page === "add-task" && role === 'recruiter' && (
        <AddTaskPage
          setPage={setPage}

          title={title}
          setTitle={setTitle}

          description={description}
          setDescription={setDescription}

          skill={skill}
          setSkill={setSkill}

          constraints={constraints}
          setConstraints={setConstraints}

          outputFormat={outputFormat}
          setOutputFormat={setOutputFormat}

          edgeCases={edgeCases}
          setEdgeCases={setEdgeCases}

          examples={examples}
          setExamples={setExamples}

          executionTimeLimit={executionTimeLimit}
          setExecutionTimeLimit={setExecutionTimeLimit}

          solveTimeLimit={solveTimeLimit}
          setSolveTimeLimit={setSolveTimeLimit}

          taskDifficulty={taskDifficulty}
          setTaskDifficulty={setTaskDifficulty}

          publicCases={publicCases}
          setPublicCases={setPublicCases}

          hiddenCases={hiddenCases}
          setHiddenCases={setHiddenCases}

          taskSuccess={taskSuccess}
          setTaskSuccess={setTaskSuccess}
        />
      )}

      {page === "recruiter" && role === "recruiter" && (
        <RecruiterPage
          setPage={setPage}
          recruiterData={recruiterData}
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={setSelectedCandidate}
          candidateSort={candidateSort}
          setCandidateSort={setCandidateSort}
          skillFilter={skillFilter}
          setSkillFilter={setSkillFilter}
          candidateStatus={candidateStatus}
          setCandidateStatus={setCandidateStatus}
          plagiarismData={plagiarismData}
        />
      )}

      {page === "choose-role" && (
        <ChooseRole setPage={setPage} />
      )}

      {page === "complete-profile" && (
        <CompleteProfile setPage={setPage} />
      )}

      {page === "settings" && (
        <SettingsPage
          setPage={setPage}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </>
  )
}

export default App