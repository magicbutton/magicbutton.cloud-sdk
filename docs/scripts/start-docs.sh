#!/bin/bash

# Script to start the documentation site in development mode

cd "$(dirname "$0")/.."

echo "Starting Magic Button SDK documentation site..."
echo "The site will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm start