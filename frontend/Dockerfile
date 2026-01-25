# Build Stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Log output to verify dist folder creation
RUN ls -la dist

# The final image will be Nginx, but we will use docker-compose to mount the volume
# or just use a scratch image if we only want the files. 
# Ideally for a pure docker build we would copy to nginx here, 
# but we are using docker-compose with a separate nginx container.
# So we will keep this image just for the build artifacts or use a lightweight alpine.
# Actually, let's make this a self-contained nginx image for simplicity in some setups,
# BUT for our docker-compose with backend, we usually want a shared nginx.
# Let's stick to the build stage pattern. 
# We'll use a dummy command to keep it alive if needed, or better:
# We will use this image to purely export the files in a volume or
# just copy them in a multi-stage build in the final Nginx container.

# Simplest approach for Compose: Use this image to build, and mount /app/dist to Nginx container.
# Or better: Create a dedicated Nginx Dockerfile that copies from this one.
# Let's do a self-contained Nginx frontend image. it's easier to manage.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
