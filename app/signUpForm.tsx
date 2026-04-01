'use client'
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setStatus("loading")

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    console.log(data)
    if (error) {
      console.log(error)
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
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Creating account…" : status === "success" ? "Check your email!" : "Sign up"}
      </button>
      {status === "error" && (
        <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "6px" }}>
          Something went wrong. Try again.
        </p>
      )}
    </form>
  )
}