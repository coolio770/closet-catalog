// API route for outfits CRUD operations
// GET: Fetch all outfits
// POST: Create a new outfit

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// GET /api/outfits - Fetch all outfits with their items
export async function GET(request: NextRequest) {
  try {
    const outfits = await prisma.outfit.findMany({
      include: {
        items: {
          include: {
            clothingItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform the data to match our TypeScript types
    const transformedOutfits = outfits.map((outfit) => ({
      id: outfit.id,
      name: outfit.name,
      tags: parseTags(outfit.tags),
      season: outfit.season,
      notes: outfit.notes,
      createdAt: outfit.createdAt,
      updatedAt: outfit.updatedAt,
      items: outfit.items.map((outfitItem) => ({
        ...outfitItem.clothingItem,
        tags: parseTags(outfitItem.clothingItem.tags),
      })),
    }))

    return NextResponse.json(transformedOutfits)
  } catch (error) {
    console.error('Error fetching outfits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outfits' },
      { status: 500 }
    )
  }
}

// POST /api/outfits - Create a new outfit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, tags = [], season = 'ALL_SEASON', notes, itemIds = [] } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Create outfit
    const outfit = await prisma.outfit.create({
      data: {
        name,
        tags: stringifyTags(tags),
        season: season || 'ALL_SEASON',
        notes: notes || null,
      },
    })

    // Add items to outfit if provided
    if (itemIds.length > 0) {
      await prisma.outfitItem.createMany({
        data: itemIds.map((itemId: string) => ({
          outfitId: outfit.id,
          clothingItemId: itemId,
        })),
      })
    }

    // Fetch the complete outfit with items
    const completeOutfit = await prisma.outfit.findUnique({
      where: { id: outfit.id },
      include: {
        items: {
          include: {
            clothingItem: true,
          },
        },
      },
    })

    if (!completeOutfit) {
      return NextResponse.json(
        { error: 'Failed to create outfit' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: completeOutfit.id,
      name: completeOutfit.name,
      tags: parseTags(completeOutfit.tags),
      season: completeOutfit.season,
      notes: completeOutfit.notes,
      createdAt: completeOutfit.createdAt,
      updatedAt: completeOutfit.updatedAt,
      items: completeOutfit.items.map((outfitItem) => ({
        ...outfitItem.clothingItem,
        tags: parseTags(outfitItem.clothingItem.tags),
      })),
    })
  } catch (error: any) {
    console.error('Error creating outfit:', error)
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Failed to create outfit'
      : 'Failed to create outfit'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
