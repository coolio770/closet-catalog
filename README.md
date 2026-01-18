# Closet Catalog

A personal web app to catalog, organize, and style outfits from your clothing collection.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (client-side browser storage)
- **AI**: OpenAI API for outfit suggestions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Optional: AI Features

To enable AI-powered outfit suggestions, set the OpenAI API key in your environment:

```bash
# Create a .env.local file
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

**Note**: The API key is exposed to the client. For production, consider using a serverless function as a proxy.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
closet-catalog/
├── app/                    # Next.js app directory
│   ├── outfit-builder/    # Outfit builder page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (closet view)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AddItemForm.tsx    # Form to add new items
│   ├── ClosetGrid.tsx     # Grid view with filters
│   ├── OutfitBuilder.tsx  # Outfit builder component
│   └── MobileNav.tsx      # Mobile navigation
├── lib/                   # Utilities
│   ├── storage.ts         # IndexedDB storage layer
│   ├── api-client.ts      # Client-side API client
│   ├── image-utils.ts     # Image handling utilities
│   └── ai-client.ts       # OpenAI API client
├── types/                 # TypeScript types
│   └── index.ts           # Shared type definitions
└── public/                # Static files
```

## Features

- ✅ Add/edit/delete clothing items
- ✅ Grid view of closet with filters (category, color, season)
- ✅ Outfit builder with drag-and-drop interface
- ✅ AI-powered outfit suggestions
- ✅ Mobile-responsive design
- ✅ Client-side storage (no backend required)

## Data Storage

All data is stored in the browser using IndexedDB. This means:
- **No database setup required** - works out of the box
- **Data persists** across browser sessions
- **Privacy-focused** - data stays on your device
- **Portable** - can deploy to any static hosting service

**Note**: Data is stored locally in your browser. Clearing browser data will remove your items.
