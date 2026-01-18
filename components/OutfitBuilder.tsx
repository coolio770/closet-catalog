'use client'

// Outfit Builder - Mobile-first, GOAT/StockX inspired
// Touch-optimized with bottom drawer for items

import { useState, useRef, useCallback } from 'react'
import { ClothingItem } from '@/types'
import MobileNav from './MobileNav'

interface OutfitBuilderProps {
  items: ClothingItem[]
  onOutfitSaved?: () => void
}

interface DraggedItem {
  item: ClothingItem
  x: number
  y: number
  id: string
}

interface Suggestion {
  name: string
  itemIds: string[]
  reasoning: string
}

export default function OutfitBuilder({ items, onOutfitSaved }: OutfitBuilderProps) {
  const [outfitItems, setOutfitItems] = useState<DraggedItem[]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [outfitName, setOutfitName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showItemDrawer, setShowItemDrawer] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('')
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0 })

  // Handle zoom with pinch/scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3)
    setZoom(newZoom)
  }, [zoom])

  // Handle pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !draggedItemId && e.target === e.currentTarget) {
      isPanningRef.current = true
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
  }, [pan, draggedItemId])
  
  // Handle item drag start (mouse)
  const handleItemMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    if (e.button === 0) {
      setDraggedItemId(itemId)
      isPanningRef.current = false
    }
  }, [])

  // Handle item drag start (touch)
  const handleItemTouchStart = useCallback((e: React.TouchEvent, itemId: string) => {
    e.stopPropagation()
    if (e.touches.length === 1) {
      setDraggedItemId(itemId)
      isPanningRef.current = false
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current && !draggedItemId) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      })
    } else if (draggedItemId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      // Calculate position in canvas space (accounting for zoom and pan)
      // Screen coordinates -> canvas coordinates
      const x = (e.clientX - rect.left - pan.x) / zoom - 64 // 64 is half of item width (128/2)
      const y = (e.clientY - rect.top - pan.y) / zoom - 64

      // Only update the dragged item's position
      setOutfitItems((prevItems) =>
        prevItems.map((i) =>
          i.id === draggedItemId ? { ...i, x, y } : i
        )
      )
    }
  }, [pan, zoom, draggedItemId])

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
    if (draggedItemId) {
      setDraggedItemId(null)
    }
  }, [draggedItemId])

  // Touch handlers for canvas (panning)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only start panning if touching the canvas directly (not an item)
    // Items will have their own touch handlers that stop propagation
    if (e.touches.length === 1 && !draggedItemId && e.target === e.currentTarget) {
      const touch = e.touches[0]
      isPanningRef.current = true
      panStartRef.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y }
    }
  }, [pan, draggedItemId])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && draggedItemId && canvasRef.current) {
      // Dragging an individual item
      const touch = e.touches[0]
      const rect = canvasRef.current.getBoundingClientRect()
      // Calculate position in canvas space (accounting for zoom and pan)
      const x = (touch.clientX - rect.left - pan.x) / zoom - 64 // 64 is half of item width (128/2)
      const y = (touch.clientY - rect.top - pan.y) / zoom - 64

      // Only update the dragged item's position
      setOutfitItems((prevItems) =>
        prevItems.map((i) =>
          i.id === draggedItemId ? { ...i, x, y } : i
        )
      )
    } else if (e.touches.length === 1 && isPanningRef.current && !draggedItemId) {
      // Panning the canvas
      const touch = e.touches[0]
      setPan({
        x: touch.clientX - panStartRef.current.x,
        y: touch.clientY - panStartRef.current.y,
      })
    }
  }, [pan, zoom, draggedItemId])

  const handleTouchEnd = useCallback(() => {
    isPanningRef.current = false
    if (draggedItemId) {
      setDraggedItemId(null)
    }
  }, [draggedItemId])

  // Add item by tap (mobile-friendly)
  const handleAddItem = (item: ClothingItem) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    // Calculate center position in canvas coordinates (not screen coordinates)
    const centerX = (rect.width / 2 - pan.x) / zoom
    const centerY = (rect.height / 2 - pan.y) / zoom
    
    // Offset each new item slightly so they don't overlap
    const offsetX = (outfitItems.length % 3) * 30 - 30 // -30, 0, 30
    const offsetY = Math.floor(outfitItems.length / 3) * 30
    
    const newItem: DraggedItem = {
      item,
      x: centerX - 64 + offsetX, // Center with slight offset (64 is half item width)
      y: centerY - 64 + offsetY,
      id: `${item.id}-${Date.now()}-${Math.random()}`,
    }
    setOutfitItems((prev) => [...prev, newItem])
    setShowItemDrawer(false) // Close drawer on mobile after adding
  }

  // Remove item
  const removeItem = (itemId: string) => {
    setOutfitItems(outfitItems.filter((item) => item.id !== itemId))
  }

  // Save outfit
  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      alert('Enter an outfit name')
      return
    }

    if (outfitItems.length === 0) {
      alert('Add at least one item')
      return
    }

    setIsSaving(true)
    try {
      const { outfitsAPI } = await import('@/lib/api-client')
      
      await outfitsAPI.create({
        name: outfitName,
        tags: [],
        season: 'ALL_SEASON',
        notes: null,
        items: outfitItems.map((item) => item.item),
      })

      setOutfitItems([])
      setOutfitName('')
      setZoom(1)
      setPan({ x: 0, y: 0 })
      
      if (onOutfitSaved) onOutfitSaved()
      alert('Outfit saved!')
    } catch (error) {
      console.error('Error saving outfit:', error)
      alert('Failed to save outfit')
    } finally {
      setIsSaving(false)
    }
  }

  // AI Suggestions
  const handleSuggestOutfits = async () => {
    setIsSuggesting(true)
    try {
      const { suggestOutfits } = await import('@/lib/ai-client')
      const suggestions = await suggestOutfits(items)
      setSuggestions(suggestions)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to get suggestions'
      alert(errorMessage)
    } finally {
      setIsSuggesting(false)
    }
  }

  const applySuggestion = (itemIds: string[], name: string) => {
    // Filter items that match the suggested IDs
    const selected = items.filter((i) => itemIds.includes(i.id))
    
    if (selected.length === 0) {
      console.error('AI returned itemIds:', itemIds)
      console.error('Available item IDs:', items.map(i => i.id))
      alert(`Could not find items for this suggestion. Expected ${itemIds.length} items but found ${selected.length}. The AI may have returned incorrect IDs.`)
      return
    }
    
    // If some items are missing, still show what we found
    if (selected.length < itemIds.length) {
      console.warn(`Only found ${selected.length} of ${itemIds.length} suggested items`)
    }
    
    if (name) setOutfitName(name)
    setZoom(1)
    setPan({ x: 0, y: 0 })

    // Position items in a grid layout
    const placed: DraggedItem[] = selected.map((item, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      return {
        item,
        x: 40 + col * 140,
        y: 40 + row * 160,
        id: `${item.id}-${Date.now()}-${idx}-${Math.random()}`,
      }
    })
    setOutfitItems(placed)
    setSuggestions([])
  }

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ClothingItem[]>)

  const categoryLabels: Record<string, string> = {
    TOPS: 'Tops',
    BOTTOMS: 'Bottoms',
    OUTERWEAR: 'Outerwear',
    SHOES: 'Shoes',
    ACCESSORIES: 'Accessories',
  }

  const categories = Object.keys(itemsByCategory)

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden pb-16 md:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-black text-sm font-medium">
              ← Back
            </a>
            <h1 className="text-xl font-bold text-black">Builder</h1>
          </div>
          <button
            onClick={() => setShowItemDrawer(!showItemDrawer)}
            className="md:hidden px-3 py-1.5 bg-black text-white text-xs font-medium"
          >
            Items
          </button>
        </div>

        {/* Outfit Name & Actions - Mobile */}
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            placeholder="Outfit name..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSuggestOutfits}
              disabled={isSuggesting || items.length < 2}
              className="flex-1 px-3 py-2 bg-gray-100 text-black text-xs font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {isSuggesting ? 'Thinking...' : 'AI Suggest'}
            </button>
            <button
              onClick={handleSaveOutfit}
              disabled={isSaving || outfitItems.length === 0}
              className="flex-1 px-3 py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* AI Suggestions - Mobile */}
        {suggestions.length > 0 && (
          <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <button
                key={`${s.name}-${idx}`}
                onClick={() => applySuggestion(s.itemIds, s.name)}
                className="w-full text-left bg-gray-50 border border-gray-200 p-2 text-xs"
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-gray-500 mt-0.5 line-clamp-1">{s.reasoning}</div>
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-4">Your Closet</h3>
            {categories.map((category) => (
              <div key={category} className="mb-6">
                <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase">
                  {categoryLabels[category] || category}
                </h4>
                <div className="space-y-2">
                  {itemsByCategory[category].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="cursor-pointer"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full aspect-square object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                      <p className="text-xs font-medium mt-1 truncate">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full bg-gray-50 relative"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #f9fafb 25%, transparent 25%),
                linear-gradient(-45deg, #f9fafb 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f9fafb 75%),
                linear-gradient(-45deg, transparent 75%, #f9fafb 75%)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            {/* Zoom indicator */}
            <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 text-xs font-medium z-10">
              {Math.round(zoom * 100)}%
            </div>

            {/* Outfit items - positioned in canvas space */}
            <div 
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
            >
              {outfitItems.map((draggedItem) => (
                <div
                  key={draggedItem.id}
                  data-item-id={draggedItem.id}
                  style={{
                    position: 'absolute',
                    left: `${draggedItem.x}px`,
                    top: `${draggedItem.y}px`,
                    cursor: draggedItemId === draggedItem.id ? 'grabbing' : 'grab',
                    zIndex: draggedItemId === draggedItem.id ? 50 : 10,
                  }}
                  className="group touch-none"
                  onMouseDown={(e) => handleItemMouseDown(e, draggedItem.id)}
                  onTouchStart={(e) => handleItemTouchStart(e, draggedItem.id)}
                >
                  <div className="relative">
                    {draggedItem.item.imageUrl ? (
                      <img
                        src={draggedItem.item.imageUrl}
                        alt={draggedItem.item.name}
                        className="w-32 h-32 object-cover border-2 border-white shadow-lg pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 border-2 border-white shadow-lg flex items-center justify-center text-xs text-gray-400 pointer-events-none">
                        No image
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(draggedItem.id)
                      }}
                      className={`absolute -top-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        draggedItemId === draggedItem.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {outfitItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <p className="text-sm font-medium">Tap &quot;Items&quot; to add clothing</p>
                  <p className="text-xs mt-1">or use AI Suggest</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Item Drawer - Bottom Sheet */}
        {showItemDrawer && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowItemDrawer(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-bold text-sm">Add Items</h3>
                <button
                  onClick={() => setShowItemDrawer(false)}
                  className="text-gray-400 text-xl"
                >
                  ×
                </button>
              </div>
              
              {/* Category tabs */}
              <div className="flex overflow-x-auto border-b border-gray-200 px-4">
                <button
                  onClick={() => setActiveCategory('')}
                  className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 ${
                    activeCategory === ''
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 ${
                      activeCategory === cat
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    {categoryLabels[cat] || cat}
                  </button>
                ))}
              </div>

              {/* Items grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-3">
                  {(activeCategory ? itemsByCategory[activeCategory] || [] : items).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="text-left"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full aspect-square object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                      <p className="text-xs font-medium mt-1 truncate">{item.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
