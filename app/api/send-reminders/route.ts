import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  // Protect the route so only your cron job can call it
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await createClient()

  // Fetch reminders due in the past minute that haven't been sent yet
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

  const { data: reminders, error } = await client
    .from("reminders")
    .select(`
      *,
      reminder_recipients ( recipient_email )
    `)
    .eq("sent", false)
    .lte("remind_at", now.toISOString())
    .gte("remind_at", oneMinuteAgo.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Send emails and mark reminders as sent
  for (const reminder of reminders) {
    const emails = reminder.reminder_recipients.map((r: any) => r.recipient_email)

    await resend.emails.send({
      from: "reminders@yourdomain.com",
      to: emails,
      subject: `Reminder: ${reminder.name}`,
      html: `
        <h2>${reminder.name}</h2>
        ${reminder.description ? `<p>${reminder.description}</p>` : ""}
        <p>This reminder was set for ${new Date(reminder.remind_at).toLocaleString()}</p>
      `,
    })

    // Mark as sent so it doesn't fire again
    await client
      .from("reminders")
      .update({ sent: true })
      .eq("id", reminder.id)
  }

  return NextResponse.json({ sent: reminders.length })
}