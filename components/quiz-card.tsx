import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock } from 'lucide-react'

interface QuizCardProps {
  id: string
  title: string
  description?: string
  timeLimit: number
  passingScore: number
}

export function QuizCard({ id, title, description, timeLimit, passingScore }: QuizCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{timeLimit} minutes</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">Passing Score:</span> {passingScore}%
        </div>
        <Link href={`/student/quiz/${id}`} className="block">
          <Button className="w-full">Start Quiz</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
