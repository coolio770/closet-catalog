// API route for individual outfit operations
// GET /api/outfits/[id] - Get single outfit
// PUT /api/outfits/[id] - Update outfit
// DELETE /api/outfits/[id] - Delete outfit

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

// GET /api/outfits/[id] - Get a single outfit with items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outfit = await prisma.outfit.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            clothingItem: true,
          },
        },
      },
    })

    if (!outfit) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 })
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching outfit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outfit' },
      { status: 500 }
    )
  }
}

// PUT /api/outfits/[id] - Update an outfit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, tags, season, notes, itemIds } = body

    // Update outfit fields
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (tags !== undefined) updateData.tags = stringifyTags(tags)
    if (season !== undefined) updateData.season = season
    if (notes !== undefined) updateData.notes = notes

    await prisma.outfit.update({
      where: { id: params.id },
      data: updateData,
    })

    // Update items if provided
    if (itemIds !== undefined) {
      // Delete existing outfit items
      await prisma.outfitItem.deleteMany({
        where: { outfitId: params.id },
      })

      // Add new items
      if (itemIds.length > 0) {
        await prisma.outfitItem.createMany({
          data: itemIds.map((itemId: string) => ({
            outfitId: params.id,
            clothingItemId: itemId,
          })),
        })
      }
    }

    // Fetch updated outfit
    const outfit = await prisma.outfit.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            clothingItem: true,
          },
        },
      },
    })

    if (!outfit) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 })
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error updating outfit:', error)
    return NextResponse.json(
      { error: 'Failed to update outfit' },
      { status: 500 }
    )
  }
}

// DELETE /api/outfits/[id] - Delete an outfit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.outfit.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting outfit:', error)
    return NextResponse.json(
      { error: 'Failed to delete outfit' },
      { status: 500 }
    )
  }
}
