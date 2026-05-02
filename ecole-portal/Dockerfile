# ------------------------------
# Stage 1: Base Node image
# ------------------------------
FROM node:18 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ------------------------------
# Stage 2: Development
# ------------------------------
FROM base AS dev
EXPOSE 3000
ENV CHOKIDAR_USEPOLLING=true
CMD ["npm", "start"]

# ------------------------------
# Stage 3: Test
# ------------------------------
FROM base AS test
EXPOSE 3001
ENV NODE_ENV=test
CMD ["npm", "start"]

# ------------------------------
# Stage 4: Build production
# ------------------------------
FROM base AS build
ENV NODE_ENV=production
ENV REACT_APP_API_GATEWAY_URL=${REACT_APP_API_GATEWAY_URL}
RUN npm run build

# ------------------------------
# Stage 5: Production - Serve via Node
# ------------------------------
FROM node:18-alpine AS prod
WORKDIR /app

# Install 'serve' globally
RUN npm install -g serve

# Copy build folder from previous stage
COPY --from=build /app/build ./build

# Expose port 80
EXPOSE 80

# Start the server
CMD ["serve", "-s", "build", "-l", "80"]
