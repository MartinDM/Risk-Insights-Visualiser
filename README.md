# Data App - User Risk Visualization

A Next.js monorepo application for visualizing user data and risk metrics on interactive maps.

## Key Features

- **Risk Data Visualization** - Display user risk scores (0-100) with categorized risk levels (Low/Medium/High)
- **Interactive Maps** - Powered by Mapbox GL JS with markers for current locations and residence history
- **Reverse Geocoding** - Automatically fetch and display address information from coordinates
- **Data Tables** - TanStack Table with sorting, filtering, and row selection
- **Monorepo Architecture** - Shared UI components, TypeScript configs, and ESLint rules

## Project Structure

```
.
├── apps/
│   └── web/           # Next.js app with data tables and maps
├── packages/
│   ├── ui/            # Shared shadcn/ui components
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── eslint-config/      # Shared ESLint rules
└── turbo.json         # Turborepo build orchestration
```

## Main Functionality

### 1. User Data Tables

- Browse generated user data with risk scores, locations, and transaction history
- Filter by risk level, date ranges, and other criteria
- Select rows to view detailed insights
- Pagination and sorting capabilities

### 2. Map Visualization

- **Mapbox Integration** - Uses Mapbox GL JS for rendering interactive maps
- **Current Location Markers** - Blue markers show users' current locations
- **Residence History** - Black house icons mark historical residence locations
- **Reverse Geocoding** - Fetches street addresses, postcodes, and countries from lat/lng coordinates
- **Interactive Popups** - Click markers to see location details, dates, and residence types

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Mapbox access token ([Get one here](https://account.mapbox.com/))

### Installation

1. **Install dependencies**

```sh
pnpm install
```

2. **Set up environment variables**

```sh
# In apps/web/.env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

3. **Run the development server**

```sh
pnpm dev
# or run specific app
pnpm --filter web dev
```

4. **Build for production**

```sh
pnpm build
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 4
- **Maps**: Mapbox GL JS
- **Tables**: TanStack Table v8
- **Data Generation**: Faker.js
- **Build Tool**: Turborepo
- **Package Manager**: pnpm

## Useful Commands

```sh
# Run linting across all packages
pnpm lint

# Build all packages
pnpm build

# Add a dependency to a specific package
pnpm add <package> --filter web

# Add a shadcn/ui component
cd apps/web
pnpm dlx shadcn@latest add <component>
```

## Monorepo Benefits

- **Shared UI Components** - Reusable shadcn/ui components in `@workspace/ui`
- **Consistent Tooling** - Centralized TypeScript and ESLint configurations
- **Faster Builds** - Turborepo caching and parallel execution

## Learn More

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [TanStack Table](https://tanstack.com/table/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js](https://nextjs.org/)
- [Turborepo](https://turbo.build/)
