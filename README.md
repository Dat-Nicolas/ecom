# E-Commerce Full Stack Application

A modern full-stack e-commerce platform built with NestJS (backend) and Next.js (frontend), using PostgreSQL database and Prisma ORM.

## Project Structure

```
ecommerce-fullstack/
├── ecommerce/              # Backend API (NestJS)
│   ├── src/                # Source code
│   ├── prisma/             # Database schema & migrations
│   ├── package.json
│   └── Dockerfile
├── ecommerce-fe/           # Frontend (Next.js)
│   ├── src/                # React components & pages
│   ├── public/             # Static assets
│   ├── package.json
│   └── next.config.js
├── render.yaml             # Render deployment configuration
└── RENDER_DEPLOYMENT.md    # Detailed deployment guide
```

## Features

- **Backend**: NestJS with TypeScript
  - RESTful API with versioning
  - PostgreSQL database with Prisma ORM
  - JWT authentication with refresh tokens
  - Redis caching layer
  - Kafka event streaming
  - File upload handling
  - Email notifications
  - Payment gateway integration (VNPay)
  - Comprehensive error handling

- **Frontend**: Next.js with React
  - Server-side rendering (SSR)
  - TypeScript support
  - Responsive design with Tailwind CSS
  - State management with Zustand
  - Form handling with React Hook Form
  - API calls with Axios
  - Internationalization (i18n)
  - Dark theme support

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 12+
- Redis (optional)
- npm or yarn

### Backend Setup

```bash
cd ecommerce

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run start:dev

# API will be available at http://localhost:8080/api/v1
```

### Frontend Setup

```bash
cd ecommerce-fe

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Environment Variables

Backend (`.env`):
- Copy from `.env.example`
- Set `DATABASE_URL` to your PostgreSQL connection string
- Configure JWT secrets
- Add Redis and Kafka credentials

Frontend (`.env`):
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

### Deploy to Render

The application is configured for one-click deployment to Render using `render.yaml`.

**Quick Start:**
1. Push this repository to GitHub
2. Go to [Render Dashboard](https://render.com/dashboard)
3. Click "New +" → "Blueprint"
4. Select your GitHub repository
5. Configure environment variables
6. Deploy!

**Full Instructions**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

## API Documentation

Once the backend is running, visit:
- Swagger API Docs: `http://localhost:8080/api/swagger`
- Health Check: `http://localhost:8080/api/v1/health`

## Available Scripts

### Backend

```bash
npm run build              # Compile TypeScript
npm run start              # Start production server
npm run start:dev          # Start development server with hot reload
npm run start:debug        # Start with debugger
npm run start:prod         # Production build and start
npm test                   # Run tests
npm run test:e2e           # Run end-to-end tests
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run prisma:migrate     # Create database migration
npm run prisma:studio      # Open Prisma Studio GUI
```

### Frontend

```bash
npm run dev                # Start development server
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript type checker
```

## Database

### Prisma

This project uses Prisma as the ORM.

**Common Commands:**

```bash
npx prisma migrate dev    # Create and apply migration
npx prisma migrate deploy # Apply migrations in production
npx prisma studio         # Visual database explorer
npx prisma generate       # Generate Prisma Client
```

**Schema Location**: `ecommerce/prisma/schema.prisma`

## Technologies Used

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Kafka
- JWT Authentication
- Express.js

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Hook Form
- Axios
- i18next (Internationalization)

## Project Status

- ✅ Database schema with Prisma
- ✅ Authentication & Authorization
- ✅ API routes and controllers
- ✅ Frontend UI components
- ✅ Environment configuration
- ✅ Render deployment ready

## License

MIT

## Support

For issues, feature requests, or questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed information
3. See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for deployment help

## Next Steps

1. **Local Development**: Follow the setup guides above
2. **Database Setup**: Configure PostgreSQL and run migrations
3. **API Development**: Build your modules in `ecommerce/src/modules/`
4. **Frontend Development**: Create pages in `ecommerce-fe/src/app/`
5. **Deployment**: Use `render.yaml` to deploy to Render
