'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { AdminHeader } from '@/components/admin-header'
import { AdminNav } from '@/components/admin-nav'
import { QuizForm } from '@/components/quiz-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Eye } from 'lucide-react'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  description: string
  time_limit_minutes: number
  passing_score: number
  is_published: boolean
  class_id: string
  classes?: { name: string }
}

interface Class {
  id: string
  name: string
}

export default function QuizzesPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [adminEmail, setAdminEmail] = useState('')
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id')
    const email = localStorage.getItem('admin_email')

    if (!adminId || !email) {
      router.push('/admin')
      return
    }

    setAdminEmail(email)
    fetchClasses()
  }, [router])

  useEffect(() => {
    if (selectedClass) {
      fetchQuizzes(selectedClass)
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name')

      if (error) throw error
      setClasses(data || [])
      if (data && data.length > 0) {
        setSelectedClass(data[0].id)
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizzes = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description, time_limit_minutes, passing_score, is_published, class_id, classes(name)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuizzes(data || [])
    } catch (err) {
      console.error('Error fetching quizzes:', err)
    }
  }

  const handleCreateQuiz = async (quiz: {
    title: string
    description: string
    time_limit_minutes: number
    passing_score: number
  }) => {
    setCreating(true)
    try {
      const { error } = await supabase.from('quizzes').insert([
        {
          ...quiz,
          class_id: selectedClass,
          is_published: false,
        },
      ])

      if (error) throw error
      await fetchQuizzes(selectedClass)
    } catch (err) {
      console.error('Error creating quiz:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        const { error } = await supabase.from('quizzes').delete().eq('id', quizId)

        if (error) throw error
        await fetchQuizzes(selectedClass)
      } catch (err) {
        console.error('Error deleting quiz:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader adminEmail={adminEmail} />

      <div className="flex">
        <AdminNav />

        <main className="flex-1 p-6">
          <h2 className="text-3xl font-bold mb-6">Quiz Management</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quizzes for {classes.find(c => c.id === selectedClass)?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading quizzes...</p>
                  ) : quizzes.length === 0 ? (
                    <p className="text-muted-foreground">No quizzes created yet</p>
                  ) : (
                    <div className="space-y-3">
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-4 border rounded-lg flex items-start justify-between hover:bg-secondary/50"
                        >
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{quiz.title}</div>
                            <p className="text-sm text-muted-foreground mb-2">{quiz.description}</p>
                            <div className="flex gap-2 items-center text-xs">
                              <span className="text-muted-foreground">{quiz.time_limit_minutes}m</span>
                              <span className="text-muted-foreground">Pass: {quiz.passing_score}%</span>
                              {quiz.is_published && <Badge variant="default">Published</Badge>}
                              {!quiz.is_published && <Badge variant="secondary">Draft</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/admin/quizzes/${quiz.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Select Class</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls.id)}
                        className={`w-full p-2 text-left rounded-lg transition-colors ${
                          selectedClass === cls.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedClass && (
                <QuizForm
                  classId={selectedClass}
                  onSubmit={handleCreateQuiz}
                  isLoading={creating}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
