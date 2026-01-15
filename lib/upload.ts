// Utility functions for handling file uploads
// Stores images in public/uploads directory

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

// Ensure uploads directory exists
export function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

// Save uploaded file and return the public URL path
export async function saveUploadedFile(
  file: File,
  itemId: string
): Promise<string> {
  ensureUploadDir()

  // Get file extension
  const extension = file.name.split('.').pop() || 'jpg'
  
  // Create unique filename using item ID and timestamp
  const filename = `${itemId}-${Date.now()}.${extension}`
  const filepath = join(UPLOAD_DIR, filename)

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  await writeFile(filepath, buffer)

  // Return public URL path (relative to public directory)
  return `/uploads/${filename}`
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 5MB.',
    }
  }

  return { valid: true }
}
