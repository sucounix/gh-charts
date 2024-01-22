# Use an official Node.js runtime as a parent image
FROM node:18-slim AS base

FROM base AS build
RUN apt-get update \
    && apt-get install -y wget curl gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
     && apt-get upgrade -y \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install pm2 -g

# Copy the rest of the application code to the container
COPY . .

# Expose port 80 for the application
EXPOSE 80

# Start the application
CMD ["pm2-runtime", "app.js"]