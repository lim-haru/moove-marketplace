"use client"

import { useEffect, useState } from "react"

interface CountdownProps {
  targetTimestamp: bigint
  size?: "small" | "large"
}

export default function Countdown({ targetTimestamp, size = "large" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = BigInt(Math.round(Date.now() / 1000))
      const distance = Number(targetTimestamp - now)

      if (distance > 0) {
        const days = Math.floor(distance / (60 * 60 * 24))
        const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60))
        const minutes = Math.floor((distance % (60 * 60)) / 60)
        const seconds = Math.floor(distance % 60)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTimestamp])

  const textSize = size === "large" ? "text-3xl" : "text-sm"
  const labelSize = size === "large" ? "text-sm" : "text-xs"
  const boxWidth = size === "large" ? "w-12" : "w-8"

  const endTextCountdown =
    timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds <= 30 && "text-red-500"

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <div className="flex flex-col items-center">
          <div className={`${textSize} font-bold ${boxWidth} text-center`}>{String(timeLeft.days).padStart(2, "0")}</div>
          <span className={`${labelSize} text-gray-500`}>Days</span>
        </div>
        <span className={textSize}>:</span>
        <div className="flex flex-col items-center">
          <div className={`${textSize} font-bold ${boxWidth} text-center`}>{String(timeLeft.hours).padStart(2, "0")}</div>
          <span className={`${labelSize} text-gray-500`}>Hours</span>
        </div>
        <span className={textSize}>:</span>
        <div className="flex flex-col items-center">
          <div className={`${textSize} font-bold ${boxWidth} text-center`}>{String(timeLeft.minutes).padStart(2, "0")}</div>
          <span className={`${labelSize} text-gray-500`}>Minutes</span>
        </div>
        {size === "large" && (
          <>
            <span className={textSize}>:</span>
            <div className="flex flex-col items-center">
              <div className={`${textSize} font-bold ${boxWidth} text-center ${endTextCountdown}`}>
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <span className={`${labelSize} text-gray-500`}>Seconds</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
