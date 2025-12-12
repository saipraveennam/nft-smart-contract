FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy contracts and tests
COPY contracts ./contracts
COPY test ./test
COPY hardhat.config.js ./

# Compile contracts
RUN npx hardhat compile

# Set default command to run tests
CMD ["npx", "hardhat", "test"]
