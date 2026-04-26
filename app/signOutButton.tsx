'use client'
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

type Status = 'idle' | 'success' | 'already_signed_out' | 'error'

export default function SignOutButton() {
    const [status, setStatus] = useState<Status>('idle')
    
    const signOut = async () => {
        setStatus('idle')
        const supabase = createClient()

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            setStatus('already_signed_out')
            return
        }

        const { error } = await supabase.auth.signOut()

        if (error) {
            setStatus('error')
            return
        }

        setStatus('success')
    }

    const messages: Record<Status, { text: string; color: string } | null> = {
        idle: null,
        success: { text: "You have been signed out successfully.", color: "green" },
        already_signed_out: { text: "You are already signed out.", color: "blue" },
        error: { text: "Could not sign out. Please try again.", color: "red" },
    }

    const message = messages[status]

    return (
        <div>
            <h2>Are you sure you want to sign out?</h2>
            {message && <p style={{ color: message.color }}>{message.text}</p>}
            <button onClick={signOut}>
                Sign Out
            </button>
        </div>
    )
}