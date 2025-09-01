# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Primary Frontend - Taro (qimen-taro/)
**NOTE: Taro is now the main frontend implementation. React and Vue frontends are kept as reference for code migration.**

```bash
# Install dependencies
npm install

# Development
npm run dev:h5           # H5/Web development
npm run dev:weapp        # WeChat Mini Program
npm run dev:alipay       # Alipay Mini Program
npm run dev:swan         # Baidu Mini Program

# Building
npm run build:h5         # Build for H5/Web
npm run build:weapp      # Build for WeChat
npm run build:alipay     # Build for Alipay
```

### Backend Commands (apps/backend/)
```bash
# Install dependencies
npm install

# Database management
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI

# Development
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server
npm run start:legacy     # Start legacy version

# Testing (no tests configured yet)
npm test
```

### Legacy Frontend - React (apps/frontend-react/)
**⚠️ REFERENCE ONLY: Code kept for migration reference. Not actively used.**

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start Vite dev server (port 5174)

# Building
npm run build            # Build for production
npm run build:mobile     # Build for mobile with API config
npm run preview          # Preview production build

# Mobile development
npm run mobile:build     # Build and sync for mobile
npm run mobile:android   # Open Android project
npm run mobile:ios       # Open iOS project
npm run mobile:dev:android  # Run on Android with live reload
npm run mobile:dev:ios      # Run on iOS with live reload

# Quality
npm run lint             # Run ESLint
```

### Legacy Frontend - Vue (apps/frontend-vue/)
**⚠️ REFERENCE ONLY: Code kept for migration reference. Not actively used.**

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start Vite dev server (port 5173)

# Building
npm run build            # Build for production
npm run build:github     # Build for GitHub Pages
npm run build:mobile     # Build for mobile platforms

# Mobile development
npm run android          # Build and run on Android
npm run ios              # Build and run on iOS
```


### Quick Start Development Script
```bash
# From project root
./start-dev.sh install   # Install all dependencies
./start-dev.sh start     # Interactive menu to start services
```

## High-Level Architecture

### System Overview
This is a full-stack Qimen Dunjia (奇门遁甲) divination system with AI-powered analysis, featuring:
- **Primary frontend**: Taro (multi-platform mini-programs, H5, WeChat, Alipay)
- **Legacy frontends**: React and Vue (kept as reference for migration)
- **Unified backend**: Express.js with modular architecture
- **AI Integration**: Uses Doubao AI (DeepSeek-R1 model) for intelligent analysis
- **Database**: SQLite with Prisma ORM for development, PostgreSQL-ready for production

### Backend Architecture (apps/backend/)

#### Core Entry Point
- `app.js` - Unified server entry (ES6 modules)
- `app-refactored.js` - Optimized version with better structure

#### Module Organization
```
src/
├── agents/          # AI Agent system
│   └── QimenAgent.js - Orchestrates AI analysis workflow
├── cache/           # Caching layer
│   └── CacheService.js - In-memory cache management
├── config/          # Configuration
│   ├── AppConfig.js - Environment config management
│   └── promptTemplates.js - AI prompt templates
├── controllers/     # Request handlers
│   ├── AnalysisController.js - AI analysis endpoints
│   ├── AuthController.js - Authentication logic
│   └── PointsController.js - Points system
├── routes/          # API routing
│   ├── index.js - Route aggregator
│   ├── analysisRoutes.js - Analysis endpoints
│   ├── authRoutes.js - Auth endpoints
│   └── pointsRoutes.js - Points endpoints
├── services/        # Business logic
│   ├── AIService.js - AI integration (Doubao/DeepSeek)
│   ├── InviteCodeService.js - Invitation system
│   └── PointsService.js - Points management
└── middleware/      # Express middleware
    └── index.js - Auth, rate limiting, CORS
```

#### Key Design Patterns
1. **MVC Pattern**: Controllers handle requests, services contain business logic
2. **Middleware Pipeline**: Authentication → Rate Limiting → Validation → Controller
3. **Agent Pattern**: QimenAgent orchestrates complex AI analysis workflows
4. **Repository Pattern**: Prisma abstracts database operations
5. **Dependency Injection**: Services are injected into controllers

### Frontend Architecture

#### Taro Frontend (qimen-taro/) - PRIMARY
- **Cross-platform**: Supports WeChat, Alipay, H5, Baidu mini-programs
- **State Management**: Redux Toolkit for centralized state
- **Components**: Taro Components + Custom components
- **Styling**: CSS modules for component encapsulation
- **API Integration**: Unified request service with auth interceptors
- **Build Targets**: H5, WeChat, Alipay, Baidu mini-programs

#### React Frontend (apps/frontend-react/) - LEGACY/REFERENCE
**⚠️ Kept for migration reference only. Not actively used.**
- **State Management**: Redux Toolkit with slices (auth, qimen, theme)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom components
- **Mobile**: Capacitor for iOS/Android builds
- **API Layer**: Axios with interceptors for auth

#### Vue Frontend (apps/frontend-vue/) - LEGACY/REFERENCE
**⚠️ Kept for migration reference only. Not actively used.**
- **State Management**: Pinia stores
- **Routing**: Vue Router v4
- **Styling**: Scoped CSS with theme system
- **Mobile**: Capacitor v7 for mobile apps
- **Component Structure**: Composition API

