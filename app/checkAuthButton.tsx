'use client'
import { createClient } from "@/lib/supabase/client"

export default function CheckAuthButton() {
  const handleCheckAuth = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error(error)
      return
    }

    if (data.user) {
      console.log("Logged in:", data.user)
    } else {
      console.log("Not logged in")
    }
  }

  return (
    <button onClick={handleCheckAuth}>
      Check Auth
    </button>
  )
}