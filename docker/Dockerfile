# Use the base image with Node.js 8.11.3
FROM node:8.11.3

# Copy the current directory into the Docker image
COPY . /lookups-data-processor-es

# Set working directory for future use
WORKDIR /lookups-data-processor-es

# Install the dependencies from package.json
RUN npm install
CMD npm start