### API Integration Flow
1. **Authentication Flow**:
   - User registers/logs in → JWT token issued
   - Token stored in Redux store (Taro/React) or Pinia store (Vue legacy)
   - API client adds token to Authorization header
   - Backend validates token via middleware

2. **Qimen Analysis Flow**:
   - User submits question → Frontend calls `/api/qimen/paipan`
   - Backend generates divination chart (排盘)
   - Chart data sent to AI service
   - QimenAgent orchestrates multi-step analysis
   - Streaming response sent back to frontend

3. **Points System**:
   - New users get 1000 points on registration
   - Each AI analysis costs 100 points
   - Transaction-safe point deduction
   - Check-in system for earning points

### Database Schema (Prisma)
Key models:
- `User` - Authentication and profile
- `PointsTransaction` - Points history
- `QimenRecord` - Analysis history
- `QimenFavorite` - Saved analyses
- `InviteCode` - Registration codes
- `CheckIn` - Daily check-in records

### AI Service Architecture
- **Provider**: Doubao AI (火山引擎)
- **Model**: DeepSeek-R1-250528
- **Features**:
  - Streaming responses for real-time analysis
  - Template-based prompts for consistency
  - Context management for multi-turn conversations
  - Error handling and retry logic

### Security Measures
- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/min general, 5 req/min for auth)
- Input validation with Joi schemas
- CORS configuration for frontend origins
- SQL injection protection via Prisma ORM

### Deployment Configuration
- **Development**: SQLite database, localhost:3001
- **Production**: 
  - Server: 101.201.148.8:3001
  - Process manager: PM2
  - Reverse proxy: Nginx
  - Database: PostgreSQL-ready

### Performance Optimizations
- In-memory caching (5-minute TTL)
- Database query optimization with indexes
- Lazy loading for frontend routes (Taro)
- Code splitting for mobile builds
- Gzip compression for API responses

## Migration Notes

### Why Taro as Primary Frontend
- **Cross-platform compatibility**: Single codebase for WeChat, Alipay, H5, and other mini-programs
- **Native performance**: Better performance for mini-program platforms
- **Ecosystem support**: Strong community and plugin ecosystem in China
- **Unified development**: Reduces maintenance overhead vs. multiple frontends

### Legacy Code Usage
- React and Vue code kept for reference during migration
- UI components and business logic can be referenced from legacy code
- API integration patterns are similar across all frontends
- State management concepts translate between Redux (Taro/React) and Pinia (Vue)

## Important Coding Guidelines

### General Principles
1. **No Emojis**: Do not use emojis in code, comments, commit messages, or documentation unless explicitly requested
2. **Code Over Comments**: Write self-documenting code; comments should explain "why" not "what"
3. **Honesty Over Hacks**: If a solution isn't feasible, inform the user rather than implementing brittle workarounds
4. **Minimalist Documentation**: Generate documentation only when necessary and keep it concise

### Code Quality Standards

#### Comments
- Only add comments when they provide genuine value
- Good comments explain:
  - Complex business logic or algorithms
  - Non-obvious design decisions
  - Workarounds with their reasons
  - TODOs with context
- Avoid comments that simply restate the code:
  ```javascript
  // BAD: Increment counter by 1
  counter++;
  
  // GOOD: Reset counter after max retries to prevent overflow
  if (counter > MAX_RETRIES) {
    counter = 0;
  }
  ```

#### Documentation
- Only create documentation when explicitly requested
- Keep documentation focused and practical
- Avoid generating README files proactively
- Documentation should solve real problems, not create noise

#### Solution Integrity
- **Always inform users of limitations**:
  - If a requirement can't be met, explain why
  - Suggest viable alternatives when available
  - Never hardcode values to bypass issues without disclosure
- **Example of good practice**:
  ```javascript
  // Instead of:
  return "dummy-data"; // Hardcoding to make it "work"
  
  // Do this:
  throw new Error("API endpoint not configured. Please set QIMEN_API_URL in environment");
  ```

#### Error Handling
- Provide meaningful error messages
- Fail fast with clear explanations
- Log errors appropriately without exposing sensitive data
- Example:
  ```javascript
  if (!config.apiKey) {
    console.error('API configuration missing');
    return { error: 'Service unavailable. Please contact support.' };
  }
  ```

### Development Workflow
1. **Understand before implementing**: Read existing code patterns first
2. **Test assumptions**: Verify libraries/APIs exist before using them
3. **Communicate blockers**: Tell users about issues immediately
4. **Prefer existing solutions**: Use established patterns in the codebase
5. **Maintain consistency**: Follow the project's existing conventions

## Figma Integration Guidelines

### When working with Figma designs:
1. **Use localhost assets directly**: If localhost asset sources are provided, use them as-is without placeholders
2. **Avoid importing new icon packages**: Use existing icon libraries already in the project
3. **No placeholder assets**: When Figma provides asset URLs from localhost, implement them directly
4. **Respect design tokens**: Follow spacing, colors, and typography from Figma designs exactly