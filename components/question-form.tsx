'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface Option {
  text: string
  isCorrect: boolean
}

interface QuestionFormProps {
  onSubmit: (question: {
    question_text: string
    options: Array<{ option_text: string; is_correct: boolean }>
  }) => Promise<void>
  isLoading: boolean
}

export function QuestionForm({ onSubmit, isLoading }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<Option[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index].text = text
    setOptions(newOptions)
  }

  const handleCorrectChange = (index: number) => {
    const newOptions = [...options]
    newOptions[index].isCorrect = !newOptions[index].isCorrect
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!questionText || !options.some(o => o.text && o.isCorrect)) {
      alert('Please enter a question and mark at least one correct answer')
      return
    }

    await onSubmit({
      question_text: questionText,
      options: options.map(o => ({
        option_text: o.text,
        is_correct: o.isCorrect,
      })),
    })

    setQuestionText('')
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium mb-2">
              Question Text
            </label>
            <textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question"
              disabled={isLoading}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  disabled={isLoading}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={() => handleCorrectChange(index)}
                    disabled={isLoading}
                    id={`correct-${index}`}
                  />
                  <label htmlFor={`correct-${index}`} className="text-sm cursor-pointer">
                    Correct
                  </label>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Question'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
