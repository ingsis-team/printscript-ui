# syntax=docker/dockerfile:1.4

# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Mount secrets and create .env file only during build
RUN --mount=type=secret,id=VITE_AUTH0_DOMAIN \
    --mount=type=secret,id=VITE_AUTH0_CLIENT_ID \
    --mount=type=secret,id=VITE_AUTH0_AUDIENCE \
    --mount=type=secret,id=BACKEND_URL \
    --mount=type=secret,id=VITE_PRINTSCRIPT_SERVICE_URL \
    --mount=type=secret,id=VITE_FRONTEND_URL \
    echo "VITE_AUTH0_DOMAIN=$(cat /run/secrets/VITE_AUTH0_DOMAIN)" > .env && \
    echo "VITE_AUTH0_CLIENT_ID=$(cat /run/secrets/VITE_AUTH0_CLIENT_ID)" >> .env && \
    echo "VITE_AUTH0_AUDIENCE=$(cat /run/secrets/VITE_AUTH0_AUDIENCE)" >> .env && \
    echo "BACKEND_URL=$(cat /run/secrets/BACKEND_URL)" >> .env && \
    echo "VITE_PRINTSCRIPT_SERVICE_URL=$(cat /run/secrets/VITE_PRINTSCRIPT_SERVICE_URL)" >> .env && \
    echo "VITE_FRONTEND_URL=$(cat /run/secrets/VITE_FRONTEND_URL)" >> .env && \
    npm run build && \
    rm -f .env

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]







