'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { StudentDashboardHeader } from '@/components/student-dashboard-header'
import { QuizCard } from '@/components/quiz-card'
import { Card } from '@/components/ui/card'

interface Quiz {
  id: string
  title: string
  description: string
  time_limit_minutes: number
  passing_score: number
}

export default function StudentDashboard() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('student_id')
    const name = localStorage.getItem('student_name')

    if (!id) {
      router.push('/')
      return
    }

    setStudentId(id)
    setStudentName(name || '')
    fetchQuizzes(id)
  }, [router])

  const fetchQuizzes = async (studentId: string) => {
    try {
      // Get student's class
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('class_id')
        .eq('id', studentId)
        .single()

      if (studentError) throw studentError

      // Get published quizzes for the class
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title, description, time_limit_minutes, passing_score')
        .eq('class_id', student.class_id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (quizzesError) throw quizzesError

      setQuizzes(quizzes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentDashboardHeader studentName={studentName} />
        <div className="p-6 text-center">Loading quizzes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentDashboardHeader studentName={studentName} />

      <main className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Available Quizzes</h2>

        {error && (
          <Card className="bg-destructive/10 border-destructive/20 p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {quizzes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No quizzes available at this time.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                id={quiz.id}
                title={quiz.title}
                description={quiz.description}
                timeLimit={quiz.time_limit_minutes}
                passingScore={quiz.passing_score}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
