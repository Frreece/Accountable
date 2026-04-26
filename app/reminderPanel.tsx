'use client'
import { useState } from "react"
import ReminderModal from "./reminderModal"

export type ReminderRow = {
  id: string
  creator_user_id: string
  name: string
  description: string | null
  remind_at: string
  reminder_recipients?: { recipient_email: string; status: string }[]
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

  const recipients = reminder.reminder_recipients
    ?.map(r => r.recipient_email)
    .join(", ")

  return (
    <div className="reminder-item">
      <div className="reminder-dot" />
      <div className="reminder-item-body">
        <span className="reminder-item-name">{reminder.name}</span>
        {recipients && (
          <span className="reminder-item-person">with {recipients}</span>
        )}
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
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true)
    setError(null);
    try {
    const req = await fetch("/api/reminders", { method: "GET" })
    const res = await req.json()

    if (!req.ok) {
      if (req.status === 401) {
        setError("You aren't signed in. Please sign in to view your reminders.")
        } else {
          setError(res.error ?? "Something went wrong while loading reminders.")
        }

        setReminders([])
        setLoaded(true)
        return
      }

      setReminders(res.reminders ?? [])
      setLoaded(true)
    } catch (err) {
      console.log(err)
      setError("Could not connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  const onClose = () => setSelectedReminder(null);

  return (
    <div>
      <button className="reminder-panel-trigger" onClick={handleClick}>
        {loaded ? "Refresh reminders" : "Load reminders"}
      </button>

      {loading && <p className="reminder-loading">Loading…</p>}
      {error && <p>{error}</p>}

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
          {selectedReminder != null && (
            <ReminderModal
              reminder={selectedReminder}
              recipientEmails={
                selectedReminder.reminder_recipients?.map(r => r.recipient_email) ?? []
              }
              onClose={onClose}
            />
          )}
        </div>
      )}

    </div>
  )
}