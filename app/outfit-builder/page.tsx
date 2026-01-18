'use client'

// Outfit Builder page
// Full-page outfit builder with drag-and-drop functionality

import { useEffect, useState } from 'react'
import OutfitBuilder from '@/components/OutfitBuilder'
import DevTools from '@/components/DevTools'
import { ClothingItem } from '@/types'

export default function OutfitBuilderPage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    fetchItems()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading your closet...</div>
      </div>
    )
  }

  return (
    <>
      <OutfitBuilder items={items} onOutfitSaved={fetchItems} />
      <DevTools />
    </>
  )
}
