import { useState } from "react"
import axios from "axios"

function SettingsPage(props) {
  const { 
    setPage,
    language,
    setLanguage
  } = props

  const email = localStorage.getItem("user_email")
  const role = localStorage.getItem("role")
  const userId = localStorage.getItem("user_id")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [defaultLanguage, setDefaultLanguage] = useState(language)

  return (
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
          Settings
        </h1>
      </div>

      {/* Main Card */}
      <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl space-y-8">

        {/* Account */}
        <div>
          <h2 className="text-lg font-semibold text-purple-300 mb-4">
            Account
          </h2>

          <p className="text-slate-300 mb-2">Email: {email}</p>
          <p className="text-slate-300 mb-2">Role: {role}</p>
          <p className="text-slate-300">User ID: {userId}</p>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-lg font-semibold text-purple-300 mb-4">
            Preferences
          </h2>

          <div className="flex gap-3 items-center">

            <select
              value={defaultLanguage}
              onChange={(e) =>
                setDefaultLanguage(e.target.value)
              }
              className="bg-slate-700 px-4 py-2 rounded-lg"
            >
              <option value="python">Python</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>

            <button
              onClick={() => {
                localStorage.setItem(
                  "default_language",
                  defaultLanguage
                )

                setLanguage(defaultLanguage)

                alert("Language preference saved")
              }}
              className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Save
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-2">
            Default coding language
          </p>
        </div>

        {/* Security */}
        <div>
          <h2 className="text-lg font-semibold text-purple-300 mb-4">
            Security
          </h2>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-700 px-4 py-2 rounded-lg"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-700 px-4 py-2 rounded-lg"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-700 px-4 py-2 rounded-lg"
            />

            <button
              onClick={async () => {

                if (newPassword !== confirmPassword) {
                  alert("Passwords do not match")
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

                  alert("Password changed successfully")

                  setCurrentPassword("")
                  setNewPassword("")
                  setConfirmPassword("")

                } catch (err) {
                  alert(
                    err.response?.data?.detail ||
                    "Password change failed"
                  )
                }

              }}
              className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Logout */}
        <div>
          <button
            onClick={() => {
              localStorage.clear()
              setPage("auth")
            }}
            className="bg-red-500 px-5 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}

export default SettingsPage