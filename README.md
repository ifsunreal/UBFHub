# UB FoodHub - University of Batangas Mobile Food Ordering Platform

## 🎯 Overview
UB FoodHub is a comprehensive mobile web application designed specifically for the University of Batangas canteen ecosystem. The platform streamlines the food ordering process for students, faculty, and staff by providing a digital solution that eliminates long queues and waiting times during limited break periods.

## ✨ Key Features

### 🔐 Authentication System
- **Firebase Authentication** with Google sign-in integration (coming soon)
- **Role-based access control** (Student, Stall Owner, Admin)
- **Email-based registration** with validation
- **Secure session management** with automatic logout
- **Beautiful login interface** with UB maroon color theme

### 🏪 Restaurant/Stall Management
- **Real-time stall listings** from Firestore database
- **Dynamic menu management** for stall owners
- **Category-based filtering** (Filipino, Asian, Beverages, etc.)
- **Stall status management** (active/inactive)
- **Rating and review system**

### 🛒 Shopping & Ordering
- **Real-time cart management** with Firebase persistence
- **QR code generation** for order pickup verification
- **Order status tracking** (pending, preparing, ready, completed)
- **Pre-ordering functionality** for scheduled pickup
- **Bulk ordering system** for class representatives

### 🔍 Search & Discovery
- **Real-time search** across restaurants and menu items
- **Category filtering** with dynamic counts
- **Recent searches** with localStorage persistence
- **Popular categories** based on actual data
- **No hardcoded sample data** - everything loads from Firestore

### 📱 Mobile-First Design
- **Responsive design** optimized for mobile devices
- **Bottom navigation** for easy thumb navigation
- **Smooth animations** with Framer Motion
- **Loading states** with logo animations
- **Dark red/maroon theme** matching university branding

### 🏛️ Administrative Features
- **Admin Dashboard** for complete system oversight
- **User management** with role assignments
- **Order monitoring** and status updates
- **Stall approval** and management system
- **Analytics and reporting** capabilities

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom maroon university branding
- **Radix UI** primitives with shadcn/ui components
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing
- **Framer Motion** for smooth animations
- **Firebase SDK** for authentication and Firestore

### Backend Integration
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management
- **Real-time subscriptions** for live data updates
- **Server-side rendering** support with Express.js

### Development Tools
- **TypeScript** for type safety
- **ESLint & Prettier** for code quality
- **Drizzle ORM** for type-safe database operations
- **Zod** for runtime validation

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express.js backend (legacy)
├── shared/                 # Shared types and schemas
├── attached_assets/        # Project assets and images
└── public/                 # Static files
```

## 🎨 Design System

### Color Palette
- **Primary**: Maroon/Dark Red (#B91C1C) - University signature color
- **Secondary**: Various maroon shades (50-900)
- **Accent**: Complementary colors for highlights
- **Neutral**: Gray scales for text and backgrounds

### Typography
- **Headers**: Bold, clear hierarchy
- **Body**: Readable, accessible fonts
- **Buttons**: Medium weight, proper contrast

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Consistent maroon theme
- **Forms**: Clean, validated inputs
- **Navigation**: Mobile-optimized bottom nav

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Firebase project setup
- Replit account (for deployment)

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📊 Database Schema

### Collections
- **users**: User profiles with role management
- **stalls**: Restaurant/stall information
- **menuItems**: Food items with categories and pricing
- **orders**: Order tracking with QR codes
- **cartItems**: Shopping cart persistence
- **reviews**: Rating and feedback system

## 🔄 Recent Updates (January 2025)

### Authentication Improvements
- ✅ Fixed Firebase duplicate app initialization
- ✅ Implemented proper logout functionality
- ✅ Added role-based dashboard routing
- ✅ Enhanced security with session management

### UI/UX Enhancements
- ✅ Redesigned login page with maroon theme
- ✅ Added smooth animations and transitions
- ✅ Implemented mobile-responsive design
- ✅ Created loading states with logo animations

### Data Management
- ✅ Removed all hardcoded sample data
- ✅ Implemented real-time Firestore integration
- ✅ Added dynamic search functionality
- ✅ Created category-based filtering system

### Performance Optimizations
- ✅ Optimized mobile compatibility
- ✅ Reduced bundle size with code splitting
- ✅ Implemented efficient state management
- ✅ Added proper error boundaries

## 🎯 User Roles & Permissions

### Students
- Browse restaurants and menus
- Place orders and track status
- Manage cart and favorites
- View order history
- Rate and review stalls

### Stall Owners
- Manage menu items and pricing
- Process incoming orders
- Update stall information
- View sales analytics
- Manage stall availability

### Administrators
- Oversee entire system
- Manage user accounts
- Monitor all orders
- Approve new stalls
- Access system analytics

## 🚀 Deployment

### Replit Deployment
1. Import project to Replit
2. Configure environment variables
3. Run the "Start application" workflow
4. Deploy using Replit's deployment system

### Firebase Configuration
1. Create Firebase project
2. Enable Authentication and Firestore
3. Add web app configuration
4. Set up security rules

## 🔐 Security Features

- **Role-based access control** with Firebase Auth
- **Data validation** with Zod schemas
- **Secure API endpoints** with proper authentication
- **XSS protection** with sanitized inputs
- **CSRF protection** with proper tokens

## 📱 Mobile Compatibility

- **Responsive design** works on all screen sizes
- **Touch-optimized** buttons and navigation
- **Fast loading** with optimized images
- **Offline capability** with service workers (planned)
- **PWA features** for app-like experience

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 📄 License

This project is developed for the University of Batangas. All rights reserved.

---

**UB FoodHub** - Revolutionizing campus dining through technology 🍽️📱