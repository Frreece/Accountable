'use client'
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Reminder() {
  const [person, setPerson] = useState("")
  const [name, setName] = useState("")
  const [description, setDesc] = useState("")
  const [remindAt, setRemindAt] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || data.user == null) {
      console.log("Not signed in")
      setStatus("error")
      return
    }

    const res = await fetch("/api/website_submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person, name, description, remindAt }),
    })

    if (res.ok) {
      setStatus("success")
      setPerson("")
      setName("")
      setDesc("")
      setRemindAt("")
      setTimeout(() => setStatus("idle"), 2500)
    } else {
      setStatus("error")
    }
  }

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <input
        placeholder="Who will hold you accountable?"
        value={person}
        required
        onChange={(e) => setPerson(e.target.value)}
      />
      <input
        placeholder="Reminder name"
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDesc(e.target.value)}
      />
      <input
        placeholder="When to remind you?"
        value={remindAt}
        required
        onChange={(e) => setRemindAt(e.target.value)}
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Saving…" : status === "success" ? "Saved!" : "Set reminder"}
      </button>
      {status === "error" && (
        <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "6px" }}>
          Something went wrong — are you signed in?
        </p>
      )}
    </form>
  )
}