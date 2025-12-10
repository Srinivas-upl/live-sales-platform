# Multi-stage build for React frontend

# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
# Use npm install as fallback if npm ci fails (e.g., missing package-lock.json)
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy source code and environment files
COPY . .

# Use production environment file if it exists
RUN if [ -f .env.production ]; then \
      cp .env.production .env; \
    fi

# Build the application
RUN npm run build

# Stage 2: Serve the built app with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
