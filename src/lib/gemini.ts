import { QuizStorage, QuizConfig, QuizGenerationProgress } from '@/types/quiz'

export async function generateQuizzes(
  config: QuizConfig, 
  onProgress?: (progress: QuizGenerationProgress) => void
): Promise<QuizStorage[]> {
  
  try {
    // Simulate progress for now since we're making a single API call
    const totalBatches = Math.ceil(config.numberOfQuestions / 5)
    
    onProgress?.({
      completed: 0,
      total: config.numberOfQuestions,
      currentBatch: 0,
      totalBatches,
      status: 'Starting quiz generation...'
    })

    // Call our API route
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.quiz) {
      throw new Error('No quiz data received from server')
    }

    // Convert date string back to Date object
    const quiz: QuizStorage = {
      ...data.quiz,
      createdAt: new Date(data.quiz.createdAt)
    }

    onProgress?.({
      completed: config.numberOfQuestions,
      total: config.numberOfQuestions,
      currentBatch: totalBatches,
      totalBatches,
      status: 'QuizStorage generation completed!'
    })

    return [quiz]
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate quiz: ${error.message}`)
    }
    throw new Error('Failed to generate quiz: Unknown error occurred')
  }
}

export function exportQuizAsJSON(quiz: QuizStorage): string {
  return JSON.stringify(quiz, null, 2)
}

export function importQuizFromJSON(jsonString: string): QuizStorage {
  try {
    const quiz = JSON.parse(jsonString)
    
    if (!quiz.id || !quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Invalid quiz format')
    }

    quiz.createdAt = new Date(quiz.createdAt)
    
    return quiz as QuizStorage
  } catch {
    throw new Error('Invalid JSON format')
  }
}