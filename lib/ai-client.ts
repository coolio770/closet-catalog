// Client-side AI outfit suggestions
// Uses OpenAI API directly from the client

'use client'

import OpenAI from 'openai'
import { ClothingItem } from '@/types'

type Suggestion = {
  name: string
  itemIds: string[]
  reasoning: string
}

export async function suggestOutfits(items: ClothingItem[]): Promise<Suggestion[]> {
  // Note: For production, consider using a server-side API route to protect your API key
  // For now, we use NEXT_PUBLIC_ prefix to expose it to the client
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
  }

  if (items.length === 0) {
    return []
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  })

  // Convert items to a description for the AI
  const itemsDescription = items
    .map(
      (item) =>
        `- ${item.name} (${item.category}, ${item.color}${item.brand ? `, ${item.brand}` : ''}, ${item.season})`
    )
    .join('\n')

  const prompt = `You are a fashion stylist. Given these clothing items, suggest 3-5 outfit combinations.

Items available:
${itemsDescription}

For each outfit suggestion, provide:
1. A creative name for the outfit
2. Which items to combine (by their names)
3. Brief reasoning for why these items work together

Return ONLY valid JSON in this exact format:
{
  "outfits": [
    {
      "name": "Outfit Name",
      "itemIds": ["item-id-1", "item-id-2"],
      "reasoning": "Why these items work together"
    }
  ]
}

Important:
- Use the exact item IDs from the list above
- Create 3-5 outfit suggestions
- Mix different categories (tops, bottoms, outerwear, shoes, accessories)
- Consider color coordination and season
- Do not include markdown, code fences, or any extra text outside JSON.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a fashion stylist. Return only valid JSON, no markdown, no code fences, no explanations outside the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.outfits || []
  } catch (error) {
    console.error('AI suggestion error:', error)
    throw error
  }
}
