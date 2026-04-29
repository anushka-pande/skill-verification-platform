import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import {
  FiArrowLeft,
  FiMail,
  FiUser,
  FiKey,
  FiGlobe,
  FiMoon,
  FiSun,
  FiLogOut
} from "react-icons/fi"

function SettingsPage(props) {
  const { 
    setPage,
    language,
    setLanguage,
    theme,
    setTheme
  } = props

  const email = sessionStorage.getItem("user_email")
  const role = sessionStorage.getItem("role")
  const userId = sessionStorage.getItem("user_id")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [defaultLanguage, setDefaultLanguage] = useState(language)
  const [selectedLanguage, setSelectedLanguage] = useState(language)

  const isCandidate = role === "candidate"

  useEffect(() => {
    const saved = sessionStorage.getItem("default_language") || "Python"
    setDefaultLanguage(saved)
    setSelectedLanguage(saved)
  }, [])

  return (
    <div className="page-shell text-main">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setPage("dashboard")}
          className="btn-glass px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <FiArrowLeft className="text-[var(--icon)] text-[18px]" />
          Back
        </button>

        <h1 className="section-title text-accent">
          Settings
        </h1>
      </div>

      {/* Main Card */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 md:p-8 space-y-8">
          {/* Account */}
          <div>
            <h2 className="text-lg font-semibold text-accent mb-4">
              Account
            </h2>

            <div className="space-y-2">
              <p className="subtle flex items-center gap-2">
                <FiMail className="text-[var(--icon)]" />
                {email}
              </p>

              <p className="subtle flex items-center gap-2">
                <FiUser className="text-[var(--icon)]" />
                {role}
              </p>

              <p className="subtle flex items-center gap-2">
                <FiKey className="text-[var(--icon)]" />
                {userId}
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-accent mb-4">
              Preferences
            </h2>

            <div className="flex gap-3 items-center">
              <FiGlobe className="text-[var(--icon)] text-[18px]" />
              <select
                value={selectedLanguage}
                onChange={(e) =>
                  setSelectedLanguage(e.target.value)
                }
                className="btn-glass px-4 py-2 rounded-lg"
              >
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
              </select>

              <button
                onClick={() => {
                  sessionStorage.setItem(
                    "default_language",
                    selectedLanguage
                  )
                  setLanguage(selectedLanguage)
                  setDefaultLanguage(selectedLanguage)
                  toast.success("Language preference saved")
                }}
                className="btn-primary px-4 py-2 rounded-lg hover:text-accent"
              >
                Save
              </button>
            </div>

            <p className="text-sm subtle mt-2">
              Default coding language
            </p>

            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-accent">
                Theme
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                    theme === "dark" ? "btn-primary" : "btn-glass"
                  }`}
                >
                  <FiMoon /> Dark
                </button>

                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                    theme === "light" ? "btn-primary" : "btn-glass"
                  }`}
                >
                  <FiSun /> Light
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-lg font-semibold text-accent mb-4">
              Security
            </h2>

            <div className="space-y-3">
              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--icon)]" />
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full glass px-4 py-2 rounded-xl"
                />
              </div>

              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--icon)]" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full glass px-4 py-2 rounded-xl"
                />
              </div>

              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--icon)]" />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass px-4 py-2 rounded-xl"
                />
              </div>

              <button
                onClick={async () => {

                  if (newPassword !== confirmPassword) {
                    toast.error("Passwords do not match")
                    return
                  }

                  try {
                    await axios.post(
                      "http://127.0.0.1:8000/change-password",
                      {
                        user_id: parseInt(userId),
                        current_password: currentPassword,
                        new_password: newPassword
                      }
                    )

                    toast.success("Password changed successfully")

                    setCurrentPassword("")
                    setNewPassword("")
                    setConfirmPassword("")

                  } catch (err) {
                    toast.error(
                      err.response?.data?.detail ||
                      "Password change failed"
                    )
                  }

                }}
                className="btn-primary px-4 py-2 rounded-lg hover:text-accent"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Logout */}
          <div>
            <button
              onClick={() => {
                sessionStorage.clear()
                toast.success("Logged out")
                setPage("auth")
              }}
              className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg flex items-center gap-2"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="glass rounded-3xl p-6 md:p-8 space-y-6 fade-in">
          <h2 className="text-lg font-semibold text-accent">
            Quick Overview
          </h2>

          <div className="glass rounded-2xl p-4">
            <p className="subtle text-sm">Role</p>
            <p className="text-xl font-bold">{role}</p>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="subtle text-sm">Preferred Language</p>
            <p className="text-xl font-bold">{defaultLanguage}</p>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="subtle text-sm">Security</p>
            <p className="text-success font-semibold">
              Account Active
            </p>
          </div>

          <div className="glass rounded-2xl p-5 border border-[var(--border)]">
            <p className="font-semibold text-accent mb-2">
              Tip
            </p>

            <p className="text-sm text-main">
              {isCandidate
                ? "Keep solving regularly to improve rankings."
                : "Create smart assessments to identify top candidates faster."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage