'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { AdminHeader } from '@/components/admin-header'
import { AdminNav } from '@/components/admin-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, BookOpen, Users } from 'lucide-react'

interface DashboardStats {
  totalQuizzes: number
  totalStudents: number
  totalAttempts: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [adminEmail, setAdminEmail] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    totalStudents: 0,
    totalAttempts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id')
    const email = localStorage.getItem('admin_email')

    if (!adminId || !email) {
      router.push('/admin')
      return
    }

    setAdminEmail(email)
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const [{ count: quizzes }, { count: students }, { count: attempts }] =
        await Promise.all([
          supabase.from('quizzes').select('*', { count: 'exact', head: true }),
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('attempts').select('*', { count: 'exact', head: true }),
        ])

      setStats({
        totalQuizzes: quizzes || 0,
        totalStudents: students || 0,
        totalAttempts: attempts || 0,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader adminEmail={adminEmail} />

      <div className="flex">
        <AdminNav />

        <main className="flex-1 p-6">
          <h2 className="text-3xl font-bold mb-6">Overview</h2>

          {loading ? (
            <p className="text-muted-foreground">Loading stats...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
