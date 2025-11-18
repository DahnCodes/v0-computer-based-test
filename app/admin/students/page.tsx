'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { AdminHeader } from '@/components/admin-header'
import { AdminNav } from '@/components/admin-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Student {
  id: string
  name: string
  email: string
  classes?: { name: string }
  created_at: string
}

export default function StudentsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [adminEmail, setAdminEmail] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id')
    const email = localStorage.getItem('admin_email')

    if (!adminId || !email) {
      router.push('/admin')
      return
    }

    setAdminEmail(email)
    fetchStudents()
  }, [router])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, classes(name), created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (err) {
      console.error('Error fetching students:', err)
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
          <h2 className="text-3xl font-bold mb-6">Student Management</h2>

          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading students...</p>
              ) : students.length === 0 ? (
                <p className="text-muted-foreground">No students registered yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium">Name</th>
                        <th className="text-left py-2 px-4 font-medium">Email</th>
                        <th className="text-left py-2 px-4 font-medium">Class</th>
                        <th className="text-left py-2 px-4 font-medium">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-secondary/50">
                          <td className="py-3 px-4">{student.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{student.email || '-'}</td>
                          <td className="py-3 px-4">{student.classes?.name}</td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {new Date(student.created_at).toLocaleDateString()}
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
