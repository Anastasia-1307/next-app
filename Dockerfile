# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.13.0

FROM node:${NODE_VERSION}-alpine

# Install Bun
RUN npm install -g bun

WORKDIR /usr/src/app

# Install deps first (cache friendly)
COPY package.json ./
RUN bun install

# Copy source
COPY . .

# Expose the port
EXPOSE 3000

# Run the application in development mode
CMD ["bun", "run", "dev"]
