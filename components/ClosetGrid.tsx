'use client'

// Grid component - GOAT/StockX inspired design
// Mobile-first: large image cards, swipeable filters

import { useEffect, useState } from 'react'
import { ClothingItem } from '@/types'

type Category = 'TOPS' | 'BOTTOMS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORIES'
type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'ALL_SEASON'

interface ClosetGridProps {
  items: ClothingItem[]
  onItemDeleted: () => void
}

export default function ClosetGrid({ items, onItemDeleted }: ClosetGridProps) {
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>(items)
  const [filters, setFilters] = useState({
    category: '' as Category | '',
    season: '' as Season | '',
    search: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = [...items]

    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category)
    }

    if (filters.season) {
      filtered = filtered.filter((item) => item.season === filters.season)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.color.toLowerCase().includes(searchLower) ||
          (item.brand && item.brand.toLowerCase().includes(searchLower))
      )
    }

    setFilteredItems(filtered)
  }, [items, filters])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      onItemDeleted()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item. Please try again.')
    }
  }

  const getCategoryLabel = (category: Category) => {
    const labels: Record<Category, string> = {
      TOPS: 'Tops',
      BOTTOMS: 'Bottoms',
      OUTERWEAR: 'Outerwear',
      SHOES: 'Shoes',
      ACCESSORIES: 'Accessories',
    }
    return labels[category]
  }

  // Mobile-first: Horizontal scrollable filter chips
  const categories: Category[] = ['TOPS', 'BOTTOMS', 'OUTERWEAR', 'SHOES', 'ACCESSORIES']

  return (
    <div className="w-full">
      {/* Search Bar - Mobile optimized */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-black text-sm"
            placeholder="Search items..."
          />
          <svg
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category Filters - Horizontal scroll on mobile */}
      <div className="mb-4 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 min-w-max md:flex-wrap">
          <button
            onClick={() => setFilters({ ...filters, category: '' })}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors ${
              filters.category === ''
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters({ ...filters, category: cat })}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors ${
                filters.category === cat
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-xs text-gray-500">
        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
      </div>

      {/* Grid - Mobile: 2 columns, Desktop: 3-4 columns */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <p>No items found</p>
          <p className="mt-2 text-xs">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white group cursor-pointer"
            >
              {/* Image - Full width, square aspect ratio */}
              <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-300 text-xs">No image</span>
                  </div>
                )}
                {/* Delete button - appears on hover/touch */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-sm font-bold"
                >
                  ×
                </button>
              </div>

              {/* Item info - Minimal, clean */}
              <div className="pt-2 pb-1">
                <h3 className="font-semibold text-sm text-black mb-0.5 line-clamp-1">
                  {item.name}
                </h3>
                {item.brand && (
                  <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                )}
                <p className="text-xs text-gray-400">{item.color}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
