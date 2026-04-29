import axios from "axios"
import toast from "react-hot-toast"

function ChooseRole({ setPage }) {

  const chooseRole = async (role) => {
    try {
      await axios.post("http://127.0.0.1:8000/set-role", {
        user_id: sessionStorage.getItem("user_id"),
        role
      })

      sessionStorage.setItem("role", role)

      toast.success(`Logged in as ${role}`)

      if (role === "recruiter") {
        setPage("recruiter")
      } else {
        setPage("dashboard")
      }

    } catch (err) {
      toast.error("Failed to set role")
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="bg-slate-800 p-10 rounded-2xl shadow-xl w-[420px] text-center">

        <h1 className="text-3xl font-bold text-purple-400 mb-3">
          Select Your Role
        </h1>

        <p className="text-slate-400 mb-8">
          Choose how you want to continue
        </p>

        <button
          onClick={() => chooseRole("candidate")}
          className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded-lg mb-4 font-semibold"
        >
          Candidate
        </button>

        <button
          onClick={() => chooseRole("recruiter")}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          Recruiter
        </button>

      </div>
    </div>
  )
}

export default ChooseRole