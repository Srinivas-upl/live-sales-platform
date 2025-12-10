# Use Node.js 18 LTS Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./

# Use npm install as fallback if npm ci fails (e.g., missing package-lock.json)
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production; \
    fi && npm cache clean --force

# Copy source code
COPY . .

# Create directories for SQLite database and uploads
RUN mkdir -p /app/data /app/uploads

# Expose port
EXPOSE 3001

# Set environment variable for production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
