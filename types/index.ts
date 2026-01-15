// TypeScript types for the Closet Catalog app
// Note: SQLite doesn't support enums, so we use string literal types

// Type definitions (SQLite doesn't support enums, so we use string literals)
export type Category = 'TOPS' | 'BOTTOMS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORIES'
export type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'ALL_SEASON'
export type Fit = 'TIGHT' | 'REGULAR' | 'LOOSE' | 'OVERSIZED'

// ClothingItem type (matches Prisma model)
export interface ClothingItem {
  id: string
  name: string
  category: Category
  color: string
  brand: string | null
  season: Season
  fit: Fit | null
  material: string | null
  tags: string[] // Parsed from JSON string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

// Outfit type (matches Prisma model)
export interface Outfit {
  id: string
  name: string
  tags: string[] // Parsed from JSON string
  season: Season
  notes: string | null
  createdAt: Date
  updatedAt: Date
  items?: ClothingItem[] // Populated when fetching outfit with items
}

// Form data types for creating/editing items
export interface ClothingItemFormData {
  name: string
  category: Category
  color: string
  brand?: string
  season: Season
  fit?: Fit
  material?: string
  tags: string[]
  imageUrl?: string
}

// Filter options for closet grid
export interface ClosetFilters {
  category?: Category
  season?: Season
  color?: string
  search?: string
}
