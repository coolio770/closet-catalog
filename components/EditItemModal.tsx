'use client'

// Edit Item Modal - GOAT/StockX inspired, mobile-first
// Full-featured form for editing all item properties

import { useState, useEffect } from 'react'
import { ClothingItem } from '@/types'

type Category = 'TOPS' | 'BOTTOMS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORIES'
type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'ALL_SEASON'
type Fit = 'TIGHT' | 'REGULAR' | 'LOOSE' | 'OVERSIZED'

interface EditItemModalProps {
  item: ClothingItem
  isOpen: boolean
  onClose: () => void
  onItemUpdated: () => void
}

export default function EditItemModal({ item, isOpen, onClose, onItemUpdated }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category as Category,
    color: item.color,
    brand: item.brand || '',
    season: item.season as Season,
    fit: (item.fit || '') as Fit | '',
    material: item.material || '',
    tags: item.tags.join(', '),
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category as Category,
        color: item.color,
        brand: item.brand || '',
        season: item.season as Season,
        fit: (item.fit || '') as Fit | '',
        material: item.material || '',
        tags: item.tags.join(', '),
      })
      setImagePreview(item.imageUrl)
      setImageFile(null)
    }
  }, [item])

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
      const { itemsAPI } = await import('@/lib/api-client')
      
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []

      await itemsAPI.update(
        item.id,
        {
          name: formData.name,
          category: formData.category,
          color: formData.color,
          brand: formData.brand || undefined,
          season: formData.season,
          fit: formData.fit || undefined,
          material: formData.material || undefined,
          tags: tagsArray,
        },
        imageFile || undefined
      )

      onItemUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold text-black">Edit Item</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-black text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-black mb-2 uppercase tracking-wide">
                Photo
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
                      const fileInput = document.getElementById(`edit-image-input-${item.id}`) as HTMLInputElement
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
                    id={`edit-image-input-${item.id}`}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
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
                    <p className="text-xs text-gray-500">Tap to change photo</p>
                  </div>
                </label>
              )}
            </div>

            {/* Name */}
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

            {/* Category and Color */}
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

            {/* Brand */}
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

            {/* Season and Fit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                  Season *
                </label>
                <select
                  required
                  value={formData.season}
                  onChange={(e) =>
                    setFormData({ ...formData, season: e.target.value as Season })
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
                >
                  <option value="SPRING">Spring</option>
                  <option value="SUMMER">Summer</option>
                  <option value="FALL">Fall</option>
                  <option value="WINTER">Winter</option>
                  <option value="ALL_SEASON">All Season</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                  Fit
                </label>
                <select
                  value={formData.fit}
                  onChange={(e) =>
                    setFormData({ ...formData, fit: e.target.value as Fit | '' })
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
                >
                  <option value="">None</option>
                  <option value="TIGHT">Tight</option>
                  <option value="REGULAR">Regular</option>
                  <option value="LOOSE">Loose</option>
                  <option value="OVERSIZED">Oversized</option>
                </select>
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                Material
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) =>
                  setFormData({ ...formData, material: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
                placeholder="Material (e.g., Cotton, Wool)"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-black mb-1.5 uppercase tracking-wide">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black text-sm"
                placeholder="Comma-separated tags (e.g., casual, essential, summer)"
              />
              <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-black font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
