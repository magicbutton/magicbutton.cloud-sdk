import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Magic Button Cloud SDK",
  tagline:
    "An Open Source Contract-first SDK for building solutions independent of third-party services",
  favicon: "img/MagicButtonLightGrey.png",

  // Set the production url of your site here
  url: "https://code.magicbutton.cloud",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "magicbutton", // Usually your GitHub org/user name.
  projectName: "magicbutton.cloud-sdk", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Enable Mermaid diagram support
  markdown: {
    mermaid: true,
  },

  // Add Mermaid theme
  themes: ["@docusaurus/theme-mermaid"],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        // Options for the search plugin
        hashed: true, // Generate search-index.json for better performance
        language: ["en"], // Set to the language of your documentation
        indexDocs: true,
        indexBlog: true,
        docsRouteBasePath: "/docs",
      },
    ],
  ],
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/magicbutton/magicbutton.cloud-sdk/tree/main/docs/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/magicbutton/magicbutton.cloud-sdk/tree/main/docs/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Magic Button social card
    image: "img/magic-button-social-card.svg",
    // Top announcement bar
    announcementBar: {
      id: "magic_button_sdk",
      content:
        '⭐️ Magic Button Cloud SDK: <a href="/docs/intro">Check out our documentation</a>',
      backgroundColor: "#1E3771",
      textColor: "#FFFFFF",
      isCloseable: true,
    },
    navbar: {
      title: "Magic Button SDK",
      logo: {
        alt: "Magic Button Logo",
        src: "img/MagicButtonLightGrey.png",
        srcDark: "img/MagicButtonLightGrey.png", // Use same logo for dark mode
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          type: "docSidebar",
          sidebarId: "typescriptSidebar",
          position: "left",
          label: "TypeScript",
        },
        {
          type: "docSidebar",
          sidebarId: "aiSidebar",
          position: "left",
          label: "AI",
        },
        {
          href: "https://magicbutton.cloud",
          label: "Magic Button Cloud",
          position: "right",
        },
        {
          href: "https://github.com/magicbutton/magicbutton.cloud-sdk",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/magicbutton/magicbutton.cloud-sdk",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Magic Button",
              href: "https://magicbutton.cloud",
            },
          ],
        },
      ],
      logo: {
        alt: "Magic Button SDK Logo",
        src: "img/MagicButtonLightGrey.png",
        width: 60,
        height: 60,
      },

      copyright: `An Open Source Contract-first SDK for building solutions independent of third-party services | Copyright © ${new Date().getFullYear()} Magic Button. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
