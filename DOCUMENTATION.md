# Magic Button SDK Documentation

This repository includes a comprehensive documentation site built with [Docusaurus](https://docusaurus.io/) in the `docs/` directory.

## Running the Documentation Locally

You can run the documentation site locally to see changes in real-time:

```bash
# Option 1: From the repository root
npm run docs:start

# Option 2: From the docs directory
cd docs
npm start
```

This will start a development server at http://localhost:3000.

## Building the Documentation

To build the documentation for production:

```bash
# Option 1: From the repository root
npm run docs:build

# Option 2: From the docs directory
cd docs
npm run build
```

The built files will be in the `docs/build` directory.

## Structure

The documentation is organized as follows:

- **Introduction**: Overview of the SDK
- **Getting Started**: Installation and quick start guides
- **Guides**: Usage guides and best practices
- **FAQ**: Frequently asked questions

## Customizing the Documentation

### Adding New Pages

1. Create a new Markdown file in the appropriate directory under `docs/docs/`
2. Add front matter with `sidebar_position` to control the order
3. Update the sidebar configuration in `docs/sidebars.ts` if needed

Example:

```markdown
---
sidebar_position: 2
---

# My New Page

Content goes here...
```

### Modifying the Sidebar

Edit `docs/sidebars.ts` to change the structure of the documentation sidebar.

### Changing Theme and Styling

Modify `docs/src/css/custom.css` to change colors, fonts, and other styles.

## Deploying the Documentation

You can deploy the documentation to various platforms using the included script:

```bash
# Deploy to GitHub Pages
npm run docs:deploy github

# Deploy to Netlify
npm run docs:deploy netlify

# Deploy to Vercel
npm run docs:deploy vercel
```

## Default Documentation URL

The documentation is configured to be deployed at https://docs.magicbutton.cloud.

## Maintenance

When updating the SDK, ensure that you also update the corresponding documentation to keep it in sync with the latest features and changes.