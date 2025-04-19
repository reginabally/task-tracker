# Use official Node.js image
FROM node:18

WORKDIR /app

# Install deps early (cache optimized)
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# Copy full app source
COPY . .

# Build the Next.js app
RUN npm run build

# Generate Prisma Client for Linux ARM inside Docker
RUN npx prisma generate

# Set environment variable
ENV NODE_ENV=production

# Make sure Node process can write to the /app/prisma directory
RUN chmod -R a+rwX /app/prisma

# Expose app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
