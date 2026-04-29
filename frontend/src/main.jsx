import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "react-hot-toast"
import './index.css'
import App from './App.jsx'

const theme = sessionStorage.getItem("theme")

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background:
            theme === "light"
              ? "rgba(255,255,255,0.92)"
              : "rgba(30,41,59,0.88)",

          color:
            theme === "light"
              ? "#111827"
              : "#ffffff",

          border:
            theme === "light"
              ? "1px solid rgba(15,23,42,0.08)"
              : "1px solid #334155",

          borderRadius: "14px",
          padding: "12px 16px",
          backdropFilter: "blur(14px)",
          boxShadow:
            theme === "light"
              ? "0 10px 25px rgba(15,23,42,0.08)"
              : "0 10px 25px rgba(0,0,0,0.25)"
        },

        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff"
          }
        },

        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff"
          }
        }
      }}
    />
  </StrictMode>
)