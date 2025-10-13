# Admin Web

Admin panel for managing portfolio content built with Vue.js.

## Features

- User authentication (login/logout)
- Full CRUD for projects, skills, experience
- Image upload management
- Protected routes with authentication
- Responsive design with TailwindCSS
- DaisyUI components
- State management with Pinia
- Vue Router for navigation

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: TailwindCSS + DaisyUI
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Routing**: Vue Router
- **Auth**: JWT tokens

## Prerequisites

- Node.js 18+
- npm or yarn

## Project Structure

```
admin-web/
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # Reusable components
│   ├── views/            # Page components
│   ├── router/           # Route definitions (with auth guards)
│   ├── stores/           # Pinia stores (auth, etc.)
│   ├── services/         # API service layer
│   ├── App.vue           # Root component
│   └── main.js           # Application entry
├── public/               # Public static files
└── index.html            # HTML template
```

## Quick Start

### Using Docker Compose

```bash
docker-compose up -d
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:8083/api/v1
VITE_AUTH_URL=http://localhost:8084/api/v1/auth
```

3. Run development server:
```bash
npm run dev
```

4. Access at: `http://localhost:8081`

## Available Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Admin API base URL | `https://localhost:8443/admin-api/v1` |
| `VITE_AUTH_URL` | Auth service base URL | `https://localhost:8443/auth/v1` |
| `VITE_CERT_DIR` | Certificate directory for HTTPS dev server | `../infrastructure/docker/traefik/certs` |
| `VITE_CERT_FILE` | Certificate filename | `localhost.crt` |
| `VITE_KEY_FILE` | Private key filename | `localhost.key` |

## Authentication

The app uses JWT tokens from auth-service:
1. Login via auth-service
2. Store access & refresh tokens
3. Automatically attach token to API requests
4. Refresh token when expired
5. Redirect to login on 401

Auth logic is in `src/stores/auth.js` and `src/services/auth.js`.

## Development Server

The development server runs on port 8081 and supports HTTPS if certificates are available in `../infrastructure/docker/traefik/certs/`.

## Building for Production

```bash
npm run build
```

Output is in the `dist/` directory.

## Deployment

The app is containerized with nginx:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

## API Integration

The app connects to two services:
- **auth-service**: Authentication (login, refresh, logout)
- **admin-api**: Portfolio content management (CRUD operations)

API service configuration is in `src/services/`.

## Route Protection

Routes are protected using Vue Router navigation guards. Unauthorized users are redirected to login page.

## Styling

TailwindCSS utilities and DaisyUI components are used throughout. Configure themes in [tailwind.config.js](tailwind.config.js).

## License

MIT
