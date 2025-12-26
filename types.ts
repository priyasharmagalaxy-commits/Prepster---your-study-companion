
export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  questions: Question[];
  quotes: string[];
  topicTitle: string;
  imagePrompt: string;
}

export interface QuizScore {
  date: string;
  score: number;
  total: number;
}

export interface UserAnswer {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
  feedback: string;
}
