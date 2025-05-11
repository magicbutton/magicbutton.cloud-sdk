import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Magic Button SDK',
  tagline: 'Documentation for the Magic Button Cloud SDK',
  favicon: 'img/MagicButtonLightGrey.png',

  // Set the production url of your site here
  url: 'https://docs.magicbutton.cloud',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'magicbutton', // Usually your GitHub org/user name.
  projectName: 'magicbutton.cloud-sdk', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Enable Mermaid diagram support
  markdown: {
    mermaid: true,
  },

  // Add Mermaid theme
  themes: ['@docusaurus/theme-mermaid'],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/magicbutton/magicbutton.cloud-sdk/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/magicbutton/magicbutton.cloud-sdk/tree/main/docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Magic Button social card
    image: 'img/magic-button-social-card.svg',
    // Top announcement bar
    announcementBar: {
      id: 'magic_button_sdk',
      content:
        '⭐️ Magic Button Cloud SDK: <a href="/docs/intro">Check out our documentation</a>',
      backgroundColor: '#1E3771',
      textColor: '#FFFFFF',
      isCloseable: true,
    },
    navbar: {
      title: 'Magic Button SDK',
      logo: {
        alt: 'Magic Button Logo',
        src: 'img/MagicButtonLightGrey.png',
        srcDark: 'img/MagicButtonLightGrey.png', // Use same logo for dark mode
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'aiSidebar',
          position: 'left',
          label: 'AI',
        },
        {
          href: 'https://github.com/magicbutton/magicbutton.cloud-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/magicbutton/magicbutton.cloud-sdk',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Magic Button',
              href: 'https://magicbutton.cloud',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Magic Button. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
