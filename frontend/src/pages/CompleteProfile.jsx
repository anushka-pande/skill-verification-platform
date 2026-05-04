import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

function CompleteProfile({ setPage }) {
  const role = sessionStorage.getItem("role")
  const user_id = sessionStorage.getItem("user_id")

  const [form, setForm] = useState({
    skills: "",
    company_name: "",
    company_domain: "",
    company_location: "",
    recruiter_role: ""
  })

  const handleSubmit = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/complete-profile", {
        user_id,
        ...form
      })

      toast.success("Profile completed")

      if (role === "recruiter") {
        setPage("recruiter")
      } else {
        setPage("dashboard")
      }

    } catch (err) {
      toast.error("Failed to save profile")
    }
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="glass p-8 rounded-2xl w-[400px]">

        <h2 className="text-xl font-bold text-accent mb-6">
          Complete Profile
        </h2>

        {role === "candidate" && (
          <>
            <input
              placeholder="Enter your skills (comma separated)"
              className="w-full themed-input p-3 mb-4"
              onChange={(e) => setForm({
                ...form,
                skills: e.target.value
              })}
            />
          </>
        )}

        {role === "recruiter" && (
          <>
            <input placeholder="Company Name"
              className="w-full themed-input p-3 mb-3"
              onChange={(e) => setForm({...form, company_name: e.target.value})}
            />

            <input placeholder="Domain"
              className="w-full themed-input p-3 mb-3"
              onChange={(e) => setForm({...form, company_domain: e.target.value})}
            />

            <input placeholder="Location"
              className="w-full themed-input p-3 mb-3"
              onChange={(e) => setForm({...form, company_location: e.target.value})}
            />

            <input placeholder="Your Role"
              className="w-full themed-input p-3 mb-4"
              onChange={(e) => setForm({...form, recruiter_role: e.target.value})}
            />
          </>
        )}

        <button
          onClick={handleSubmit}
          className="btn-primary w-full p-3 rounded-lg"
        >
          Save & Continue
        </button>

      </div>
    </div>
  )
}

export default CompleteProfile