// AI outfit suggestion endpoint (vision)
// Takes your stored clothing items, reads their local images, and asks a vision model to propose outfits.
// Returns JSON: { outfits: Array<{ name, itemIds, reasoning }> }

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import OpenAI from 'openai'
import sharp from 'sharp'

export const runtime = 'nodejs'

type Suggestion = {
  name: string
  itemIds: string[]
  reasoning: string
}

function parseTags(tagsString: string): string[] {
  try {
    return JSON.parse(tagsString)
  } catch {
    return []
  }
}

// Convert any image to JPEG format (universally supported by OpenAI)
async function imageUrlToDataUrl(imageUrl: string): Promise<string> {
  // imageUrl is like: /uploads/xyz.jpg
  const rel = imageUrl.replace(/^\//, '')
  const abs = join(process.cwd(), 'public', rel)
  
  try {
    // Read the image file
    const inputBuffer = await readFile(abs)
    
    // Use sharp to convert to JPEG (supports all common formats)
    // This ensures compatibility with OpenAI's vision API
    const jpegBuffer = await sharp(inputBuffer)
      .jpeg({ quality: 90 }) // Convert to JPEG with good quality
      .toBuffer()
    
    // Return as data URL with correct MIME type
    return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error)
    // Fallback: try to read as-is if sharp fails
    const buf = await readFile(abs)
    return `data:image/jpeg;base64,${buf.toString('base64')}`
  }
}

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY. Add it to a .env file and restart the dev server.' },
        { status: 500 }
      )
    }

    const items = await prisma.clothingItem.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const usable = items
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        color: item.color,
        season: item.season,
        brand: item.brand,
        material: item.material,
        tags: parseTags(item.tags),
        imageUrl: item.imageUrl,
      }))
      .filter((i) => !!i.imageUrl) as Array<{
      id: string
      name: string
      category: string
      color: string
      season: string
      brand: string | null
      material: string | null
      tags: string[]
      imageUrl: string
    }>

    if (usable.length < 2) {
      return NextResponse.json(
        { error: 'Add at least 2 clothing items with images to get AI outfit suggestions.' },
        { status: 400 }
      )
    }

    // Convert images to data URLs for the vision model
    const images = await Promise.all(
      usable.map(async (i) => ({
        id: i.id,
        dataUrl: await imageUrlToDataUrl(i.imageUrl),
      }))
    )

    const client = new OpenAI({ apiKey })

    const prompt = {
      role: 'user' as const,
      content: [
        {
          type: 'text' as const,
          text:
            'You are a personal stylist. Create 3 outfit suggestions using ONLY the provided clothing items. ' +
            'Each outfit should include a coherent combination across categories when possible (top+bottom+shoes, optional outerwear/accessory). ' +
            'Consider color harmony, season, and visual compatibility (patterns, textures). ' +
            'Return STRICT JSON only, matching this schema:\n' +
            '{ "outfits": [ { "name": string, "itemIds": string[], "reasoning": string } ] }\n' +
            'Rules:\n' +
            '- Use only itemIds that exist in the input list.\n' +
            '- itemIds array length should be 2 to 5.\n' +
            '- Do not include markdown, code fences, or any extra text outside JSON.\n\n' +
            'Here is the item list (metadata):\n' +
            JSON.stringify(
              usable.map((i) => ({
                id: i.id,
                name: i.name,
                category: i.category,
                color: i.color,
                season: i.season,
                brand: i.brand,
                material: i.material,
                tags: i.tags,
              })),
              null,
              2
            ),
        },
        ...images.map((img) => ({
          type: 'image_url' as const,
          image_url: { url: img.dataUrl },
        })),
      ],
    }

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that returns strict JSON only. You must follow the output schema exactly.',
        },
        prompt,
      ],
      temperature: 0.7,
    })

    const text = resp.choices[0]?.message?.content ?? ''
    let parsed: { outfits: Suggestion[] } | null = null
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: 'AI returned non-JSON output. Try again.', raw: text },
        { status: 502 }
      )
    }

    if (!parsed || !Array.isArray(parsed.outfits)) {
      return NextResponse.json(
        { error: 'AI returned invalid schema.', raw: parsed },
        { status: 502 }
      )
    }

    // Basic validation: ensure itemIds exist
    const validIds = new Set(usable.map((i) => i.id))
    const cleaned = parsed.outfits
      .map((o) => ({
        name: String(o.name ?? '').slice(0, 80) || 'Outfit',
        reasoning: String(o.reasoning ?? '').slice(0, 400),
        itemIds: Array.isArray(o.itemIds)
          ? o.itemIds.filter((id) => typeof id === 'string' && validIds.has(id))
          : [],
      }))
      .filter((o) => o.itemIds.length >= 2)
      .slice(0, 5)

    return NextResponse.json({ outfits: cleaned })
  } catch (error) {
    console.error('AI outfit-suggest error:', error)
    const msg = error instanceof Error
      ? (process.env.NODE_ENV === 'development' ? error.message : 'Failed to get AI suggestions')
      : 'Failed to get AI suggestions'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

