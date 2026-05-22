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

ENV NODE_ENV=test
CMD ["npm", "test"]

# ------------------------------
# Stage 4: Build production
# ------------------------------
FROM base AS build

ENV NODE_ENV=production
RUN npm run build

# ------------------------------
# Stage 5: Production (NGINX)
# ------------------------------
FROM nginx:alpine AS prod

# remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# copy build output
COPY --from=build /app/build /usr/share/nginx/html

# SPA routing config (IMPORTANT)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]