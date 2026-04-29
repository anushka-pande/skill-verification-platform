import { Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"

function AuthPage(props) {
  const {
    isLogin,
    setIsLogin,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordStrength,
    setPasswordStrength,
    showOtpInput,
    setShowOtpInput,
    otp,
    setOtp,
    otpEmail,
    setOtpEmail,
    showPassword,
    setShowPassword,
    handleSubmit
  } = props

  const checkPasswordStrength = (password) => {
    let score = 0

    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return "Weak"
    if (score === 3 || score === 4) return "Medium"
    return "Strong"
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-slate-800/70 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-[400px]">
        
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Skill Verification Platform
          </h1>

          <p className="text-slate-400 text-center mt-2 mb-6">
            {isLogin ? "Login to continue" : "Create your account"}
          </p>

          <div className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                disabled={showOtpInput}
                className={`w-full p-3 rounded-lg bg-slate-700 text-white ${
                 showOtpInput ? "opacity-50 cursor-not-allowed" : ""
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              disabled={showOtpInput}
              className={`w-full p-3 rounded-lg bg-slate-700 text-white ${
                  showOtpInput ? "opacity-50 cursor-not-allowed" : ""
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                disabled={showOtpInput}
                className={`w-full p-3 pr-10 rounded-lg bg-slate-700 text-white ${
                  showOtpInput ? "opacity-50 cursor-not-allowed" : ""
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                value={password}
                onChange={(e) => {
                  const value = e.target.value
                  setPassword(value)
                  if (!isLogin) {
                      setPasswordStrength(checkPasswordStrength(value))
                  }
                }}
              />

              {/* Icon */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {!isLogin && !showOtpInput && (
              <>
                <div className="text-xs mt-2 space-y-1">
                  <p className={password.length >= 8 ? "text-green-400" : "text-red-400"}>
                    • At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(password) ? "text-green-400" : "text-red-400"}>
                    • One uppercase letter
                  </p>
                  <p className={/[a-z]/.test(password) ? "text-green-400" : "text-red-400"}>
                    • One lowercase letter
                  </p>
                  <p className={/[0-9]/.test(password) ? "text-green-400" : "text-red-400"}>
                    • One number
                  </p>
                  <p className={/[^A-Za-z0-9]/.test(password) ? "text-green-400" : "text-red-400"}>
                    • One special character
                  </p>
                </div>

                <p className={`mt-2 font-semibold ${
                  passwordStrength === "Strong"
                    ? "text-green-400"
                    : passwordStrength === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                  }`}
                >
                  Strength: {passwordStrength}
                </p>
              </>
            )}

            {showOtpInput && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white"
                />

                <button
                  onClick={async () => {
                      try {
                        await axios.post("http://127.0.0.1:8000/verify-otp", {
                            email: otpEmail,
                            otp
                        })

                        toast.success("Email verified successfully")

                        setShowOtpInput(false)
                        setIsLogin(true)
                        setEmail("")
                        setOtp("")

                      } catch (err) {
                        toast.error(err.response?.data?.detail || "Invalid OTP")
                      }
                  }}
                  className="mt-2 w-full bg-green-500 p-2 rounded"
                >
                Verify OTP
                </button>
              </div>
            )}

              <button
                onClick={handleSubmit}
                disabled={showOtpInput && !isLogin}
                className={`w-full p-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 ${
                    showOtpInput ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                } transition text-white font-semibold`}
              >
                {isLogin ? "Login" : "Register"}
              </button>
          </div>

          <div className="text-center mt-6 text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-purple-400 hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default AuthPage