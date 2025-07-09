// Performance monitoring utilities
export class PerformanceMonitor {
  private static timings: Map<string, number> = new Map()
  private static metrics: Map<string, number[]> = new Map()

  static startTiming(label: string): void {
    this.timings.set(label, performance.now())
  }

  static endTiming(label: string): number {
    const startTime = this.timings.get(label)
    if (!startTime) {
      console.warn(`No start time found for ${label}`)
      return 0
    }
    
    const duration = performance.now() - startTime
    this.timings.delete(label)
    
    // Store metrics
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(duration)
    
    return duration
  }

  static getAverageTime(label: string): number {
    const times = this.metrics.get(label)
    if (!times || times.length === 0) return 0
    
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  static logMetrics(): void {
    console.group('Performance Metrics')
    for (const [label, times] of this.metrics) {
      const avg = this.getAverageTime(label)
      console.log(`${label}: ${avg.toFixed(2)}ms average (${times.length} samples)`)
    }
    console.groupEnd()
  }
}

// Memory management utilities
export class MemoryManager {
  private static imageCache = new Map<string, HTMLImageElement>()
  private static maxCacheSize = 50

  static preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        resolve(this.imageCache.get(src)!)
        return
      }

      const img = new Image()
      img.onload = () => {
        this.addToCache(src, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = src
    })
  }

  private static addToCache(src: string, img: HTMLImageElement): void {
    if (this.imageCache.size >= this.maxCacheSize) {
      const firstKey = this.imageCache.keys().next().value
      this.imageCache.delete(firstKey)
    }
    this.imageCache.set(src, img)
  }

  static clearCache(): void {
    this.imageCache.clear()
  }

  static getCacheSize(): number {
    return this.imageCache.size
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Image compression utility
export async function compressImage(
  file: File,
  maxWidth: number = 1024,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const { width, height } = img
      const ratio = Math.min(maxWidth / width, maxWidth / height)
      
      canvas.width = width * ratio
      canvas.height = height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}