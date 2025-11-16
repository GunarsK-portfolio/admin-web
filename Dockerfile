# Build stage
FROM node:22.21.1-alpine AS builder

WORKDIR /app

# Update Alpine packages to get latest security fixes
RUN apk update && apk upgrade --no-cache

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build arguments
ARG VITE_API_URL
ARG VITE_AUTH_URL
ARG VITE_FILES_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_FILES_API_URL=$VITE_FILES_API_URL

# Build for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Update Alpine packages to get latest security fixes
RUN apk update && apk upgrade --no-cache

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
