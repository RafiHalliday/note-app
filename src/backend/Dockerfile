FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

RUN npm install

# Copy all other files
COPY . .

# Build if needed (uncomment if you have a build step)
# RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]