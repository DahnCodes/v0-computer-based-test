'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { AdminHeader } from '@/components/admin-header'
import { AdminNav } from '@/components/admin-nav'
import { QuestionForm } from '@/components/question-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  description: string
  is_published: boolean
}

interface Question {
  id: string
  question_text: string
  display_order: number
}

interface Option {
  id: string
  option_text: string
  is_correct: boolean
}

export default function QuizEditorPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const supabase = getSupabaseClient()

  const [adminEmail, setAdminEmail] = useState('')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionOptions, setQuestionOptions] = useState<Record<string, Option[]>>({})
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id')
    const email = localStorage.getItem('admin_email')

    if (!adminId || !email) {
      router.push('/admin')
      return
    }

    setAdminEmail(email)
    fetchQuizData()
  }, [router, quizId])

  const fetchQuizData = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, description, is_published')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_text, display_order')
        .eq('quiz_id', quizId)
        .order('display_order')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])

      if (questionsData && questionsData.length > 0) {
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('id, option_text, is_correct, question_id')
          .in(
            'question_id',
            questionsData.map(q => q.id)
          )

        if (optionsError) throw optionsError

        const optionsByQuestion: Record<string, Option[]> = {}
        optionsData?.forEach(opt => {
          if (!optionsByQuestion[opt.question_id]) {
            optionsByQuestion[opt.question_id] = []
          }
          optionsByQuestion[opt.question_id].push({
            id: opt.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
          })
        })
        setQuestionOptions(optionsByQuestion)
      }
    } catch (err) {
      console.error('Error fetching quiz:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (questionData: {
    question_text: string
    options: Array<{ option_text: string; is_correct: boolean }>
  }) => {
    setAdding(true)
    try {
      const { data: newQuestion, error: questionError } = await supabase
        .from('questions')
        .insert([
          {
            quiz_id: quizId,
            question_text: questionData.question_text,
            display_order: questions.length + 1,
          },
        ])
        .select()
        .single()

      if (questionError) throw questionError

      const optionsToInsert = questionData.options.map((opt, index) => ({
        question_id: newQuestion.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        display_order: index + 1,
      }))

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert)

      if (optionsError) throw optionsError

      await fetchQuizData()
    } catch (err) {
      console.error('Error adding question:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        const { error } = await supabase.from('questions').delete().eq('id', questionId)

        if (error) throw error
        await fetchQuizData()
      } catch (err) {
        console.error('Error deleting question:', err)
      }
    }
  }

  const handlePublishQuiz = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question before publishing')
      return
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: true })
        .eq('id', quizId)

      if (error) throw error
      setQuiz(prev => prev ? { ...prev, is_published: true } : null)
    } catch (err) {
      console.error('Error publishing quiz:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader adminEmail={adminEmail} />
        <div className="flex">
          <AdminNav />
          <main className="flex-1 p-6">
            <p className="text-muted-foreground">Loading quiz...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader adminEmail={adminEmail} />
        <div className="flex">
          <AdminNav />
          <main className="flex-1 p-6">
            <p className="text-destructive">Quiz not found</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader adminEmail={adminEmail} />

      <div className="flex">
        <AdminNav />

        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/quizzes">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <h2 className="text-3xl font-bold">{quiz.title}</h2>
                <p className="text-muted-foreground">{questions.length} questions</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!quiz.is_published && (
                <Button onClick={handlePublishQuiz}>
                  <Eye className="w-4 h-4 mr-1" />
                  Publish Quiz
                </Button>
              )}
              {quiz.is_published && <Badge>Published</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{question.question_text}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {questionOptions[question.id]?.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-2 p-2 bg-secondary/50 rounded"
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold ${
                              option.is_correct
                                ? 'bg-green-500 border-green-600 text-white'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {option.is_correct && '✓'}
                          </div>
                          <span className="text-sm">{option.option_text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <QuestionForm onSubmit={handleAddQuestion} isLoading={adding} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
