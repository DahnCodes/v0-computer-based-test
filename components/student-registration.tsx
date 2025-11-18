'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface Class {
  id: string
  name: string
}

interface StudentRegistrationProps {
  classes: Class[]
}

export function StudentRegistration({ classes }: StudentRegistrationProps) {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [school, setSchool] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!name || !selectedClass) {
        throw new Error('Please fill in all required fields')
      }

      const supabase = getSupabaseClient()

      const { data, error: registerError } = await supabase
        .from('students')
        .insert([
          {
            name: name.trim(),
            class_id: selectedClass,
            school: school.trim() || null,
          },
        ])
        .select()

      if (registerError) {
        console.log('[v0] Registration error:', registerError)
        throw registerError
      }

      if (data && data.length > 0) {
        localStorage.setItem('student_id', data[0].id)
        localStorage.setItem('student_name', data[0].name)
        router.push('/student/dashboard')
      } else {
        throw new Error('No data returned from registration')
      }
    } catch (err) {
      console.log('[v0] Registration failed:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
        <CardDescription>Enter your details to access the test</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
             School *
            </label>
            <Input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Enter your school"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="class" className="block text-sm font-medium mb-1">
              Class *
            </label>
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={loading}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register & Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
