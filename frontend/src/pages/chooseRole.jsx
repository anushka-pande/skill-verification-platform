import axios from "axios"
import toast from "react-hot-toast"
import { FiUser } from "react-icons/fi"
import { MdOutlineWork } from "react-icons/md"

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
    <div className="page-shell flex items-center justify-center text-main">
      <div className="glass p-10 rounded-2xl shadow-xl w-[430px] text-center">

        <h1 className="text-3xl font-bold text-accent mb-3">
          Select Your Role
        </h1>

        <p className="subtle mb-8">
          Choose how you want to continue
        </p>

        <button
          onClick={() => chooseRole("candidate")}
          className="w-full btn-primary p-3 rounded-xl mb-4 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-200"
        >
          <FiUser className="text-[var(--icon)] opacity-90 text-lg" />
          Candidate
        </button>

        <button
          onClick={() => chooseRole("recruiter")}
          className="w-full btn-accent p-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-200"
        >
          <MdOutlineWork className="text-[var(--icon)] opacity-90 text-lg" />
          Recruiter
        </button>

      </div>
    </div>
  )
}

export default ChooseRole