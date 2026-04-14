'use client'
import "./globals.css"
import Navbar from "./nav"
import Reminder from "./reminder"
import ReminderPanel from "./reminderPanel"
import SignUpForm from "./signUpForm"
import SignInForm from "./signInForm"
import { Analytics } from '@vercel/analytics/next'

export default function RootLayout() {
  return (
    <html lang="en">
      <body>

        <nav className="site-nav">
          <span className="site-nav-logo">Accountable</span>
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

          <div className="auth-row">
            <div className="auth-half">
              <p className="card-label">Sign up</p>
              <SignUpForm />
            </div>
            <div className="auth-half">
              <p className="card-label">Sign in</p>
              <SignInForm />
            </div>
          </div>

        </main>

        <Analytics />
      </body>
    </html>
  )
}