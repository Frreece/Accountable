import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, remind_at, recipientEmails } = body;

  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
  return NextResponse.json({ error: userError.message, code: userError.code }, { status: 500 })
}

  if (!userData.user) {
    return NextResponse.json(
      { error: "User not signed in" },
      { status: 401 }
    );
  }

  if (!name || !remind_at) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const creatorId = userData.user.id;
  const creatorEmail = userData.user.email;

  if (!creatorEmail) {
    return NextResponse.json(
      { error: "Creator email not found" },
      { status: 400 }
    );
  }

  const { data: reminder, error: reminderError } = await client
    .from("reminders")
    .insert([
      {
        creator_user_id: creatorId,
        name,
        description,
        remind_at,
      },
    ])
    .select()
    .single();

  if (reminderError) {
    return NextResponse.json(
      { error: reminderError.message },
      { status: 500 }
    );
  }

  const cleanedEmails =
    Array.isArray(recipientEmails)
      ? recipientEmails
          .map((email: string) => email.trim().toLowerCase())
          .filter((email: string) => email.length > 0 && email !== creatorEmail.toLowerCase())
      : [];

  const recipientRows = [
    {
      reminder_id: reminder.id,
      recipient_email: creatorEmail.toLowerCase(),
      recipient_user_id: creatorId,
      status: "creator_auto",
    },
    ...cleanedEmails.map((email: string) => ({
      reminder_id: reminder.id,
      recipient_email: email,
      recipient_user_id: null,
      status: "pending",
    })),
  ];

  const { data: recipients, error: recipientsError } = await client
    .from("reminder_recipients")
    .insert(recipientRows)
    .select();

  if (recipientsError) {
    return NextResponse.json(
      { error: recipientsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    reminder,
    recipients,
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, name, description, remind_at, recipientEmails } = body;

  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!id || !name || !remind_at) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Update the reminder row — only the creator should be able to do this
  const { error: updateError } = await client
    .from("reminders")
    .update({ name, description, remind_at })
    .eq("id", id)
    .eq("creator_user_id", userData.user.id); // security: only owner can edit

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Replace non-creator recipients
  // First, delete all pending recipients for this reminder
  const { error: deleteError } = await client
    .from("reminder_recipients")
    .delete()
    .eq("reminder_id", id)
    .eq("status", "pending");

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Re-insert the updated recipient list (excluding the creator who stays as-is)
  const creatorEmail = userData.user.email!.toLowerCase();
  const newRecipients = (recipientEmails as string[])
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0 && e !== creatorEmail)
    .map(email => ({
      reminder_id: id,
      recipient_email: email,
      recipient_user_id: null,
      status: "pending",
    }));

  if (newRecipients.length > 0) {
    const { error: insertError } = await client
      .from("reminder_recipients")
      .insert(newRecipients);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get all reminder IDs this user is a recipient of
  const { data: myLinks, error: linkError } = await client
    .from("reminder_recipients")
    .select("reminder_id")
    .eq("recipient_user_id", userData.user.id);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  const reminderIds = myLinks.map(r => r.reminder_id);

  if (reminderIds.length === 0) return NextResponse.json({ reminders: [] });

  // Fetch those reminders with their full recipient lists
  const { data: reminders, error: remindersError } = await client
    .from("reminders")
    .select(`
      *,
      reminder_recipients ( recipient_email, status )
    `)
    .in("id", reminderIds)
    .order("remind_at", { ascending: true });

  if (remindersError) {
    return NextResponse.json({ error: remindersError.message }, { status: 500 });
  }

  return NextResponse.json({ reminders });
}