#!/bin/bash

# Script to switch between production and development modes

MODE=$1

if [ "$MODE" != "dev" ] && [ "$MODE" != "prod" ]; then
  echo "Usage: ./switch-mode.sh [dev|prod]"
  echo "  dev: Switch to development mode"
  echo "  prod: Switch to production mode"
  exit 1
fi

# Make backup copies of the configuration files
cp Dockerfile Dockerfile.bak
cp docker-compose.yml docker-compose.yml.bak

if [ "$MODE" = "dev" ]; then
  echo "Switching to development mode..."
  
  # Create new Dockerfile with development settings
  cat > Dockerfile << 'EOF'
# Use official Node.js image
FROM node:18

WORKDIR /app

# Install deps early (cache optimized)
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# Copy full app source
COPY . .

# =====================================================
# PRODUCTION BUILD STEP
# Uncomment for production mode and comment for development mode
# =====================================================
# Build the Next.js app
# RUN npm run build

# =====================================================
# ENVIRONMENT SETUP
# Toggle between production and development as needed
# =====================================================
# For production mode, uncomment:
# ENV NODE_ENV=production

# For development mode, uncomment:
ENV NODE_ENV=development

# Generate Prisma Client for Linux ARM inside Docker
RUN npx prisma generate

# Make sure Node process can write to the /app/prisma directory
RUN chmod -R a+rwX /app/prisma

# Expose app port
EXPOSE 3000

# =====================================================
# DEFAULT START COMMAND
# The actual command can be overridden in docker-compose.yml
# =====================================================
# This command starts the production server
CMD ["npm", "start"]
# For development server, override in docker-compose.yml with: npm run dev
EOF

  # Create new docker-compose.yml with development settings
  cat > docker-compose.yml << 'EOF'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env

    # =====================================================
    # DEVELOPMENT MODE CONFIGURATION
    # Uncomment these lines for development mode
    # =====================================================
    volumes:
      - .:/app
      - /app/node_modules  # Don't override node_modules
      - /app/.next  # Don't override .next directory
    command: npm run dev  # Run in development mode

    # =====================================================
    # PRODUCTION MODE CONFIGURATION
    # Uncomment these lines for production mode and comment out the development section above
    # =====================================================
    # volumes:
    #   - ./src:/app/src  # Only mount source code
    #   - ./public:/app/public  # For public assets
    #   - ./prisma:/app/prisma  # For database files
    # Command is not needed here as it will use the default from Dockerfile (npm start)
EOF

elif [ "$MODE" = "prod" ]; then
  echo "Switching to production mode..."
  
  # Create new Dockerfile with production settings
  cat > Dockerfile << 'EOF'
# Use official Node.js image
FROM node:18

WORKDIR /app

# Install deps early (cache optimized)
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# Copy full app source
COPY . .

# =====================================================
# PRODUCTION BUILD STEP
# Uncomment for production mode and comment for development mode
# =====================================================
# Build the Next.js app
RUN npm run build

# =====================================================
# ENVIRONMENT SETUP
# Toggle between production and development as needed
# =====================================================
# For production mode, uncomment:
ENV NODE_ENV=production

# For development mode, uncomment:
# ENV NODE_ENV=development

# Generate Prisma Client for Linux ARM inside Docker
RUN npx prisma generate

# Make sure Node process can write to the /app/prisma directory
RUN chmod -R a+rwX /app/prisma

# Expose app port
EXPOSE 3000

# =====================================================
# DEFAULT START COMMAND
# The actual command can be overridden in docker-compose.yml
# =====================================================
# This command starts the production server
CMD ["npm", "start"]
# For development server, override in docker-compose.yml with: npm run dev
EOF

  # Create new docker-compose.yml with production settings
  cat > docker-compose.yml << 'EOF'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env

    # =====================================================
    # DEVELOPMENT MODE CONFIGURATION
    # Uncomment these lines for development mode
    # =====================================================
    # volumes:
    #   - .:/app
    #   - /app/node_modules  # Don't override node_modules
    #   - /app/.next  # Don't override .next directory
    # command: npm run dev  # Run in development mode

    # =====================================================
    # PRODUCTION MODE CONFIGURATION
    # Uncomment these lines for production mode and comment out the development section above
    # =====================================================
    volumes:
      - ./src:/app/src  # Only mount source code
      - ./public:/app/public  # For public assets
      - ./prisma:/app/prisma  # For database files
    # Command is not needed here as it will use the default from Dockerfile (npm start)
EOF

fi

echo "Configuration updated. Please rebuild your Docker containers:"
echo "  docker compose down"
echo "  docker compose build"
echo "  docker compose up" 