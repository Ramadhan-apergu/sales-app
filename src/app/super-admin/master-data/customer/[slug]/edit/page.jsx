'use client'
import { useParams } from "next/navigation"

export default function Detail() {
    const { slug } = useParams()
    return (
        <pre>{slug}</pre>
    )
}