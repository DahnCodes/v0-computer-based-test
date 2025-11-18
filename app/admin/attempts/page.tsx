'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { AdminHeader } from '@/components/admin-header'
import { AdminNav } from '@/components/admin-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Attempt {
  id: string
  students?: { name: string }
  quizzes?: { title: string; passing_score: number }
  percentage_score: number
  status: string
  submitted_at: string
}

export default function AttemptsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [adminEmail, setAdminEmail] = useState('')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id')
    const email = localStorage.getItem('admin_email')

    if (!adminId || !email) {
      router.push('/admin')
      return
    }

    setAdminEmail(email)
    fetchAttempts()
  }, [router])

  const fetchAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('attempts')
        .select(
          `
          id,
          percentage_score,
          status,
          submitted_at,
          students(name),
          quizzes(title, passing_score)
        `
        )
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setAttempts(data || [])
    } catch (err) {
      console.error('Error fetching attempts:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPassed = (attempt: Attempt) => {
    return attempt.percentage_score >= (attempt.quizzes?.passing_score || 50)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader adminEmail={adminEmail} />

      <div className="flex">
        <AdminNav />

        <main className="flex-1 p-6">
          <h2 className="text-3xl font-bold mb-6">Quiz Attempts</h2>

          <Card>
            <CardHeader>
              <CardTitle>All Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading attempts...</p>
              ) : attempts.length === 0 ? (
                <p className="text-muted-foreground">No quiz attempts yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium">Student</th>
                        <th className="text-left py-2 px-4 font-medium">Quiz</th>
                        <th className="text-left py-2 px-4 font-medium">Score</th>
                        <th className="text-left py-2 px-4 font-medium">Status</th>
                        <th className="text-left py-2 px-4 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((attempt) => (
                        <tr key={attempt.id} className="border-b hover:bg-secondary/50">
                          <td className="py-3 px-4">{attempt.students?.name}</td>
                          <td className="py-3 px-4">{attempt.quizzes?.title}</td>
                          <td className="py-3 px-4 font-semibold">
                            {attempt.percentage_score}%
                          </td>
                          <td className="py-3 px-4">
                            {getPassed(attempt) ? (
                              <Badge className="bg-green-500">Passed</Badge>
                            ) : (
                              <Badge variant="secondary">Failed</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {attempt.submitted_at
                              ? new Date(attempt.submitted_at).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
