// API route for individual clothing item operations
// GET /api/items/[id] - Get single item
// PUT /api/items/[id] - Update item
// DELETE /api/items/[id] - Delete item

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

// GET /api/items/[id] - Get a single item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.clothingItem.findUnique({
      where: { id: params.id },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...item,
      tags: parseTags(item.tags),
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

// PUT /api/items/[id] - Update an item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      category,
      color,
      brand,
      season,
      fit,
      material,
      tags,
      imageUrl,
    } = body

    const updateData: {
      name?: string
      category?: string
      color?: string
      brand?: string | null
      season?: string
      fit?: string | null
      material?: string | null
      tags?: string
      imageUrl?: string | null
    } = {}
    if (name !== undefined) updateData.name = name
    if (category !== undefined) updateData.category = category
    if (color !== undefined) updateData.color = color
    if (brand !== undefined) updateData.brand = brand
    if (season !== undefined) updateData.season = season
    if (fit !== undefined) updateData.fit = fit
    if (material !== undefined) updateData.material = material
    if (tags !== undefined) updateData.tags = stringifyTags(tags)
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl

    const item = await prisma.clothingItem.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      ...item,
      tags: parseTags(item.tags),
    })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.clothingItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
