# UB FoodHub - Mobile Web Application

## Overview

UB FoodHub is a comprehensive mobile web application designed for the University of Batangas canteen ecosystem. The system addresses the challenges students face during limited break periods by providing a digital food ordering platform that enables pre-ordering, QR code-based pickup, and streamlined canteen operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom maroon university branding
- **Component Library**: Radix UI primitives with shadcn/ui components
- **State Management**: Context API with useReducer for user state and cart management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Mobile-First**: Responsive design with PWA capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Simple credential-based auth (session management placeholder)
- **API Design**: RESTful endpoints with proper error handling
- **Storage**: In-memory storage implementation with interface for future database integration

### Database Schema
- **Users**: Student/staff authentication with role-based access
- **Restaurants**: Canteen stalls with owner management
- **Menu Items**: Food items with categories, availability, and pricing
- **Orders**: Order management with status tracking and QR codes
- **Cart Items**: Shopping cart functionality with user sessions
- **Reviews**: Rating and feedback system for restaurants

## Key Components

### Mobile Interface
- **Bottom Navigation**: Primary navigation with cart badge
- **Restaurant Cards**: Visual menu browsing with ratings and delivery info
- **Menu Items**: Interactive food selection with quantity controls
- **Cart Management**: Real-time cart updates with floating cart indicator
- **Order Tracking**: Status-based order monitoring with QR code generation
- **Search & Filter**: Category-based filtering and text search

### Authentication System
- **Login/Register**: Dual-tab interface for user onboarding
- **Student ID Integration**: University-specific student identification
- **Role-Based Access**: Student, stall owner, and admin roles
- **Session Management**: Context-based user state persistence

### Order Management
- **Pre-Ordering**: Advanced scheduling for pickup times
- **QR Code System**: Unique codes for order verification
- **Status Tracking**: Real-time order status updates
- **Representative System**: Bulk ordering for class sections

## Data Flow

1. **User Authentication**: Login/register → Context state → Protected routes
2. **Restaurant Discovery**: API fetch → Query cache → Restaurant cards
3. **Menu Browsing**: Restaurant selection → Menu API → Category filtering
4. **Cart Operations**: Add items → Local state → API persistence
5. **Order Placement**: Cart checkout → Order API → QR code generation
6. **Order Tracking**: Status updates → Real-time notifications → Pickup confirmation

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing solution
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL serverless driver

### UI/UX Dependencies
- **@radix-ui/react-***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and developer experience
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with Drizzle migrations
- **Environment**: Node.js with environment variable configuration

### Production
- **Build Process**: Vite build for client + esbuild for server
- **Server**: Express.js serving static files and API routes
- **Database**: PostgreSQL with connection pooling
- **Deployment**: Replit hosting with automatic deployment

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Schema**: TypeScript-first with Zod validation
- **Seeding**: In-memory storage with sample data for development

## Recent Changes

### Firebase Integration & Migration (July 06, 2025)
- Migrated from Replit Agent to standard Replit environment
- Fixed Firebase duplicate app initialization errors
- Implemented proper logout functionality with Firebase signOut
- Added UB FoodHub logo to login page with maroon gradient background
- Created role-based authentication system (admin, stall_owner, student)

### Login Page Redesign (July 06, 2025)
- Redesigned login page to match user's reference design with maroon theme
- Implemented dual-mode login: social login page and email login forms
- Added beautiful animations with logo animations and loading states
- Google authentication button design (functionality coming soon)
- Email-based login and registration with proper validation

### Real-Time Data & Search (July 06, 2025)
- Removed ALL hardcoded sample data from search page
- Implemented real-time search using Firestore data
- Added recent searches functionality with localStorage
- Dynamic category filtering based on actual restaurant data
- Live data synchronization using Firestore subscriptions throughout the app

### Enhanced UX (July 06, 2025)
- Fixed logout functionality to properly clear Firebase auth and redirect
- Added loading animations with logo and spinning circles
- Implemented maroon color theme throughout the application
- Enhanced animations for login, search, and navigation

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Firebase Authentication & Firestore integration
- July 06, 2025. Role-based dashboards (Admin, Stall Owner, Student)
- July 06, 2025. Real-time data synchronization and QR code system
- July 06, 2025. Login page redesign with maroon theme and animations
- July 06, 2025. Removed all hardcoded data, implemented real-time search
- July 06, 2025. Fixed logout functionality and enhanced UX
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```