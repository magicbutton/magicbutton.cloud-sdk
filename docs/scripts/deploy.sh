#!/bin/bash

# Build the documentation site
echo "Building documentation site..."
npm run build

# Prepare for deployment
echo "Preparing for deployment..."

# Check if we have a deploy target
if [ "$1" == "github" ]; then
  echo "Deploying to GitHub Pages..."
  
  # Use Docusaurus built-in GitHub Pages deployment
  USE_SSH=true npm run deploy
  
  echo "Deployed to GitHub Pages successfully!"
elif [ "$1" == "netlify" ]; then
  echo "Deploying to Netlify..."
  
  # If you have the Netlify CLI installed
  # netlify deploy --prod

  echo "To deploy to Netlify:"
  echo "1. Install Netlify CLI: npm install netlify-cli -g"
  echo "2. Run: netlify deploy --prod"
  
  echo "Or deploy manually via the Netlify dashboard."
elif [ "$1" == "vercel" ]; then
  echo "Deploying to Vercel..."
  
  # If you have the Vercel CLI installed
  # vercel --prod

  echo "To deploy to Vercel:"
  echo "1. Install Vercel CLI: npm install -g vercel"
  echo "2. Run: vercel --prod"
  
  echo "Or deploy manually via the Vercel dashboard."
else
  echo "No deployment target specified."
  echo "Usage: ./deploy.sh [github|netlify|vercel]"
  echo ""
  echo "The built documentation can be found in the 'build' directory."
fi