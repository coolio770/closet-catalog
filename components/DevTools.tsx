'use client'

// Dev Tools component - visible on all pages for testing/debugging
// Includes test data loader and other development utilities

import { useState } from 'react'

export default function DevTools() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadTestData = async () => {
    if (!confirm('This will replace all existing items with test data. Continue?')) {
      return
    }

    setIsLoading(true)
    try {
      const { loadTestData } = await import('@/lib/test-data')
      await loadTestData()
      
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      console.error('Error loading test data:', error)
      alert('Failed to load test data. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
      <button
        onClick={handleLoadTestData}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 text-white text-xs font-medium rounded shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Load test wardrobe data for debugging"
      >
        {isLoading ? 'Loading...' : '🧪 Test Mode'}
      </button>
    </div>
  )
}
