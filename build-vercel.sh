#!/bin/bash

# Display current Node version
echo "Using Node version: $(node -v)"
echo "Using npm version: $(npm -v)"

# Install dependencies
npm ci

# Build the application
npm run build

# Display build success message
echo "Build completed successfully!" 