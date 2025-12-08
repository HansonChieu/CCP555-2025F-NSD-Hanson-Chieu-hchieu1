# -----------------------
# Stage 1: Build stage
# -----------------------
FROM node:22.19.0-alpine AS builder

WORKDIR /app

# Copy only package files first (to leverage caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# -----------------------
# Stage 2: Runtime stage
# -----------------------
FROM node:22.19.0-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app /app

# Set environment variables
ENV PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false 
#    HTPASSWD_FILE=./.htpasswd

# Expose the app port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]

