import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET() {
    const client = await createClient()
    const {data: userData, error: userError} = await client.auth.getUser();
    if (userError) {
      return NextResponse.json( {
        error: "User not signed in"},
        {status: 401}

      )
    }
    if (!userData.user) {
      return NextResponse.json( {
        error: "User not found"},
        {status: 500}
      )
    }
    const { data, error} = await client
    .from('website_submissions')
    .select('person, name, description, remind_at')
    .eq('user_id', userData.user.id);

    if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
}


export async function POST(req: Request) {
    const body = await req.json();
    const client = await createClient()
    const {person, name, description, remindAt } = body;
    const {data : clientData, error: userError} = await client.auth.getUser();
    if (userError) {
      return NextResponse.json({
        error: "Authentication Error"},
        {status : 401

      })
    }
    if (!person || !name || !remindAt || !clientData.user.id) {
        return NextResponse.json({
            error: "Missing required fields"},
            { status: 400

        })
    }
    const user_id = clientData.user.id;

    const { data, error } = await client
    .from('website_submissions')
    .insert([
      {
        person,
        name,
        description,
        remind_at: remindAt,
        user_id: user_id
      },
    ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}