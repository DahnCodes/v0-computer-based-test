'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface QuizFormProps {
  classId: string
  onSubmit: (quiz: {
    title: string
    description: string
    time_limit_minutes: number
    passing_score: number
  }) => Promise<void>
  isLoading: boolean
}

export function QuizForm({ classId, onSubmit, isLoading }: QuizFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState('60')
  const [passingScore, setPassingScore] = useState('50')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      title,
      description,
      time_limit_minutes: parseInt(timeLimit),
      passing_score: parseInt(passingScore),
    })
    setTitle('')
    setDescription('')
    setTimeLimit('60')
    setPassingScore('50')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Quiz Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Math Final Exam"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quiz description"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium mb-1">
                Time Limit (minutes)
              </label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                disabled={isLoading}
                min="1"
              />
            </div>

            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium mb-1">
                Passing Score (%)
              </label>
              <Input
                id="passingScore"
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                disabled={isLoading}
                min="0"
                max="100"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Quiz'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
