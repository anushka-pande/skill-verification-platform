import { useEffect, useState } from "react"
import axios from "axios"

function ProfilePage(props) {
  const { setPage } = props

  const [profileData, setProfileData] = useState(null)

  const email = sessionStorage.getItem("user_email")
  const role = sessionStorage.getItem("role")
  const userId = sessionStorage.getItem("user_id")

  const name = email?.split("@")[0] || "User"

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/profile/${userId}`)
      .then((res) => setProfileData(res.data))
      .catch((err) => console.error(err))
  }, [userId])

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-10">
        Loading...
      </div>
    )
  }

  const isCandidate = role === "candidate"

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setPage("dashboard")}
          className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-purple-400">
          {isCandidate ? "My Profile" : "Recruiter Profile"}
        </h1>
      </div>

      {/* Hero Card */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold">
          {name[0].toUpperCase()}
        </div>

        <div>
          <h2 className="text-2xl font-bold">{name}</h2>

          <p className="text-slate-400">{email}</p>

          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
            {isCandidate ? profileData.skill_level : "Recruiter"}
          </span>
        </div>
      </div>

      {isCandidate ? (
        <>
          {/* Candidate Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card title="Submissions" value={profileData.total_submissions} />
            <Card
              title="Average Score"
              value={profileData.average_score}
              color="text-purple-400"
            />
            <Card
              title="Best Score"
              value={profileData.best_score}
              color="text-yellow-400"
            />
            <Card
              title="Success Rate"
              value={`${profileData.success_rate}%`}
              color="text-green-400"
            />
            <Card
              title="Rank"
              value={`#${profileData.rank || "-"}`}
              color="text-yellow-300"
            />
            <Card
              title="Streak"
              value={profileData.streak_days}
              color="text-orange-300"
            />
          </div>

          {/* Performance */}
          <Section title="Performance">
            <ProgressBar
              label="Average Score"
              value={profileData.average_score}
              color="bg-purple-500"
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
                    color="bg-purple-500"
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
                    className="bg-slate-700 rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.task}</p>

                      <p className="text-sm text-slate-400">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-green-400 font-bold">
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
                    classes="bg-yellow-500/20 text-yellow-300"
                  />
                )}

                {profileData.total_submissions >= 5 && (
                  <Badge
                    text="5+ Attempts"
                    classes="bg-blue-500/20 text-blue-300"
                  />
                )}

                {profileData.skill_level === "Advanced" && (
                  <Badge
                    text="Advanced Coder"
                    classes="bg-purple-500/20 text-purple-300"
                  />
                )}
              </div>
            )}
          </Section>
        </>
      ) : (
        <>
          {/* Recruiter Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card
              title="Tasks Created"
              value={profileData.tasks_created || 0}
              color="text-purple-400"
            />

            <Card
              title="Candidates Assessed"
              value={profileData.candidates_assessed || 0}
              color="text-green-400"
            />

            <Card
              title="Avg Candidate Score"
              value={`${profileData.avg_candidate_score || 0}%`}
              color="text-yellow-300"
            />

            <Card
              title="Hiring Readiness"
              value={profileData.hiring_readiness || "Good"}
              color="text-blue-300"
            />
          </div>

          {/* Recruiter Insights */}
          <Section title="Recruiter Insights">
            <p className="text-slate-300 leading-7">
              Manage coding assessments, review candidate performance,
              shortlist top performers, and strengthen hiring quality using
              data-driven evaluations.
            </p>
          </Section>

          {/* Recruiter Activity */}
          <Section title="Recent Activity">
            {profileData.recent_activity?.length > 0 ? (
              <div className="space-y-3">
                {profileData.recent_activity.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-700 rounded-xl p-4"
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

function Card({ title, value, color = "text-white" }) {
  return (
    <div className="bg-slate-800 p-5 rounded-xl">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 text-purple-300">
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
  return <p className="text-slate-400">{text}</p>
}

function ProgressBar({ label, value, color }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default ProfilePage