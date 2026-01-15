// Client-side API client using IndexedDB storage
// Replaces server-side API routes with client-side storage

'use client'

import { storage } from './storage'
import { ClothingItem, Outfit, ClothingItemFormData } from '@/types'
import { fileToDataURL, validateImageFile } from './image-utils'

// Clothing Items API
export const itemsAPI = {
  // Get all items with optional filters
  async getAll(filters?: {
    category?: string
    season?: string
    color?: string
    search?: string
  }): Promise<ClothingItem[]> {
    return storage.getItems(filters)
  },

  // Get single item
  async getOne(id: string): Promise<ClothingItem | null> {
    return storage.getItem(id)
  },

  // Create item
  async create(data: ClothingItemFormData, imageFile?: File): Promise<ClothingItem> {
    let imageUrl: string | null = null

    // Handle image upload
    if (imageFile) {
      const validation = validateImageFile(imageFile)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      imageUrl = await fileToDataURL(imageFile)
    }

    return storage.createItem({
      ...data,
      imageUrl,
      tags: data.tags || [],
    })
  },

  // Update item
  async update(
    id: string,
    data: Partial<ClothingItemFormData>,
    imageFile?: File
  ): Promise<ClothingItem> {
    const updates: Partial<ClothingItem> = { ...data }

    // Handle image upload
    if (imageFile) {
      const validation = validateImageFile(imageFile)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      updates.imageUrl = await fileToDataURL(imageFile)
    }

    return storage.updateItem(id, updates)
  },

  // Delete item
  async delete(id: string): Promise<void> {
    return storage.deleteItem(id)
  },
}

// Outfits API
export const outfitsAPI = {
  // Get all outfits
  async getAll(): Promise<Outfit[]> {
    const outfits = await storage.getOutfits()
    
    // Populate items for each outfit
    const outfitsWithItems = await Promise.all(
      outfits.map(async (outfit) => {
        if (outfit.items && outfit.items.length > 0) {
          // Items are already included in the outfit
          return outfit
        }
        return outfit
      })
    )
    
    return outfitsWithItems
  },

  // Get single outfit
  async getOne(id: string): Promise<Outfit | null> {
    return storage.getOutfit(id)
  },

  // Create outfit
  async create(data: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outfit> {
    // Ensure items array is properly formatted
    const outfitData = {
      ...data,
      items: data.items || [],
    }
    return storage.createOutfit(outfitData)
  },

  // Update outfit
  async update(id: string, data: Partial<Outfit>): Promise<Outfit> {
    return storage.updateOutfit(id, data)
  },

  // Delete outfit
  async delete(id: string): Promise<void> {
    return storage.deleteOutfit(id)
  },
}
