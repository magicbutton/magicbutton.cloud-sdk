# Magic Button SDK Documentation

This is the documentation site for the Magic Button Cloud SDK, built with [Docusaurus](https://docusaurus.io/).

## Development

### Setup

```bash
# Install dependencies
npm install
```

### Local Development

```bash
# Start the development server
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
# Build the website
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Structure

- `/docs` - Documentation content in Markdown format
- `/src` - React components and customizations
- `/static` - Static files like images, fonts, etc.
- `/sidebars.ts` - Sidebar configuration
- `/docusaurus.config.ts` - Main configuration file

## Content Management

### Adding Documentation Pages

1. Create a new Markdown file in the appropriate directory under `/docs`
2. Add front matter with `sidebar_position` to control order
3. Update the sidebar configuration in `sidebars.ts` if needed

### Customizing Styles

Custom CSS can be added in `/src/css/custom.css`.

## Deployment

You can use the deployment script to deploy to different platforms:

```bash
# Deploy to GitHub Pages
./scripts/deploy.sh github

# Deploy to Netlify
./scripts/deploy.sh netlify

# Deploy to Vercel
./scripts/deploy.sh vercel
```

![](2025-05-13-15-09-28.png)