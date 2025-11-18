'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface StudentDashboardHeaderProps {
  studentName: string
}

export function StudentDashboardHeader({ studentName }: StudentDashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('student_id')
    localStorage.removeItem('student_name')
    router.push('/')
  }

  return (
    <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
      <h1 className="text-2xl font-bold">Welcome, {studentName}</h1>
      <Button variant="outline" onClick={handleLogout} className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
        Logout
      </Button>
    </div>
  )
}
