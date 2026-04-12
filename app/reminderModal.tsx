'use client'
import { createClient } from "@/lib/supabase/client"
import { ReminderRow } from "@/app/reminderPanel"
import { useState } from "react"

type Props = {
  reminder: ReminderRow          // ReminderRow should no longer have `person`
  recipientEmails: string[]      // pass these in from the parent
  onClose: () => void
}

export default function ReminderModal({ reminder, recipientEmails, onClose }: Props) {
  const [name, setName] = useState(reminder.name)
  const [description, setDesc] = useState(reminder.description ?? "")
  const [remindAt, setRemindAt] = useState(reminder.remind_at)
  const [emailsInput, setEmailsInput] = useState(recipientEmails.join(", "))

  const formattedDate = reminder.remind_at
    ? new Date(reminder.remind_at).toLocaleDateString("en-US", {
        month: "long", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null

  const handleSubmit = async () => {
    const client = createClient()
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) { console.log("Invalid User"); return }

    const updatedEmails = emailsInput
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0)

    const res = await fetch("/api/reminders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: reminder.id,
        name,
        description,
        remind_at: remindAt,
        recipientEmails: updatedEmails,
      }),
    })

    if (res.ok) { onClose() }
    else { console.log("ERROR!") }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p className="modal-reminder-name">{reminder.name}</p>
          <p className="modal-reminder-time">{formattedDate}</p>
        </div>
        <hr className="modal-divider" />
        <div className="modal-body">
          <label className="modal-label">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label className="modal-label">Notes</label>
          <textarea
            defaultValue={description}
            placeholder="Add a description..."
            rows={4}
            onChange={(e) => setDesc(e.target.value)}
          />

          <label className="modal-label">Recipients (comma separated)</label>
          <input
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn-submit" onClick={handleSubmit}>Save changes</button>
        </div>
      </div>
    </div>
  )
}