'use client'
import "./globals.css"
import Navbar from "./nav"
import Reminder from "./reminder"
import ReminderPanel from "./reminderPanel"

export default function RootLayout() {
  return (
    <html lang="en">
      <body>

        <nav className="site-nav">
          <Navbar />
        </nav>

        <div className="hero">
          <h1>Stay on track.<br />With a little help.</h1>
          <p>
            Set reminders, invite others to hold you accountable,
            and actually follow through.
          </p>
          <div className="hero-pills">
            <span className="hero-pill">Set reminders</span>
            <span className="hero-pill">Invite accountability partners</span>
            <span className="hero-pill">Track progress</span>
          </div>
        </div>

        <main className="app-grid">

          <div className="card">
            <p className="card-label">New reminder</p>
            <Reminder />
          </div>

          <div className="card">
            <p className="card-label">Your reminders</p>
            <ReminderPanel />
          </div>
        </main>

      </body>
    </html>
  )
}