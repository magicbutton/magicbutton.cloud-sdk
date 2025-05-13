---
locked: true
---

# Documentation Synchronization System

This document explains how the TypeDoc generated documentation is synchronized to the Docusaurus site while respecting locked files.

## Overview

The Magic Button Messaging library uses TypeDoc to generate API documentation from TypeScript source code. This documentation is generated in two formats:
1. HTML - for direct viewing
2. Markdown - for integration with the Docusaurus site

When TypeDoc generates this documentation, it completely replaces all previous files. This is problematic when we want to manually enhance certain documentation files with additional information or custom examples.

To solve this problem, we've implemented a synchronization system that:
1. Generates API documentation using TypeDoc
2. Copies the markdown files to the Docusaurus site
3. Respects files marked as "locked" and does not overwrite them

## How to Lock a File

To prevent a documentation file from being overwritten during synchronization:

1. Add a frontmatter section at the top of the file with `locked: true`:

```markdown
---
locked: true
---

# Your Documentation Title

Your custom documentation content here...
```

2. The synchronization script will detect this frontmatter and skip the file during updates

## Synchronization Process

The synchronization happens automatically when you run:

```bash
npm run docs
```

This command:
1. Runs TypeDoc to generate HTML documentation
2. Runs TypeDoc to generate Markdown documentation
3. Runs the sync script to copy markdown files to the Docusaurus site

The sync script specifically respects any files marked with `locked: true` in their frontmatter.

## Testing the Synchronization

You can test the synchronization without making any changes by running:

```bash
node messaging/scripts/sync-docs.js --dry
```

This will show you which files would be copied and which would be skipped, without making any actual changes.

## Best Practices for Locked Files

1. **Be Selective**: Only lock files you need to customize
2. **Document Changes**: Add comments indicating what parts of the file are custom
3. **Minimal Changes**: Make as few changes as possible to locked files
4. **Custom Sections**: Use HTML comments to mark custom sections:

```markdown
<!-- Custom content begin -->
Your custom content here...
<!-- Custom content end -->
```

## Version Differences

Because locked files aren't updated automatically, they may show outdated version numbers or documentation. Consider manually updating these when necessary.

## Implementation Details

The synchronization is implemented in:
- `messaging/scripts/sync-docs.js` - The synchronization script
- Package.json scripts - Integration with the build process

For technical details, please review these files directly.