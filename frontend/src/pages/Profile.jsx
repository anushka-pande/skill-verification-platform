function ProfilePage(props) {
  const { setPage, profileData } = props

  const email = localStorage.getItem("user_email")
  const name = email?.split("@")[0] || "Candidate"

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-10">
        Loading...
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 p-10 text-white">
        {/* Header */}
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

        {/* Hero */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold">
            {name[0].toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {name}
            </h2>

            <p className="text-slate-400">
              {email}
            </p>

            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
              {profileData.skill_level}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:gird-cols-6 gap-4 mb-8">
          <div className="bg-slate-800 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Submissions</p>
            <p className="text-2xl font-bold">
              {profileData.total_submissions}
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Average Score</p>
            <p className="text-2xl font-bold text-purple-400">
              {profileData.average_score}
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Best Score</p>
            <p className="text-2xl font-bold text-yellow-400">
              {profileData.best_score}
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Success Rate</p>
            <p className="text-2xl font-bold text-green-400">
              {profileData.success_rate}%
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Rank</p>
            <p className="text-2xl font-bold text-yellow-300">
              #{profileData.rank}
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Streak</p>
            <p className="text-2xl font-bold text-orange-300">
              {profileData.streak_days} 
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-purple-300">
            Performance
          </h3>

          <p className="mb-2">Average Score</p>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-5">
            <div
              className="bg-purple-500 h-3 rounded-full"
              style={{
                width: `${profileData.average_score}%`
              }}
            />
          </div>

          <p className="mb-2">Success Rate</p>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{
                width: `${profileData.success_rate}%`
              }}
            />
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-purple-300">
            Skill Breakdown
          </h3>

          <div className="space-y-4">
            {profileData.skill_breakdown?.map((item, index) => (
              <div key={index}>

                <div className="flex justify-between mb-1">
                  <span>{item.skill}</span>
                  <span className="text-slate-300">
                    {item.score}
                  </span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{
                      width: `${item.score}%`
                    }}
                  />
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-purple-300">
            Recent Activity
          </h3>

          <div className="space-y-3">

            {profileData.recent_activity?.map((item, index) => (
              <div
                key={index}
                className="bg-slate-700 rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {item.task}
                  </p>

                  <p className="text-sm text-slate-400">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>

                <div className="text-green-400 font-bold text-lg">
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-300">
            Achievements
          </h3>

          <div className="flex flex-wrap gap-3">

            {profileData.best_score === 100 && (
              <span className="px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-300">
                Perfect Score
              </span>
            )}

            {profileData.total_submissions >= 5 && (
              <span className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300">
                5+ Attempts
              </span>
            )}

            {profileData.skill_level === "Advanced" && (
              <span className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300">
                Advanced Coder
              </span>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage