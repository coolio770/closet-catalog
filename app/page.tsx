'use client'

// Main page component - displays add item form and closet grid
// This is the MVP home page with both features

import { useEffect, useState } from 'react'
import AddItemForm from '@/components/AddItemForm'
import ClosetGrid from '@/components/ClosetGrid'
import MobileNav from '@/components/MobileNav'
import DevTools from '@/components/DevTools'
import { ClothingItem } from '@/types'

export default function Home() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch items from client-side storage
  const fetchItems = async () => {
    try {
      const { itemsAPI } = await import('@/lib/api-client')
      const data = await itemsAPI.getAll()
      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch items on mount and when refresh is triggered
  useEffect(() => {
    fetchItems()
  }, [])

  const handleItemAdded = () => {
    fetchItems()
  }

  const handleItemDeleted = () => {
    fetchItems()
  }

  return (
    <main className="min-h-screen bg-white pb-20 md:pb-8">
      {/* Mobile Header - Clean, minimal */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-black">
            Closet
          </h1>
          <a
            href="/outfit-builder"
            className="md:hidden text-black font-medium text-sm"
          >
            Builder
          </a>
          <a
            href="/outfit-builder"
            className="hidden md:block px-6 py-2 bg-black text-white font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            Outfit Builder
          </a>
        </div>
      </header>

      {/* Add Item Form - Collapsible on mobile */}
      <section className="px-4 md:px-6 pt-4 md:pt-6 mb-6 md:mb-12">
        <AddItemForm onItemAdded={handleItemAdded} />
      </section>

      {/* Closet Grid */}
      <section className="px-4 md:px-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Loading your closet...
          </div>
        ) : (
          <ClosetGrid items={items} onItemDeleted={handleItemDeleted} />
        )}
      </section>

      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Dev Tools - Global */}
      <DevTools />
    </main>
  )
}
