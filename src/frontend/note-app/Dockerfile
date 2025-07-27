FROM node:18-alpine as builder

# Install system dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Debug: Show directory structure
RUN ls -la


# Copy package files
COPY package*.json ./

# Debug: Verify package files
RUN ls -la package*.json

# Install dependencies with verbose output
RUN npm install --legacy-peer-deps --loglevel verbose

# Copy all files
COPY . .

# Debug: Show important files
RUN ls -la src/
RUN ls -la node_modules/

# Set build environment
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=4096

# Run build with verbose output
RUN npm run build --verbose