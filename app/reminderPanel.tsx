'use client'
import { useState } from "react"
import ReminderModal from "./reminderModal"

export type ReminderRow = {
  id: string
  person: string
  name: string
  description: string | null
  remind_at: string
}

function ReminderItem({ reminder }: { reminder: ReminderRow }) {
  const formattedDate = reminder.remind_at
    ? new Date(reminder.remind_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null

  return (
    <div className="reminder-item">
      <div className="reminder-dot" />
      <div className="reminder-item-body">
        <span className="reminder-item-name">{reminder.name}</span>
        <span className="reminder-item-person">with {reminder.person}</span>
      </div>
      {formattedDate && (
        <span className="reminder-item-time">{formattedDate}</span>
      )}
    </div>
  )
}

export default function ReminderPanel() {
  const [reminders, setReminders] = useState<ReminderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<ReminderRow | null>(null);

  const handleClick = async () => {
    setLoading(true)
    const req = await fetch("/api/website_submissions", { method: "GET" })
    const res = await req.json()
    setReminders(res.data)
    setLoading(false)
    setLoaded(true)
  }

  const onClose = () => setSelectedReminder(null);

  return (
    <div>
      <button className="reminder-panel-trigger" onClick={handleClick}>
        {loaded ? "Refresh reminders" : "Load reminders"}
      </button>

      {loading && <p className="reminder-loading">Loading…</p>}

      {loaded && !loading && reminders.length === 0 && (
        <p className="reminder-empty">No reminders yet.</p>
      )}

      {!loading && reminders.length > 0 && (
        <div className="reminder-list">
          {reminders.map((reminder) => (
            <div key = {reminder.id} onClick={ () => reminder === null ? console.log("No Reminders") : setSelectedReminder(reminder)}>
                <ReminderItem key={reminder.name} reminder={reminder} />
            </div>
          ))}
          {selectedReminder != null && (<ReminderModal reminder = {selectedReminder} onClose={onClose} />)}
        </div>
      )}

    </div>
  )
}