function SettingsPage(props) {
  const { setPage } = props

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
            Settings
          </h1>
        </div>

        {/* Content */}
        <div className="bg-slate-800 p-6 rounded-xl w-[400px]">
          <p className="text-slate-400">
            Settings coming soon...
          </p>
        </div>
      </div>
    </>
  )
}

export default SettingsPage