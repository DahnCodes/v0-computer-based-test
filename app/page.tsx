import { getSupabaseServer } from '@/lib/supabase-server'
import { StudentRegistration } from '@/components/student-registration'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await getSupabaseServer()

  // Fetch available classes
  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Error fetching classes:', error)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Tech-Up The Learner CBT Exam</h1>
          <p className="text-muted-foreground">
            Welcome! Please register to access your assigned quizzes.
          </p>
        </div>
        <StudentRegistration classes={classes || []} />
      </div>
    </main>
  )
}
