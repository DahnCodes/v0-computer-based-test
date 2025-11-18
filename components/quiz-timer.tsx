'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

interface QuizTimerProps {
  totalMinutes: number
  onTimeUp: () => void
}

export function QuizTimer({ totalMinutes, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalMinutes * 60)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        setIsWarning(newTime <= 300) // Warning at 5 minutes
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Card
      className={`p-4 text-center font-mono text-lg font-bold ${
        isWarning ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
      }`}
    >
      <div className="text-sm font-normal text-muted-foreground mb-1">Time Left</div>
      <div>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </Card>
  )
}
