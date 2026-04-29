import toast from "react-hot-toast"
import axios from "axios"
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-main transition-all duration-300">
        <div className="glass p-8 rounded-2xl w-[400px] shadow-xl">
        
          <div className="text-center mb-6">
            <h1 className="font-bold text-3xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
              Provenix
            </h1>

            <p className="subtle text-sm mt-1">
              Skill Verification Platform
            </p>
          </div>

          <p className="subtle text-center mt-2 mb-6">
            {isLogin ? "Login to continue" : "Create your account"}
          </p>

          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--icon)] opacity-80 text-lg" />

                <input
                  type="text"
                  placeholder="Full Name"
                  disabled={showOtpInput}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg glass bg-white/70 dark:bg-white/5 text-main ${
                    showOtpInput ? "opacity-50 cursor-not-allowed" : ""
                  } focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--icon)] topacity-80 ext-lg" />

              <input
                type="email"
                placeholder="Email"
                disabled={showOtpInput}
                className={`w-full pl-12 pr-4 py-3 rounded-lg glass bg-white/70 dark:bg-white/5 text-main ${
                  showOtpInput ? "opacity-50 cursor-not-allowed" : ""
                } focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--icon)] opacity-80 text-lg" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                disabled={showOtpInput}
                className={`w-full pl-12 pr-12 py-3 rounded-lg glass bg-white/70 dark:bg-white/5 text-main ${
                  showOtpInput ? "opacity-50 cursor-not-allowed" : ""
                } focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                value={password}
                onChange={(e) => {
                  const value = e.target.value
                  setPassword(value)
                  if (!isLogin) {
                    setPasswordStrength(checkPasswordStrength(value))
                  }
                }}
              />

              {/* Toggle icon */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--icon)] opacity-80 hover:opacity-100"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>

            {!isLogin && !showOtpInput && (
              <>
                <div className="text-xs mt-2 space-y-1">
                  <p className={password.length >= 8 ? "text-success" : "text-danger"}>
                    • At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(password) ? "text-success" : "text-danger"}>
                    • One uppercase letter
                  </p>
                  <p className={/[a-z]/.test(password) ? "text-success" : "text-danger"}>
                    • One lowercase letter
                  </p>
                  <p className={/[0-9]/.test(password) ? "text-success" : "text-danger"}>
                    • One number
                  </p>
                  <p className={/[^A-Za-z0-9]/.test(password) ? "text-success" : "text-danger"}>
                    • One special character
                  </p>
                </div>

                <p className={`mt-2 font-semibold ${
                  passwordStrength === "Strong"
                    ? "text-success"
                    : passwordStrength === "Medium"
                    ? "text-warning"
                    : "text-danger"
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
                  className="w-full p-3 rounded-lg themed-input text-main"
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
                  className="mt-2 w-full p-2 rounded btn-accent"
                >
                Verify OTP
                </button>
              </div>
            )}

              <button
                onClick={handleSubmit}
                disabled={showOtpInput && !isLogin}
                className={`w-full p-3 rounded-lg bg-gradient-to-r btn-primary ${
                    showOtpInput ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                } transition text-white font-semibold`}
              >
                {isLogin ? "Login" : "Register"}
              </button>
          </div>

          <div className="text-center mt-6 subtle text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-accent hover:underline"
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