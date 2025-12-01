# Admin Web

![CI](https://github.com/GunarsK-portfolio/admin-web/workflows/CI/badge.svg)
[![CodeRabbit](https://img.shields.io/coderabbit/prs/github/GunarsK-portfolio/admin-web?label=CodeRabbit&color=2ea44f)](https://coderabbit.ai)

Admin panel for managing portfolio content built with Vue.js.

## Features

- User authentication (login/logout)
- Full CRUD for skills, work experience, and certifications
- Profile management with avatar and resume uploads
- Image upload management with cropping
- Protected routes with authentication
- Responsive design with Naive UI
- Modern Vue 3 UI components with reusable composables
- State management with Pinia
- Vue Router for navigation

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **UI Library**: Naive UI
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Routing**: Vue Router
- **Auth**: JWT tokens

## Prerequisites

- Node.js 22+ (LTS)
- npm 11+

## Project Structure

```text
admin-web/
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # Reusable components
│   │   └── shared/       # Shared UI components (BackButton, SearchInput, etc.)
│   ├── composables/      # Vue composables (useModal, useDataState, etc.)
│   ├── views/            # Page components (CRUD views)
│   ├── router/           # Route definitions (with auth guards)
│   ├── stores/           # Pinia stores (auth, etc.)
│   ├── services/         # API service layer
│   ├── utils/            # Utility functions (validation, CRUD helpers, etc.)
│   ├── App.vue           # Root component
│   └── main.js           # Application entry
├── public/               # Public static files
└── index.html            # HTML template
```

### Architecture Patterns

**Composables** (`src/composables/`):

- `useModal` - Modal state management for CRUD operations
- `useDataState` - Data list state (data, loading, search)
- `useViewServices` - Common services (router, message, dialog)

**Shared Components** (`src/components/shared/`):

- `BackButton` - Consistent navigation
- `SearchInput` - Reusable search with icon
- `AddButton` - Standard add button
- `ModalFooter` - Modal cancel/save footer

**CRUD Helpers** (`src/utils/`):

- `crudHelpers` - Reusable data loaders and save/delete handlers
- `validation` - Form validation rules
- `tableHelpers` - Data table renderers and sorters
- `filterHelpers` - Search filtering utilities

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

1. Create `.env` file (optional):

```env
VITE_API_URL=http://localhost:8083/api/v1
VITE_AUTH_URL=http://localhost:8084/api/v1/auth
```

1. Run development server:

```bash
npm run dev
```

1. Access at: `http://localhost:8081`

## Available Commands

Using Task:

```bash
# Development
task dev:start           # Start development server
task install             # Install dependencies

# Build
task build               # Build for production
task preview             # Preview production build
task clean               # Clean build artifacts

# Code quality
task lint                # Run ESLint
task lint:fix            # Run ESLint and auto-fix issues
task format              # Format code with Prettier
task format:check        # Check code formatting

# Security
task security:audit      # Run npm security audit (high/critical only)

# Docker
task docker:build        # Build Docker image
task docker:run          # Run in Docker container

# CI/CD
task ci:all              # Run all CI checks
```

Using npm directly:

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Environment Variables

| Variable         | Description  | Default        |
| ---------------- | ------------ | -------------- |
| `VITE_API_URL`   | Admin API    | localhost:8443 |
| `VITE_AUTH_URL`  | Auth service | localhost:8443 |
| `VITE_CERT_DIR`  | Cert dir     | certs/         |
| `VITE_CERT_FILE` | Cert file    | localhost.crt  |
| `VITE_KEY_FILE`  | Key file     | localhost.key  |

## Authentication

The app uses JWT tokens from auth-service:

1. Login via auth-service
2. Store access & refresh tokens
3. Automatically attach token to API requests
4. Refresh token when expired
5. Redirect to login on 401

Auth logic is in `src/stores/auth.js` and `src/services/auth.js`.

## Development Server

The development server runs on port 8081 and supports HTTPS if
certificates are available in `../infrastructure/docker/traefik/certs/`.

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

Routes are protected using Vue Router navigation guards. Unauthorized
users are redirected to login page.

## Styling

The application uses Naive UI components for the user interface.

## License

[MIT](LICENSE)
