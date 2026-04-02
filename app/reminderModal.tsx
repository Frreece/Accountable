'use client'
import { createClient } from "@/lib/supabase/client"
import { ReminderRow } from "@/app/reminderPanel"
import { useState } from "react"

type Props = {
  reminder: ReminderRow
  onClose: () => void
}

export default function ReminderModal({ reminder, onClose }: Props) {
    const [person, setPerson] = useState(reminder.person)
    const [name, setName] = useState(reminder.name)
    const [description, setDesc] = useState(reminder.description)
    const [remindAt, setRemindAt] = useState(reminder.remind_at)

  const formattedDate = reminder.remind_at
    ? new Date(reminder.remind_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null

    const handleSubmit = async () => {
        const client = createClient();
        const {data, error} = await client.auth.getUser()
        if (error || data.user == null) {
            console.log("Invalid User")
            return
        }

        const res = await fetch("/api/website_submissions", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({person, name, description, remind_at: remindAt, id: reminder.id})
        })

        if (res.ok) {
            setPerson("")
            setName("")
            setRemindAt("")
            setDesc("")
            onClose()
        } else {
            console.log("ERROR!")
        }
    }

  return (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>

      {/* Header */}
      <div className="modal-header">
        <p className="modal-reminder-name">{reminder.name}</p>
        <p className="modal-reminder-person">with {reminder.person}</p>
        <p className="modal-reminder-time">{formattedDate}</p>
      </div>

      <hr className="modal-divider" />

      {/* Body */}
      <div className="modal-body">
        <label className="modal-label">Notes</label>
        <textarea
          className="modal-textarea"
          defaultValue={reminder.description ?? ""}
          placeholder="Add a description..."
          rows={5}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* Footer */}
      <div className="modal-footer">
        <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="modal-btn modal-btn-submit" onClick={handleSubmit}>Save changes</button>
      </div>

    </div>
  </div>
)
}