function ProfilePage(props) {
  const { setPage, profileData } = props

  return (
    <>
      <div className="min-h-screen bg-slate-900 p-10 text-white">
        {/* Top Bar */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setPage("dashboard")}
            className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold text-purple-400">
              My Profile
          </h1>
        </div>

        {/* Content */}
        {profileData ? (
          <div className="bg-slate-800 p-6 rounded-xl w-[400px] space-y-4">
            <p>Email: {localStorage.getItem("user_email")}</p>

            <p>Total Submissions: {profileData.total_submissions}</p>
            <p>Average Score: {profileData.average_score}</p>
            <p>Best Score: {profileData.best_score}</p>
            <p>Success Rate: {profileData.success_rate}%</p>
            <p>
              <span className="skill-badge">
                  Skill Level: {profileData.skill_level}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-slate-400">Loading...</p>
        )}
      </div>
    </>
  )
}

export default ProfilePage