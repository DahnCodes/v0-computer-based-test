'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

interface CSVUploaderProps {
  onUpload: (data: Array<{
    question: string
    option1: string
    option1_correct: boolean
    option2: string
    option2_correct: boolean
    option3: string
    option3_correct: boolean
    option4: string
    option4_correct: boolean
  }>) => Promise<void>
  isLoading: boolean
}

export function CSVUploader({ onUpload, isLoading }: CSVUploaderProps) {
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      // Skip header row
      const dataLines = lines.slice(1)
      const data = dataLines.map(line => {
        const columns = line.split(',').map(col => col.trim())
        return {
          question: columns[0],
          option1: columns[1],
          option1_correct: columns[2]?.toLowerCase() === 'true',
          option2: columns[3],
          option2_correct: columns[4]?.toLowerCase() === 'true',
          option3: columns[5],
          option3_correct: columns[6]?.toLowerCase() === 'true',
          option4: columns[7],
          option4_correct: columns[8]?.toLowerCase() === 'true',
        }
      })

      await onUpload(data)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Questions (CSV)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>CSV Format:</p>
          <code className="block bg-secondary p-2 rounded text-xs">
            question,option1,option1_correct,option2,option2_correct,option3,option3_correct,option4,option4_correct
          </code>
          <p className="text-xs">Use "true" or "false" for correct answers</p>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
            id="csv-file"
          />
          <Button
            asChild
            variant="outline"
            disabled={isLoading}
            className="cursor-pointer"
          >
            <label htmlFor="csv-file" className="cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Choose CSV File
            </label>
          </Button>
        </div>

        {error && <div className="text-destructive text-sm">{error}</div>}
      </CardContent>
    </Card>
  )
}
