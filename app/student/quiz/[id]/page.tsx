'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { QuizTimer } from '@/components/quiz-timer'
import { QuestionDisplay } from '@/components/question-display'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  display_order: number
}

interface Option {
  id: string
  option_text: string
  display_order: number
  question_id: string
}

interface Quiz {
  id: string
  title: string
  time_limit_minutes: number
  passing_score: number
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const supabase = getSupabaseClient()

  const [studentId, setStudentId] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [options, setOptions] = useState<Record<string, Option[]>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('student_id')
    if (!id) {
      router.push('/')
      return
    }
    setStudentId(id)
    initializeQuiz(id)
  }, [router, quizId])

  const initializeQuiz = async (studentId: string) => {
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, time_limit_minutes, passing_score')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      // Create attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .insert([
          {
            student_id: studentId,
            quiz_id: quizId,
            status: 'in_progress',
          },
        ])
        .select()
        .single()

      if (attemptError) throw attemptError
      setAttemptId(attemptData.id)

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_text, display_order')
        .eq('quiz_id', quizId)
        .order('display_order')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])

      // Fetch options for all questions
      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('id, option_text, display_order, question_id')
        .in(
          'question_id',
          questionsData?.map((q) => q.id) || []
        )
        .order('display_order')

      if (optionsError) throw optionsError

      // Group options by question
      const optionsByQuestion: Record<string, Option[]> = {}
      optionsData?.forEach((opt) => {
        if (!optionsByQuestion[opt.question_id]) {
          optionsByQuestion[opt.question_id] = []
        }
        optionsByQuestion[opt.question_id].push(opt)
      })
      setOptions(optionsByQuestion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (optionId: string) => {
    const currentQuestion = questions[currentQuestionIndex]
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleTimeUp = () => {
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (!attemptId || !studentId) return

    setSubmitting(true)
    try {
      let correctCount = 0

      // Save all answers and calculate score
      for (const questionId of Object.keys(answers)) {
        const selectedOptionId = answers[questionId]

        // Check if answer is correct
        const { data: optionData, error: optionError } = await supabase
          .from('options')
          .select('is_correct')
          .eq('id', selectedOptionId)
          .single()

        if (optionError) throw optionError

        if (optionData.is_correct) {
          correctCount++
        }

        // Save student answer
        const { error: answerError } = await supabase.from('student_answers').insert([
          {
            attempt_id: attemptId,
            question_id: questionId,
            selected_option_id: selectedOptionId,
            is_correct: optionData.is_correct,
          },
        ])

        if (answerError) throw answerError
      }

      // Calculate score
      const totalQuestions = questions.length
      const percentageScore = Math.round((correctCount / totalQuestions) * 100)

      // Update attempt with score
      const { error: updateError } = await supabase
        .from('attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          score: correctCount,
          total_points: totalQuestions,
          percentage_score: percentageScore,
        })
        .eq('id', attemptId)

      if (updateError) throw updateError

      // Redirect to results
      router.push(`/student/results/${attemptId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-destructive mb-4">{error || 'Quiz not found'}</p>
          <Button onClick={() => router.push('/student/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const selectedAnswer = answers[currentQuestion.id] || null

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground">Progress: {currentQuestionIndex + 1} of {questions.length}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <QuizTimer totalMinutes={quiz.time_limit_minutes} onTimeUp={handleTimeUp} />
          </div>

          <div className="lg:col-span-3">
            <QuestionDisplay
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              questionText={currentQuestion.question_text}
              options={options[currentQuestion.id] || []}
              selectedAnswer={selectedAnswer}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        </div>

        {error && <Card className="bg-destructive/10 border-destructive/20 p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </Card>}

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
