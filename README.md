# Portfolio Admin Web

Admin dashboard for managing portfolio content. Includes authentication and content management features.

## Features

- JWT-based authentication
- Protected routes
- Content management dashboard
- Responsive design with Tailwind CSS + DaisyUI
- Vue.js 3 Composition API
- Pinia for state management

## Tech Stack

- **Framework**: Vue.js 3
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + DaisyUI
- **State**: Pinia
- **Router**: Vue Router
- **HTTP Client**: Axios
- **Server**: Nginx (production)

## Quick Start

### Prerequisites

- Node.js 18+
- Auth Service running
- Admin API running

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (defaults should work)

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

### Environment Variables

The `.env` file contains:

```bash
# For standalone development
VITE_API_URL=http://localhost:8083
VITE_AUTH_URL=http://localhost:8084

# When running via docker-compose infrastructure (recommended)
VITE_API_URL=http://localhost:81/api/v1
VITE_AUTH_URL=http://localhost:81/auth/v1
```

Vite automatically loads environment variables from `.env` files.

## Default Credentials

For development (set in database seeds):

- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change these credentials in production!

## Project Structure

```
admin-web/
├── public/
├── src/
│   ├── assets/
│   │   └── style.css
│   ├── components/      # Reusable components
│   ├── views/
│   │   ├── Login.vue
│   │   └── Dashboard.vue
│   ├── router/
│   │   └── index.js     # Routes with auth guards
│   ├── stores/
│   │   └── auth.js      # Auth state management
│   ├── services/
│   │   └── api.js       # API client
│   ├── App.vue
│   └── main.js
├── Dockerfile
├── nginx.conf
└── package.json
```

## Authentication Flow

1. User enters username/password on login page
2. App sends credentials to Auth Service
3. Auth Service returns JWT tokens
4. Tokens stored in localStorage
5. All API requests include JWT in Authorization header
6. Router guards protect authenticated routes

## Pages

- **Login** (`/login`) - Authentication page
- **Dashboard** (`/dashboard`) - Main content management interface

## Build for Production

```bash
npm run build
```

## Docker

### Build Image

```bash
docker build -t admin-web .
```

### Run Container

```bash
# Standalone mode
docker run -p 8081:80 \
  -e VITE_API_URL=http://localhost:8083 \
  -e VITE_AUTH_URL=http://localhost:8084 \
  admin-web

# With Traefik reverse proxy (see infrastructure repo)
docker run -p 8081:80 \
  -e VITE_API_URL=http://localhost:81/api/v1 \
  -e VITE_AUTH_URL=http://localhost:81/auth/v1 \
  admin-web
```

## Development Roadmap

The current dashboard provides a basic interface. To implement full CRUD functionality:

1. Create dedicated management pages for:
   - Profile editing
   - Work experience (list, create, edit, delete)
   - Certifications (list, create, edit, delete)
   - Miniature projects (list, create, edit, delete)
   - Image upload with S3 integration

2. Add form validation

3. Add success/error notifications

4. Add loading states

5. Add confirmation modals for delete operations

## Security

- All routes except `/login` require authentication
- JWT tokens expire after 15 minutes
- Use refresh tokens for extended sessions
- Tokens stored in localStorage (consider httpOnly cookies for production)
- HTTPS required in production

## API Integration

The app connects to:
- **Auth Service** - For login/logout
- **Admin API** - For content management (CRUD operations)

All API requests include the JWT token in the Authorization header.

## Related Repositories

- [infrastructure](https://github.com/GunarsK-portfolio/infrastructure)
- [auth-service](https://github.com/GunarsK-portfolio/auth-service)
- [admin-api](https://github.com/GunarsK-portfolio/admin-api)
- [database](https://github.com/GunarsK-portfolio/database)

## License

MIT
