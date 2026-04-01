'use client'
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setStatus("loading")

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    console.log(error)
    if (error) {
      setStatus("error")
    } else {
      setStatus("success")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Signing in…" : status === "success" ? "Signed in!" : "Sign in"}
      </button>
      {status === "error" && (
        <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "6px" }}>
          Incorrect email or password.
        </p>
      )}
    </form>
  )
}