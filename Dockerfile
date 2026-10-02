# Dockerfile for mining-marketplace
FROM node:20-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Create app directory
RUN mkdir -p /home/nextjs/app && chown -R nextjs:nodejs /home/nextjs/app

# Copy source
COPY src/ ./src/

# Change ownership to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/index.js"]