# Closet Catalog

A personal web app to catalog, organize, and style outfits from your clothing collection.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + SQLite
- **Image Storage**: Local file system

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Create database and tables
   npm run db:push
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
closet-catalog/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── items/         # Clothing items CRUD endpoints
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AddItemForm.tsx    # Form to add new items
│   └── ClosetGrid.tsx     # Grid view with filters
├── lib/                   # Utilities
│   └── prisma.ts          # Prisma client singleton
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema definition
├── types/                 # TypeScript types
│   └── index.ts           # Shared type definitions
└── public/                # Static files
    └── uploads/           # Uploaded images (created automatically)
```

## Features (MVP)

- ✅ Add/edit/delete clothing items
- ✅ Grid view of closet with filters (category, color, season)
- 🔜 Outfit builder screen
- 🔜 Outfit library page

## Database

The app uses SQLite for local-first development. The database file is located at `prisma/dev.db` (created automatically on first run).

To view/edit data directly, use Prisma Studio:
```bash
npm run db:studio
```
