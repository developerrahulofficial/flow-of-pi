# Use Node 20 as base
FROM node:20-slim

# Install system dependencies for node-canvas
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
