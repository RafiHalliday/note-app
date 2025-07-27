FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

RUN npm install

# Copy all files except those in .dockerignore
COPY . .

# Copy production environment variables
COPY .env .env

EXPOSE 8000

CMD ["npm", "start"]