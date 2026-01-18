// Test data generator for development/debugging
// Preloads a full wardrobe into IndexedDB

import { ClothingItem, Category, Season, Fit } from '@/types'
import { storage } from './storage'

// Generate a simple colored image as data URL
// Must be called client-side (browser context)
function generateColorImage(color: string, width = 400, height = 400): string {
  if (typeof document === 'undefined') {
    // Fallback for server-side (shouldn't happen, but just in case)
    return ''
  }
  
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  // Fill with color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  
  // Add a subtle border
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, width - 2, height - 2)
  
  return canvas.toDataURL('image/png')
}

// Color mappings for different item types
const colorMap: Record<string, string> = {
  'Black': '#1a1a1a',
  'White': '#f5f5f5',
  'Navy': '#1e3a5f',
  'Grey': '#808080',
  'Beige': '#f5f5dc',
  'Olive': '#556b2f',
  'Brown': '#8b4513',
  'Red': '#cc0000',
  'Blue': '#0066cc',
  'Green': '#228b22',
  'Tan': '#d2b48c',
  'Charcoal': '#36454f',
  'Cream': '#fffdd0',
}

export async function loadTestData(): Promise<void> {
  const testItems: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // TOPS
    { name: 'Classic White T-Shirt', category: 'TOPS' as Category, color: 'White', brand: 'Basic Brand', season: 'ALL_SEASON' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['casual', 'essential'], imageUrl: generateColorImage(colorMap['White']) },
    { name: 'Black Crew Neck', category: 'TOPS' as Category, color: 'Black', brand: 'Basic Brand', season: 'ALL_SEASON' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['casual', 'essential'], imageUrl: generateColorImage(colorMap['Black']) },
    { name: 'Navy Polo Shirt', category: 'TOPS' as Category, color: 'Navy', brand: 'Classic Co', season: 'ALL_SEASON' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['smart-casual'], imageUrl: generateColorImage(colorMap['Navy']) },
    { name: 'Grey Henley', category: 'TOPS' as Category, color: 'Grey', brand: 'Casual Wear', season: 'ALL_SEASON' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['casual'], imageUrl: generateColorImage(colorMap['Grey']) },
    { name: 'Olive Green Tee', category: 'TOPS' as Category, color: 'Olive', brand: 'Outdoor Co', season: 'FALL' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['casual', 'outdoor'], imageUrl: generateColorImage(colorMap['Olive']) },
    { name: 'Long Sleeve Button-Up', category: 'TOPS' as Category, color: 'Blue', brand: 'Formal Co', season: 'ALL_SEASON' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['formal', 'office'], imageUrl: generateColorImage(colorMap['Blue']) },
    { name: 'Red Flannel Shirt', category: 'TOPS' as Category, color: 'Red', brand: 'Outdoor Co', season: 'FALL' as Season, fit: 'REGULAR' as Fit, material: 'Flannel', tags: ['casual', 'fall'], imageUrl: generateColorImage(colorMap['Red']) },
    
    // BOTTOMS
    { name: 'Dark Wash Jeans', category: 'BOTTOMS' as Category, color: 'Navy', brand: 'Denim Co', season: 'ALL_SEASON' as Season, fit: 'REGULAR' as Fit, material: 'Denim', tags: ['casual', 'essential'], imageUrl: generateColorImage(colorMap['Navy']) },
    { name: 'Black Slim Fit Jeans', category: 'BOTTOMS' as Category, color: 'Black', brand: 'Denim Co', season: 'ALL_SEASON' as Season, fit: 'TIGHT' as Fit, material: 'Denim', tags: ['casual', 'slim'], imageUrl: generateColorImage(colorMap['Black']) },
    { name: 'Grey Chinos', category: 'BOTTOMS' as Category, color: 'Grey', brand: 'Casual Wear', season: 'ALL_SEASON' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['smart-casual'], imageUrl: generateColorImage(colorMap['Grey']) },
    { name: 'Beige Trousers', category: 'BOTTOMS' as Category, color: 'Beige', brand: 'Formal Co', season: 'SPRING' as Season, fit: 'REGULAR' as Fit, material: 'Wool', tags: ['formal', 'office'], imageUrl: generateColorImage(colorMap['Beige']) },
    { name: 'Olive Cargo Pants', category: 'BOTTOMS' as Category, color: 'Olive', brand: 'Outdoor Co', season: 'FALL' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['casual', 'outdoor'], imageUrl: generateColorImage(colorMap['Olive']) },
    { name: 'Navy Shorts', category: 'BOTTOMS' as Category, color: 'Navy', brand: 'Casual Wear', season: 'SUMMER' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['casual', 'summer'], imageUrl: generateColorImage(colorMap['Navy']) },
    
    // OUTERWEAR
    { name: 'Black Leather Jacket', category: 'OUTERWEAR' as Category, color: 'Black', brand: 'Classic Co', season: 'FALL' as Season, fit: 'REGULAR' as Fit, material: 'Leather', tags: ['casual', 'statement'], imageUrl: generateColorImage(colorMap['Black']) },
    { name: 'Navy Peacoat', category: 'OUTERWEAR' as Category, color: 'Navy', brand: 'Formal Co', season: 'WINTER' as Season, fit: 'REGULAR' as Fit, material: 'Wool', tags: ['formal', 'winter'], imageUrl: generateColorImage(colorMap['Navy']) },
    { name: 'Beige Trench Coat', category: 'OUTERWEAR' as Category, color: 'Beige', brand: 'Classic Co', season: 'SPRING' as Season, fit: 'REGULAR' as Fit, material: 'Cotton', tags: ['formal', 'spring'], imageUrl: generateColorImage(colorMap['Beige']) },
    { name: 'Grey Hoodie', category: 'OUTERWEAR' as Category, color: 'Grey', brand: 'Casual Wear', season: 'FALL' as Season, fit: 'OVERSIZED' as Fit, material: 'Cotton', tags: ['casual', 'comfortable'], imageUrl: generateColorImage(colorMap['Grey']) },
    { name: 'Brown Bomber Jacket', category: 'OUTERWEAR' as Category, color: 'Brown', brand: 'Outdoor Co', season: 'FALL' as Season, fit: 'REGULAR' as Fit, material: 'Nylon', tags: ['casual', 'fall'], imageUrl: generateColorImage(colorMap['Brown']) },
    
    // SHOES
    { name: 'White Sneakers', category: 'SHOES' as Category, color: 'White', brand: 'Sneaker Co', season: 'ALL_SEASON' as Season, fit: null, material: 'Canvas', tags: ['casual', 'essential'], imageUrl: generateColorImage(colorMap['White']) },
    { name: 'Black Leather Boots', category: 'SHOES' as Category, color: 'Black', brand: 'Shoe Co', season: 'FALL' as Season, fit: null, material: 'Leather', tags: ['casual', 'fall'], imageUrl: generateColorImage(colorMap['Black']) },
    { name: 'Brown Oxfords', category: 'SHOES' as Category, color: 'Brown', brand: 'Formal Co', season: 'ALL_SEASON' as Season, fit: null, material: 'Leather', tags: ['formal', 'office'], imageUrl: generateColorImage(colorMap['Brown']) },
    { name: 'Navy Boat Shoes', category: 'SHOES' as Category, color: 'Navy', brand: 'Casual Wear', season: 'SUMMER' as Season, fit: null, material: 'Leather', tags: ['casual', 'summer'], imageUrl: generateColorImage(colorMap['Navy']) },
    { name: 'Charcoal Dress Shoes', category: 'SHOES' as Category, color: 'Charcoal', brand: 'Formal Co', season: 'ALL_SEASON' as Season, fit: null, material: 'Leather', tags: ['formal'], imageUrl: generateColorImage(colorMap['Charcoal']) },
    
    // ACCESSORIES
    { name: 'Black Leather Belt', category: 'ACCESSORIES' as Category, color: 'Black', brand: 'Accessories Co', season: 'ALL_SEASON' as Season, fit: null, material: 'Leather', tags: ['essential'], imageUrl: generateColorImage(colorMap['Black']) },
    { name: 'Brown Leather Belt', category: 'ACCESSORIES' as Category, color: 'Brown', brand: 'Accessories Co', season: 'ALL_SEASON' as Season, fit: null, material: 'Leather', tags: ['essential'], imageUrl: generateColorImage(colorMap['Brown']) },
    { name: 'Beige Canvas Watch', category: 'ACCESSORIES' as Category, color: 'Beige', brand: 'Watch Co', season: 'ALL_SEASON' as Season, fit: null, material: 'Canvas', tags: ['casual'], imageUrl: generateColorImage(colorMap['Beige']) },
    { name: 'Navy Baseball Cap', category: 'ACCESSORIES' as Category, color: 'Navy', brand: 'Casual Wear', season: 'SUMMER' as Season, fit: null, material: 'Cotton', tags: ['casual', 'summer'], imageUrl: generateColorImage(colorMap['Navy']) },
  ]

  // Clear existing items first (optional - you can remove this if you want to keep existing items)
  const existingItems = await storage.getItems()
  for (const item of existingItems) {
    await storage.deleteItem(item.id)
  }

  // Add all test items
  for (const item of testItems) {
    await storage.createItem(item)
  }
}
