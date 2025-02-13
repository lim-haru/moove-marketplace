"use client"

import { useEffect, useState } from "react"

export default function Countdown({ targetTimestamp }: { targetTimestamp: bigint }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = BigInt(Date.now())
      const distance = Number(targetTimestamp - now)

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        clearInterval(interval)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTimestamp])

  return (
    <div className="flex gap-1 pr-2">
      <div className="text-3xl font-bold w-10 text-center">{String(timeLeft.hours).padStart(2, "0")}</div>
      <span className="text-3xl font-bold">:</span>
      <div className="text-3xl font-bold w-10 text-center">{String(timeLeft.minutes).padStart(2, "0")}</div>
      <span className="text-3xl font-bold">:</span>
      <div className="text-3xl font-bold w-10 text-center">{String(timeLeft.seconds).padStart(2, "0")}</div>
    </div>
  )
}
