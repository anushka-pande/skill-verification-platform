import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiBarChart2,
  FiTrendingUp,
  FiAward
} from "react-icons/fi"

function ProfilePage(props) {
  const { setPage } = props

  const [profileData, setProfileData] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    skills: "",
    company_name: "",
    company_domain: "",
    company_location: "",
    recruiter_role: ""
  })

  const email = sessionStorage.getItem("user_email")
  const role = sessionStorage.getItem("role")
  const userId = sessionStorage.getItem("user_id")

  const name = email?.split("@")[0] || "User"

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/profile/${userId}`)
      .then((res) => {
        setProfileData(res.data)

        setForm({
          skills: res.data.skills || "",
          company_name: res.data.company_name || "",
          company_domain: res.data.company_domain || "",
          company_location: res.data.company_location || "",
          recruiter_role: res.data.recruiter_role || ""
        })
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load profile")
      })
  }, [userId])

  if (!profileData) {
    return (
      <div className="page-shell text-main fade-in">
        Loading...
      </div>
    )
  }

  const isCandidate = role === "candidate"

  return (
    <div className="page-shell text-main fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setPage("dashboard")}
          className="btn-glass px-4 py-2 rounded-lg hover:themed-input flex items-center gap-2"
        >
          <FiArrowLeft className="text-[var(--icon)] text-[18px]" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-accent">
          {isCandidate ? "My Profile" : "Recruiter Profile"}
        </h1>
      </div>

      {/* Hero Card */}
      <div className="glass rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold">
          <FiUser className="text-[28px] text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">{name}</h2>

          <p className="subtle flex items-center gap-2">
            <FiMail className="text-[var(--icon)] opacity-70" />
            {email}
          </p>

          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-accent text-white text-sm">
            {isCandidate ? profileData.skill_level : "Recruiter"}
          </span>
        </div>
      </div>

      {isCandidate ? (
        <>
          {/* Candidate Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card title="Submissions" 
              value={profileData.total_submissions} 
              icon={<FiBarChart2 />} 
            />

            <Card title="Average Score" 
              value={profileData.average_score} 
              color="text-accent" icon={<FiTrendingUp />} 
            />

            <Card title="Best Score" 
              value={profileData.best_score} 
              color="text-warning" icon={<FiAward />} 
            />

            <Card title="Success Rate" 
              value={`${profileData.success_rate}%`} 
              color="text-success" icon={<FiTrendingUp />} 
            />

            <Card title="Rank" 
              value={`#${profileData.rank || "-"}`} 
              color="text-warning" icon={<FiAward />} 
            />

            <Card title="Streak" 
              value={profileData.streak_days} 
              color="text-warning" icon={<FiTrendingUp />} 
            />
          </div>

          {/* Performance */}
          <Section title="Performance">
            <ProgressBar
              label="Average Score"
              value={profileData.average_score}
              color="bg-accent"
            />

            <ProgressBar
              label="Success Rate"
              value={profileData.success_rate}
              color="bg-green-500"
            />
          </Section>

          {/* Skill Breakdown */}
          <Section title="Skill Breakdown">
            {profileData.skill_breakdown?.length > 0 ? (
              <div className="space-y-4">
                {profileData.skill_breakdown.map((item, index) => (
                  <ProgressBar
                    key={index}
                    label={item.skill}
                    value={item.score}
                    color="bg-accent"
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="No submissions yet." />
            )}
          </Section>

          {/* Recent Activity */}
          <Section title="Recent Activity">
            {profileData.recent_activity?.length > 0 ? (
              <div className="space-y-3">
                {profileData.recent_activity.map((item, index) => (
                  <div
                    key={index}
                    className="themed-input rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.task}</p>

                      <p className="text-sm subtle">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-success font-bold">
                      {item.score}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No coding activity yet." />
            )}
          </Section>

          {/* Achievements */}
          <Section title="Achievements">
            {profileData.total_submissions === 0 ? (
              <EmptyState text="No achievements yet. Start solving tasks." />
            ) : (
              <div className="flex flex-wrap gap-3">
                {profileData.best_score === 100 && (
                  <Badge
                    text="Perfect Score"
                    classes="badge badge-warning"
                  />
                )}

                {profileData.total_submissions >= 5 && (
                  <Badge
                    text="5+ Attempts"
                    classes="badge badge-info"
                  />
                )}

                {profileData.skill_level === "Advanced" && (
                  <Badge
                    text="Advanced Coder"
                    classes="badge badge-accent"
                  />
                )}
              </div>
            )}
          </Section>

          {/* SKILLS */}
          <Section title="Profile Details">
            <div className="flex justify-between items-center mb-3">
              <p className="subtle text-sm">Manage your details</p>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-accent text-sm"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="subtle text-sm">Skills</p>
                {editMode ? (
                  <input
                    value={form.skills}
                    onChange={(e) =>
                      setForm({ ...form, skills: e.target.value })
                    }
                    className="themed-input w-full p-2"
                  />
                ) : (
                  <p className="font-medium">
                    {profileData.skills || "Not added"}
                  </p>
                )}
              </div>
            </div>

            {editMode && (
              <button
                onClick={async () => {
                  try {
                    await axios.post("http://127.0.0.1:8000/complete-profile", {
                      user_id: sessionStorage.getItem("user_id"),
                      ...form
                    })

                    toast.success("Profile updated")

                    setEditMode(false)

                    // update UI instantly
                    setProfileData({
                      ...profileData,
                      ...form
                    })

                  } catch (err) {
                    toast.error("Failed to update")
                  }
                }}
                className="btn-primary w-full mt-4 p-2 rounded"
              >
                Save Changes
              </button>
            )}
          </Section>
        </>
      ) : (
        <>
          {/* Recruiter Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card title="Tasks Created" 
              value={profileData.tasks_created || 0} 
              color="text-accent" icon={<FiBarChart2 />} 
            />

            <Card title="Candidates Assessed" 
              value={profileData.candidates_assessed || 0} 
              color="text-success" icon={<FiUser />} 
            />

            <Card title="Avg Candidate Score" 
              value={`${profileData.avg_candidate_score || 0}%`} 
              color="text-warning" icon={<FiTrendingUp />} 
            />

            <Card title="Hiring Readiness" 
              value={profileData.hiring_readiness || "Good"} 
              color="text-blue-300" icon={<FiAward />} 
            />
          </div>

          {/* Recruiter Insights */}
          <Section title="Recruiter Insights">
            <p className="subtle leading-7">
              Manage coding assessments, review candidate performance,
              shortlist top performers, and strengthen hiring quality using
              data-driven evaluations.
            </p>
          </Section>

          {/* Recruiter's Company details */}
          <Section title="Company Details">
            <div className="flex justify-between items-center mb-3">
              <p className="subtle text-sm">Manage company details</p>

              <button
                onClick={() => setEditMode(!editMode)}
                className="text-accent text-sm"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="subtle text-sm">Company</p>
                {editMode ? (
                  <input
                    value={form.company_name}
                    onChange={(e) =>
                      setForm({ ...form, company_name: e.target.value })
                    }
                    className="themed-input w-full p-2"
                  />
                ) : (
                  <p>{profileData.company_name || "Not added"}</p>
                )}
              </div>

              <div>
                <p className="subtle text-sm">Domain</p>
                {editMode ? (
                  <input
                    value={form.company_domain}
                    onChange={(e) =>
                      setForm({ ...form, company_domain: e.target.value })
                    }
                    className="themed-input w-full p-2"
                  />
                ) : (
                  <p>{profileData.company_domain || "Not added"}</p>
                )}
              </div>

              <div>
                <p className="subtle text-sm">Location</p>
                {editMode ? (
                  <input
                    value={form.company_location}
                    onChange={(e) =>
                      setForm({ ...form, company_location: e.target.value })
                    }
                    className="themed-input w-full p-2"
                  />
                ) : (
                  <p>{profileData.company_location || "Not added"}</p>
                )}
              </div>

              <div>
                <p className="subtle text-sm">Role</p>
                {editMode ? (
                  <input
                    value={form.recruiter_role}
                    onChange={(e) =>
                      setForm({ ...form, recruiter_role: e.target.value })
                    }
                    className="themed-input w-full p-2"
                  />
                ) : (
                  <p>{profileData.recruiter_role || "Not added"}</p>
                )}
              </div>
            </div>

            {editMode && (
              <button
                onClick={async () => {
                  try {
                    await axios.post("http://127.0.0.1:8000/complete-profile", {
                      user_id: sessionStorage.getItem("user_id"),
                      ...form
                    })

                    toast.success("Profile updated")
                    setEditMode(false)

                    setProfileData({
                      ...profileData,
                      ...form
                    })

                  } catch (err) {
                    toast.error("Failed to update")
                  }
                }}
                className="btn-primary w-full mt-4 p-2 rounded"
              >
                Save Changes
              </button>
            )}
          </Section>

          {/* Recruiter Activity */}
          <Section title="Recent Activity">
            {profileData.recent_activity?.length > 0 ? (
              <div className="space-y-3">
                {profileData.recent_activity.map((item, index) => (
                  <div
                    key={index}
                    className="themed-input rounded-xl p-4"
                  >
                    {item.task}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No recruiter activity yet." />
            )}
          </Section>
        </>
      )}
    </div>
  )
}

/* Reusable Components */

function Card({ title, value, color = "text-main", icon }) {
  return (
    <div className="glass p-5 rounded-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
      
      <div className="text-[var(--icon)] text-xl opacity-80">
        {icon}
      </div>

      <div>
        <p className="subtle text-sm">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="glass rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 text-accent">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Badge({ text, classes }) {
  return (
    <span className={`px-3 py-2 rounded-lg ${classes}`}>
      {text}
    </span>
  )
}

function EmptyState({ text }) {
  return <p className="subtle">{text}</p>
}

function ProgressBar({ label, value, color }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="w-full themed-input rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default ProfilePage