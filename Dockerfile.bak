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
