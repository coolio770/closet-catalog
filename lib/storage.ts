// Client-side storage using IndexedDB
// Stores all clothing items and outfits locally in the browser

import { ClothingItem, Outfit } from '@/types'

const DB_NAME = 'closet-catalog'
const DB_VERSION = 1
const STORE_ITEMS = 'clothingItems'
const STORE_OUTFITS = 'outfits'

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        const itemsStore = db.createObjectStore(STORE_ITEMS, { keyPath: 'id' })
        itemsStore.createIndex('category', 'category', { unique: false })
        itemsStore.createIndex('season', 'season', { unique: false })
        itemsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_OUTFITS)) {
        const outfitsStore = db.createObjectStore(STORE_OUTFITS, { keyPath: 'id' })
        outfitsStore.createIndex('season', 'season', { unique: false })
        outfitsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

// Clothing Items CRUD
export const storage = {
  // Get all items
  async getItems(filters?: {
    category?: string
    season?: string
    color?: string
    search?: string
  }): Promise<ClothingItem[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ITEMS], 'readonly')
      const store = transaction.objectStore(STORE_ITEMS)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        let items: ClothingItem[] = request.result || []

        // Apply filters
        if (filters) {
          if (filters.category) {
            items = items.filter((item) => item.category === filters.category)
          }
          if (filters.season) {
            items = items.filter((item) => item.season === filters.season)
          }
          if (filters.color) {
            items = items.filter((item) =>
              item.color.toLowerCase().includes(filters.color!.toLowerCase())
            )
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            items = items.filter(
              (item) =>
                item.name.toLowerCase().includes(searchLower) ||
                item.brand?.toLowerCase().includes(searchLower) ||
                item.color.toLowerCase().includes(searchLower)
            )
          }
        }

        // Sort by createdAt descending
        items.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateB - dateA
        })

        resolve(items)
      }
    })
  },

  // Get single item
  async getItem(id: string): Promise<ClothingItem | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ITEMS], 'readonly')
      const store = transaction.objectStore(STORE_ITEMS)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  },

  // Create item
  async createItem(item: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClothingItem> {
    const db = await openDB()
    const newItem: ClothingItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ITEMS], 'readwrite')
      const store = transaction.objectStore(STORE_ITEMS)
      const request = store.add(newItem)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(newItem)
    })
  },

  // Update item
  async updateItem(id: string, updates: Partial<ClothingItem>): Promise<ClothingItem> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ITEMS], 'readwrite')
      const store = transaction.objectStore(STORE_ITEMS)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const existing = getRequest.result
        if (!existing) {
          reject(new Error('Item not found'))
          return
        }

        const updated: ClothingItem = {
          ...existing,
          ...updates,
          id, // Ensure ID doesn't change
          updatedAt: new Date().toISOString(),
        }

        const putRequest = store.put(updated)
        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve(updated)
      }
    })
  },

  // Delete item
  async deleteItem(id: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ITEMS], 'readwrite')
      const store = transaction.objectStore(STORE_ITEMS)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  },

  // Get all outfits
  async getOutfits(): Promise<Outfit[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_OUTFITS], 'readonly')
      const store = transaction.objectStore(STORE_OUTFITS)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const outfits: Outfit[] = request.result || []
        // Sort by createdAt descending
        outfits.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateB - dateA
        })
        resolve(outfits)
      }
    })
  },

  // Get single outfit
  async getOutfit(id: string): Promise<Outfit | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_OUTFITS], 'readonly')
      const store = transaction.objectStore(STORE_OUTFITS)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  },

  // Create outfit
  async createOutfit(outfit: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outfit> {
    const db = await openDB()
    const newOutfit: Outfit = {
      ...outfit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_OUTFITS], 'readwrite')
      const store = transaction.objectStore(STORE_OUTFITS)
      const request = store.add(newOutfit)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(newOutfit)
    })
  },

  // Update outfit
  async updateOutfit(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_OUTFITS], 'readwrite')
      const store = transaction.objectStore(STORE_OUTFITS)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const existing = getRequest.result
        if (!existing) {
          reject(new Error('Outfit not found'))
          return
        }

        const updated: Outfit = {
          ...existing,
          ...updates,
          id, // Ensure ID doesn't change
          updatedAt: new Date().toISOString(),
        }

        const putRequest = store.put(updated)
        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve(updated)
      }
    })
  },

  // Delete outfit
  async deleteOutfit(id: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_OUTFITS], 'readwrite')
      const store = transaction.objectStore(STORE_OUTFITS)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  },
}
