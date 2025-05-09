import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    "intro",
    {
      type: "category",
      label: "Messaging",
      collapsed: false,
      items: [
        "messaging/overview",
        "messaging/installation",
        "messaging/quick-start",
        {
          type: "category",
          label: "Core Concepts",
          items: [
            "messaging/core-concepts/contracts",
            "messaging/core-concepts/transport",
            "messaging/core-concepts/client-server",
            "messaging/core-concepts/message-context",
          ],
        },
        {
          type: "category",
          label: "Features",
          items: [
            "messaging/features/access-control",
            "messaging/features/middleware",
            "messaging/features/error-handling",
            "messaging/features/observability",
          ],
        },
        {
          type: "category",
          label: "API Reference",
          items: [
            "messaging/api/client",
            "messaging/api/server",
            "messaging/api/transport-adapter",
            "messaging/api/access-control",
          ],
        },
        "messaging/examples",
      ],
    },
    {
      type: "category",
      label: "Auth",
      collapsed: false,
      items: [
        "auth/overview",
        "auth/installation",
        "auth/quick-start",
        "auth/authentication",
        "auth/access-control",
        "auth/components",
        "auth/hooks",
      ],
    },
  ],
};

export default sidebars;