// API route for clothing items CRUD operations
// GET: Fetch all items (with optional filters)
// POST: Create a new item

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveUploadedFile, validateImageFile } from '@/lib/upload'

// Configure runtime - ensure Node.js runtime for file system access
export const runtime = 'nodejs'

// Type definitions (will be available after Prisma generate)
type Category = 'TOPS' | 'BOTTOMS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORIES'
type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'ALL_SEASON'

// Helper to parse tags JSON string to array
function parseTags(tagsString: string): string[] {
  try {
    return JSON.parse(tagsString)
  } catch {
    return []
  }
}

// Helper to stringify tags array to JSON string
function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags)
}

// GET /api/items - Fetch all items with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') as Category | null
    const season = searchParams.get('season') as Season | null
    const color = searchParams.get('color')
    const search = searchParams.get('search')

    // Build where clause
    // Note: SQLite doesn't support case-insensitive mode, so we use contains
    const where: {
      category?: string
      season?: string
      color?: { contains: string }
      OR?: Array<{ name?: { contains: string }; brand?: { contains: string }; color?: { contains: string } }>
    } = {}
    if (category) where.category = category
    if (season) where.season = season
    if (color) where.color = { contains: color }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { color: { contains: search } },
      ]
    }

    const items = await prisma.clothingItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Parse tags for each item
    const itemsWithParsedTags = items.map((item: {
      id: string
      name: string
      category: string
      color: string
      brand: string | null
      season: string
      fit: string | null
      material: string | null
      tags: string
      imageUrl: string | null
      createdAt: Date
      updatedAt: Date
    }) => ({
      ...item,
      tags: parseTags(item.tags),
    }))

    return NextResponse.json(itemsWithParsedTags)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

// POST /api/items - Create a new clothing item with image upload
export async function POST(request: NextRequest) {
  try {
    // Parse FormData (multipart/form-data)
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const category = formData.get('category') as Category
    const color = formData.get('color') as string
    const brand = formData.get('brand') as string | null
    const season = (formData.get('season') as Season) || 'ALL_SEASON'
    const fit = formData.get('fit') as string | null
    const material = formData.get('material') as string | null
    const tagsString = formData.get('tags') as string || ''
    const imageFile = formData.get('image') as File | null

    // Validate required fields
    if (!name || !category || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, color' },
        { status: 400 }
      )
    }

    // Validate image file (required)
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    const imageValidation = validateImageFile(imageFile)
    if (!imageValidation.valid) {
      return NextResponse.json(
        { error: imageValidation.error },
        { status: 400 }
      )
    }

    // Parse tags from comma-separated string
    const tags = tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Generate a temporary ID for the item (we'll use cuid later, but need ID for filename)
    // For now, we'll create the item first, then update it with the image
    // Actually, let's create item first to get the ID, then save image with that ID
    const tempItem = await prisma.clothingItem.create({
      data: {
        name,
        category,
        color,
        brand: brand || null,
        season: season || 'ALL_SEASON',
        fit: fit || null,
        material: material || null,
        tags: stringifyTags(tags),
        imageUrl: null, // Will update after saving image
      },
    })

    // Save uploaded image file
    const imageUrl = await saveUploadedFile(imageFile, tempItem.id)

    // Update item with image URL
    const item = await prisma.clothingItem.update({
      where: { id: tempItem.id },
      data: { imageUrl },
    })

    return NextResponse.json({
      ...item,
      tags: parseTags(item.tags),
    })
  } catch (error) {
    console.error('Error creating item:', error)
    const errorMessage = error instanceof Error
      ? (process.env.NODE_ENV === 'development' ? error.message : 'Failed to create item')
      : 'Failed to create item'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
