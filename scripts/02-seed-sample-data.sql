-- Seed sample quiz and questions
INSERT INTO quizzes (title, description, class_id, time_limit_minutes, passing_score, is_published)
SELECT 
  'General Knowledge Quiz',
  'A comprehensive test of general knowledge',
  id,
  30,
  60,
  true
FROM classes
WHERE name = 'Class A - 2025'
LIMIT 1;

-- Get the quiz ID and insert questions
DO $$
DECLARE
  quiz_id UUID;
BEGIN
  SELECT id INTO quiz_id FROM quizzes WHERE title = 'General Knowledge Quiz' LIMIT 1;
  
  IF quiz_id IS NOT NULL THEN
    -- Insert questions
    INSERT INTO questions (quiz_id, question_text, question_type, display_order) VALUES
    (quiz_id, 'What is the capital of France?', 'multiple_choice', 1),
    (quiz_id, 'Which planet is known as the Red Planet?', 'multiple_choice', 2),
    (quiz_id, 'What is the largest ocean on Earth?', 'multiple_choice', 3),
    (quiz_id, 'Who painted the Mona Lisa?', 'multiple_choice', 4),
    (quiz_id, 'What is the chemical symbol for Gold?', 'multiple_choice', 5);

    -- Insert options for question 1
    INSERT INTO options (question_id, option_text, is_correct, display_order)
    SELECT id, 'Paris', true, 1 FROM questions WHERE quiz_id = quiz_id AND display_order = 1
    UNION ALL
    SELECT id, 'London', false, 2 FROM questions WHERE quiz_id = quiz_id AND display_order = 1
    UNION ALL
    SELECT id, 'Berlin', false, 3 FROM questions WHERE quiz_id = quiz_id AND display_order = 1
    UNION ALL
    SELECT id, 'Madrid', false, 4 FROM questions WHERE quiz_id = quiz_id AND display_order = 1;

    -- Insert options for question 2
    INSERT INTO options (question_id, option_text, is_correct, display_order)
    SELECT id, 'Mars', true, 1 FROM questions WHERE quiz_id = quiz_id AND display_order = 2
    UNION ALL
    SELECT id, 'Venus', false, 2 FROM questions WHERE quiz_id = quiz_id AND display_order = 2
    UNION ALL
    SELECT id, 'Jupiter', false, 3 FROM questions WHERE quiz_id = quiz_id AND display_order = 2
    UNION ALL
    SELECT id, 'Saturn', false, 4 FROM questions WHERE quiz_id = quiz_id AND display_order = 2;

    -- Insert options for question 3
    INSERT INTO options (question_id, option_text, is_correct, display_order)
    SELECT id, 'Pacific Ocean', true, 1 FROM questions WHERE quiz_id = quiz_id AND display_order = 3
    UNION ALL
    SELECT id, 'Atlantic Ocean', false, 2 FROM questions WHERE quiz_id = quiz_id AND display_order = 3
    UNION ALL
    SELECT id, 'Indian Ocean', false, 3 FROM questions WHERE quiz_id = quiz_id AND display_order = 3
    UNION ALL
    SELECT id, 'Arctic Ocean', false, 4 FROM questions WHERE quiz_id = quiz_id AND display_order = 3;

    -- Insert options for question 4
    INSERT INTO options (question_id, option_text, is_correct, display_order)
    SELECT id, 'Leonardo da Vinci', true, 1 FROM questions WHERE quiz_id = quiz_id AND display_order = 4
    UNION ALL
    SELECT id, 'Vincent van Gogh', false, 2 FROM questions WHERE quiz_id = quiz_id AND display_order = 4
    UNION ALL
    SELECT id, 'Pablo Picasso', false, 3 FROM questions WHERE quiz_id = quiz_id AND display_order = 4
    UNION ALL
    SELECT id, 'Michelangelo', false, 4 FROM questions WHERE quiz_id = quiz_id AND display_order = 4;

    -- Insert options for question 5
    INSERT INTO options (question_id, option_text, is_correct, display_order)
    SELECT id, 'Au', true, 1 FROM questions WHERE quiz_id = quiz_id AND display_order = 5
    UNION ALL
    SELECT id, 'Ag', false, 2 FROM questions WHERE quiz_id = quiz_id AND display_order = 5
    UNION ALL
    SELECT id, 'Cu', false, 3 FROM questions WHERE quiz_id = quiz_id AND display_order = 5
    UNION ALL
    SELECT id, 'Fe', false, 4 FROM questions WHERE quiz_id = quiz_id AND display_order = 5;
  END IF;
END $$;
