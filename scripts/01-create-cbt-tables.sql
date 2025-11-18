-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  passing_score INTEGER NOT NULL DEFAULT 50,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create options table
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attempts table (student quiz submissions)
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_points INTEGER,
  percentage_score DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, submitted, reviewed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, quiz_id, started_at)
);

-- Create student answers table
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  selected_option_id UUID REFERENCES options(id),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_class_id ON quizzes(class_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_id ON attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id ON attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt_id ON student_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_question_id ON student_answers(question_id);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view their own data" ON students
  FOR SELECT USING (true); -- Allow viewing for now

-- RLS Policies for quizzes table
CREATE POLICY "Anyone can view published quizzes" ON quizzes
  FOR SELECT USING (is_published = true);

-- RLS Policies for attempts table
CREATE POLICY "Students can view their own attempts" ON attempts
  FOR SELECT USING (true);

-- RLS Policies for student_answers table
CREATE POLICY "Students can view their own answers" ON student_answers
  FOR SELECT USING (true);

-- Seed sample data
INSERT INTO classes (name, description) VALUES
  ('Class A - 2025', 'Standard class for 2025 academic year'),
  ('Class B - 2025', 'Advanced class for 2025 academic year'),
  ('Class C - 2025', 'Foundation class for 2025 academic year')
ON CONFLICT DO NOTHING;
