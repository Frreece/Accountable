'use client'
type ButtonProps = {
    onClick: () => void
}

export default function Button({onClick} : ButtonProps) {
    
    return (
        <button onClick={onClick}>
            Click here if you'd like new task
        </button>

    )
}