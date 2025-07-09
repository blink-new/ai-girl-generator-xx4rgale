import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Performance monitoring
if (typeof window !== 'undefined') {
  // Web Vitals monitoring (manual implementation)
  const measureWebVitals = () => {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime
        console.log('FID:', fid)
      })
    }).observe({ entryTypes: ['first-input'], buffered: true })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'], buffered: true })
  }

  measureWebVitals()

  // Performance observer for monitoring
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
  }

  // Memory monitoring
  if ('memory' in performance) {
    const memoryInfo = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
    console.log('Memory usage:', {
      used: Math.round(memoryInfo.usedJSHeapSize / 1048576),
      total: Math.round(memoryInfo.totalJSHeapSize / 1048576),
      limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576)
    })
  }
}

// Preload critical resources
const preloadResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  fontLink.as = 'style'
  document.head.appendChild(fontLink)

  // Preload critical CSS
  const criticalCSS = document.createElement('link')
  criticalCSS.rel = 'preload'
  criticalCSS.href = '/src/index.css'
  criticalCSS.as = 'style'
  document.head.appendChild(criticalCSS)
}

// Initialize preloading
preloadResources()

// Optimize React rendering
const root = ReactDOM.createRoot(document.getElementById('root')!)

// Error boundary for better error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Render with optimizations
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)