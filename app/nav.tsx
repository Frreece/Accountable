'use client'
import { useState } from "react"
import SignUpForm from "./signUpForm"
import SignInForm from "./signInForm"
import SignOutButton from "./signOutButton"

type AuthMode = "signup" | "signin" | "signout"
const labels: Record<AuthMode, string> = {
  signup: "Sign up",
  signin: "Sign in",
  signout: "Sign out",
}

export default function Navbar() {
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<"signup" | "signin" | "signout">("signup")


  return (
    <>
      <div className="Navbard">
        <span className="site-nav-logo">Accountable</span>
        <button className="nav-auth-btn" onClick={() => setModalOpen(true)}>
          Sign in
        </button>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="auth-toggle">
                {(["signup", "signin", "signout"] as const).map((m) => (
                  <button
                    key={m}
                    className={`auth-toggle-btn${mode === m ? " active" : ""}`}
                    onClick={() => setMode(m)}
                  >
                    {labels[m]}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-body">
              {mode === "signup" && <SignUpForm/>}
              {mode === "signin" && <SignInForm/>}
              {mode === "signout" && <SignOutButton/>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}