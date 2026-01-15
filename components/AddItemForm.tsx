'use client'

// Add Item Form - GOAT/StockX inspired, mobile-first
// Clean, minimal design with large image upload area

import { useState } from 'react'

type Category = 'TOPS' | 'BOTTOMS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORIES'
type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'ALL_SEASON'
type Fit = 'TIGHT' | 'REGULAR' | 'LOOSE' | 'OVERSIZED'

interface AddItemFormProps {
  onItemAdded: () => void
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'TOPS' as Category,
    color: '',
    brand: '',
    season: 'ALL_SEASON' as Season,
    fit: '' as Fit | '',
    material: '',
    tags: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!imageFile) {
        alert('Please select an image')
        setIsSubmitting(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('color', formData.color)
      if (formData.brand) formDataToSend.append('brand', formData.brand)
      formDataToSend.append('season', formData.season)
      if (formData.fit) formDataToSend.append('fit', formData.fit)
      if (formData.material) formDataToSend.append('material', formData.material)
      formDataToSend.append('tags', formData.tags)
      formDataToSend.append('image', imageFile)

      const response = await fetch('/api/items', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create item')
        } else {
          const text = await response.text()
          console.error('Server returned HTML error:', text)
          throw new Error(`Server error: ${response.status}`)
        }
      }

      // Reset form
      setFormData({
        name: '',
        category: 'TOPS',
        color: '',
        brand: '',
        season: 'ALL_SEASON',
        fit: '',
        material: '',
        tags: '',
      })
      setImageFile(null)
      setImagePreview(null)
      setIsExpanded(false)
      
      const fileInput = document.getElementById('image-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      onItemAdded()
    } catch (error) {
      console.error('Error adding item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mobile: Collapsible form
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full py-4 bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
      >
        + Add New Item
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-black">Add Item</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-black"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Image Upload - Large, prominent */}
        <div>
          <label className="block text-xs font-medium text-black mb-2 uppercase tracking-wide">
            Photo *
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full aspect-square object-cover bg-gray-100"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  setImageFile(null)
                  const fileInput = document.getElementById('image-input') as HTMLInputElement
                  if (fileInput) fileInput.value = ''
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block w-full aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-black transition-colors">
              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                required
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-xs text-gray-500">Tap to add photo</p>
              </div>
            </label>
          )}
        </div>

        {/* Essential Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
              placeholder="Item name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as Category })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
              >
                <option value="TOPS">Tops</option>
                <option value="BOTTOMS">Bottoms</option>
                <option value="OUTERWEAR">Outerwear</option>
                <option value="SHOES">Shoes</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                Color *
              </label>
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
                placeholder="Color"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
              placeholder="Brand name"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add to Closet'}
        </button>
      </div>
    </form>
  )
}
