'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Attempt {
  id: string
  score: number
  total_points: number
  percentage_score: number
  submitted_at: string
  quiz?: {
    title: string
    passing_score: number
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const attemptId = params.id as string
  const supabase = getSupabaseClient()

  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const studentId = localStorage.getItem('student_id')
    if (!studentId) {
      router.push('/')
      return
    }

    fetchResults()
  }, [router, attemptId])

  const fetchResults = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('attempts')
        .select(
          `
          id,
          score,
          total_points,
          percentage_score,
          submitted_at,
          quizzes(title, passing_score)
        `
        )
        .eq('id', attemptId)
        .single()

      if (fetchError) throw fetchError
      setAttempt(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-destructive mb-4">{error || 'Results not found'}</p>
          <Button onClick={() => router.push('/student/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    )
  }

  const passed =
    attempt.percentage_score >= (attempt.quiz?.passing_score || 50)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations!' : 'Quiz Completed'}
          </CardTitle>
          <CardDescription>
            {attempt.quiz?.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Score:</span>
              <span className="font-bold text-lg">
                {attempt.score}/{attempt.total_points}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-bold text-lg">{attempt.percentage_score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Passing Score:</span>
              <span className="font-bold">{attempt.quiz?.passing_score}%</span>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              {passed
                ? 'You have successfully passed this quiz!'
                : 'You did not meet the passing score. You can retake the quiz if allowed.'}
            </p>
          </div>

          <Button
            onClick={() => router.push('/student/dashboard')}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
