import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface Option {
  id: string
  option_text: string
  display_order: number
}

interface QuestionDisplayProps {
  questionNumber: number
  totalQuestions: number
  questionText: string
  options: Option[]
  selectedAnswer: string | null
  onAnswerChange: (optionId: string) => void
}

export function QuestionDisplay({
  questionNumber,
  totalQuestions,
  questionText,
  options,
  selectedAnswer,
  onAnswerChange,
}: QuestionDisplayProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Question {questionNumber} of {totalQuestions}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-base font-medium leading-relaxed">{questionText}</p>

        <RadioGroup value={selectedAnswer || ''} onValueChange={onAnswerChange}>
          <div className="space-y-3">
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="font-normal cursor-pointer flex-1 text-base"
                >
                  {option.option_text}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
