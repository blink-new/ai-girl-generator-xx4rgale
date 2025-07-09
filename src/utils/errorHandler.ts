import toast from 'react-hot-toast'

export interface ErrorInfo {
  error: Error
  context?: string
  timestamp: number
  userId?: string
  action?: string
}

export class ErrorHandler {
  private static errors: ErrorInfo[] = []
  private static maxErrors = 100

  static logError(error: Error, context?: string, action?: string): void {
    const errorInfo: ErrorInfo = {
      error,
      context,
      timestamp: Date.now(),
      action
    }

    // Add to local storage
    this.errors.push(errorInfo)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Unknown'}] ${error.message}`, error)
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('app-errors', JSON.stringify(this.errors.slice(-10)))
    } catch {
      console.warn('Failed to store error in localStorage')
    }
  }

  static handleImageGenerationError(error: Error): void {
    this.logError(error, 'Image Generation', 'generate_image')
    
    if (error.message.includes('rate limit')) {
      toast.error('Rate limit exceeded. Please try again in a few minutes.')
    } else if (error.message.includes('content filter')) {
      toast.error('Content filtered. Please adjust your prompt and try again.')
    } else if (error.message.includes('network')) {
      toast.error('Network error. Please check your connection and try again.')
    } else {
      toast.error('Failed to generate image. Please try again.')
    }
  }

  static handleAuthError(error: Error): void {
    this.logError(error, 'Authentication', 'auth')
    
    if (error.message.includes('unauthorized')) {
      toast.error('Please sign in to continue.')
    } else if (error.message.includes('expired')) {
      toast.error('Session expired. Please sign in again.')
    } else {
      toast.error('Authentication error. Please try again.')
    }
  }

  static handleDownloadError(error: Error): void {
    this.logError(error, 'Download', 'download_image')
    toast.error('Failed to download image. Please try again.')
  }

  static getRecentErrors(): ErrorInfo[] {
    return this.errors.slice(-10)
  }

  static clearErrors(): void {
    this.errors = []
    localStorage.removeItem('app-errors')
  }
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries - 1) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Network status utility
export class NetworkMonitor {
  private static isOnline = navigator.onLine
  private static listeners: ((online: boolean) => void)[] = []

  static init(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners(true)
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners(false)
    })
  }

  static subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online))
  }

  static getStatus(): boolean {
    return this.isOnline
  }
}

// Initialize network monitoring
NetworkMonitor.init()