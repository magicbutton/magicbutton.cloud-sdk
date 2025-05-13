import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h2 className={styles.catchphrase}>Are you a Vibe Coder?</h2>
            <p className={styles.frameworkDescription}>
              Discover the beauty of our Open Source framework - where elegant type-safe contracts meet seamless communication.
              Craft code that feels intuitive, flows naturally, and connects systems with minimal effort.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                Get Started
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src="img/savevibe.png" alt="Save Vibe" className={styles.wantedPoster} />
          </div>
        </div>
      </div>
    </header>
  );
}

const v0DevPrompt = `Create a React messaging panel component that integrates with @magicbutton.cloud/messaging library. The component should:

1. Display a list of messages using the contract-first pattern
2. Support sending and receiving messages through a messaging client 
3. Include a text input and send button for new messages
4. Have proper error handling for failed message deliveries
5. Include styling for different message types

Use the contract-first approach where Zod schemas define the message structure:
- Message contract with name, content, timestamp, and status fields
- Support for both direct messages and system notifications
- Proper typing for all message-related operations

Here's how to implement the contract:

\`\`\`typescript
import { z } from 'zod';
import { createContract } from '@magicbutton.cloud/messaging';

// Define the schemas for different message types
const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  sender: z.string(),
  timestamp: z.number(),
  status: z.enum(['sent', 'delivered', 'read', 'failed'])
});

const systemNotificationSchema = z.object({
  id: z.string(),
  type: z.literal('system'),
  content: z.string(),
  timestamp: z.number()
});

// Create the contract
export const messagingContract = createContract({
  name: 'messaging',
  version: '1.0.0',
  events: {
    newMessage: {
      schema: messageSchema,
    },
    systemNotification: {
      schema: systemNotificationSchema,
    }
  },
  requests: {
    sendMessage: {
      input: z.object({
        content: z.string(),
        recipient: z.string()
      }),
      output: messageSchema,
    },
    fetchMessages: {
      input: z.object({
        limit: z.number().optional(),
        offset: z.number().optional()
      }),
      output: z.array(messageSchema),
    }
  }
});
\`\`\`

Here's how to create a client:

\`\`\`typescript
import { MessagingClient, InMemoryTransport } from '@magicbutton.cloud/messaging';
import { messagingContract } from './contract';

// Create a client instance
const client = new MessagingClient({
  transport: new InMemoryTransport(), // Use appropriate transport for your needs
  contracts: [messagingContract],
});

// Connect to the server
await client.connect();

// Send a message
const message = await client.request(messagingContract.requests.sendMessage, {
  content: 'Hello world',
  recipient: 'user123'
});

// Subscribe to new messages
client.on(messagingContract.events.newMessage, (msg) => {
  console.log('New message received:', msg);
  // Update your UI with the new message
});
\`\`\`

Implement this with responsive design that works on mobile and desktop.`;

const loveablePrompt = `Build a loveable React dashboard component that uses @magicbutton.cloud/messaging for data fetching.

This dashboard should:
1. Connect to a messaging server using the contract-first approach
2. Display real-time metrics and status updates as they arrive
3. Allow filtering and searching of displayed data
4. Include customizable charts and visualizations
5. Support responsive layouts for different screen sizes

Implement these contracts using Zod schemas:
- DataPoint contract with timestamp, value, and category fields
- SystemStatus contract with services, uptime, and health indicators
- UserActivity contract with action, user, and impact fields

The component should handle connection issues gracefully and provide offline capabilities when the server is unreachable. Focus on creating delightful microinteractions that make the component a joy to use.`;

const claudeCodePrompt = `Create a microservice using Node.js that acts as a messaging server using the @magicbutton.cloud/messaging library.

This server should:
1. Implement the contract-first pattern using Zod schemas
2. Handle client requests for a product inventory system
3. Broadcast real-time inventory updates to all connected clients
4. Include proper authentication and authorization middleware
5. Implement error handling with retry logic

Define these contracts:
- Product schema with id, name, price, and inventory fields
- Inventory update events when stock levels change
- Order request/response for processing new orders

Here's how to implement the inventory contract:

\`\`\`typescript
import { z } from 'zod';
import { createContract, createRole } from '@magicbutton.cloud/messaging';

// Define the schemas
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  inventory: z.number().int().min(0),
  category: z.string()
});

const orderSchema = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  customerInfo: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email()
  })
});

// Define roles for access control
const adminRole = createRole({
  name: 'admin',
  permissions: ['read:products', 'write:products', 'read:orders', 'write:orders']
});

const customerRole = createRole({
  name: 'customer',
  permissions: ['read:products', 'write:orders']
});

// Create the contract
export const inventoryContract = createContract({
  name: 'inventory',
  version: '1.0.0',
  events: {
    inventoryChanged: {
      schema: productSchema,
      access: [adminRole, customerRole] // Both roles can subscribe
    },
    orderPlaced: {
      schema: orderSchema,
      access: [adminRole] // Only admins can subscribe
    }
  },
  requests: {
    getProduct: {
      input: z.object({ id: z.string() }),
      output: productSchema,
      access: [adminRole, customerRole] // Both roles can request
    },
    updateInventory: {
      input: z.object({ 
        id: z.string(), 
        newInventory: z.number().int().min(0) 
      }),
      output: productSchema,
      access: [adminRole] // Only admins can update inventory
    },
    placeOrder: {
      input: z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        customerInfo: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().email()
        })
      }),
      output: orderSchema,
      access: [adminRole, customerRole] // Both roles can place orders
    }
  }
});
\`\`\`

Here's how to implement the server:

\`\`\`typescript
import { MessagingServer, InMemoryTransport, createAuthenticationMiddleware } from '@magicbutton.cloud/messaging';
import { inventoryContract } from './contract';

// Sample database
const productDatabase = new Map();

// Create authentication middleware
const authMiddleware = createAuthenticationMiddleware({
  // Verify authentication and return actor with roles
  authenticate: async (context) => {
    const token = context.headers?.authorization;
    if (!token) return null;
    
    // Implement your authentication logic here
    // This is a simplified example
    const user = await verifyToken(token);
    if (!user) return null;
    
    return {
      id: user.id,
      roles: [user.isAdmin ? 'admin' : 'customer']
    };
  }
});

// Create server instance
const server = new MessagingServer({
  transport: new InMemoryTransport(),
  contracts: [inventoryContract],
  middleware: [authMiddleware]
});

// Register request handlers
server.registerHandler(inventoryContract.requests.getProduct, async (req) => {
  const product = productDatabase.get(req.data.id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
});

server.registerHandler(inventoryContract.requests.updateInventory, async (req) => {
  const { id, newInventory } = req.data;
  const product = productDatabase.get(id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Update inventory
  product.inventory = newInventory;
  productDatabase.set(id, product);
  
  // Broadcast inventory change event
  server.broadcast(inventoryContract.events.inventoryChanged, product);
  
  return product;
});

server.registerHandler(inventoryContract.requests.placeOrder, async (req) => {
  const { productId, quantity, customerInfo } = req.data;
  const product = productDatabase.get(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.inventory < quantity) {
    throw new Error('Insufficient inventory');
  }
  
  // Create order
  const order = {
    id: generateId(),
    productId,
    quantity,
    customerInfo
  };
  
  // Update inventory
  product.inventory -= quantity;
  productDatabase.set(productId, product);
  
  // Broadcast events
  server.broadcast(inventoryContract.events.orderPlaced, order);
  server.broadcast(inventoryContract.events.inventoryChanged, product);
  
  return order;
});

// Start the server
server.start();
\`\`\`

Implement proper dependency injection for the messaging components, allowing for easy testing and separation of concerns. Include unit tests that verify the contracts are properly implemented.

The server should scale to handle multiple concurrent client connections and maintain type safety throughout the entire request/response cycle.`;

function StarterPrompts() {
  return (
    <section className={styles.starterPrompts}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <Heading as="h2" className={styles.sectionTitle}>
              Starter Prompts
            </Heading>
            <p className={styles.sectionDescription}>
              Use these prompts with your favorite AI tools to get started quickly with Magic Button Cloud SDK.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col col--6">
            <div className={styles.promptCard}>
              <Heading as="h3">Client</Heading>
              <p>Create a messaging UI client using Vibe Coding</p>
              <div className={styles.promptContainer}>
                <CodeBlock className="language-plaintext">
                  {v0DevPrompt}
                </CodeBlock>
              </div>
              <p className={styles.promptInstructions}>
                Copy the prompt using the copy icon on hover, then paste it at v0.dev
              </p>
              <div className={styles.buttonContainer}>
                <button
                  className={styles.copyButton}
                  onClick={() => { navigator.clipboard.writeText(v0DevPrompt) }}>
                  Copy Prompt
                </button>
                <Link
                  className={styles.ctaButton}
                  to="https://v0.dev"
                  target="_blank"
                  rel="noopener noreferrer">
                  Go to v0.dev
                </Link>
              </div>
            </div>
          </div>


          <div className="col col--6">
            <div className={styles.promptCard}>
              <Heading as="h3">Server</Heading>
              <p>Create a microservice messaging server using Node.js</p>
              <div className={styles.promptContainer}>
                <CodeBlock className="language-plaintext">
                  {claudeCodePrompt}
                </CodeBlock>
              </div>
              <div className={styles.buttonContainer}>
                <button
                  className={styles.copyButton}
                  onClick={() => { navigator.clipboard.writeText(claudeCodePrompt) }}>
                  Copy Prompt
                </button>
                <Link
                  className={styles.ctaButton}
                  to="/docs/ai/claude/overview">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Magic Button Cloud SDK - Are you a Vibe Coder?`}
      description="A beautiful Open Source framework with elegant type-safe contracts and seamless communication for true Vibe Coders">
      <HomepageHeader />
      <main>
        <StarterPrompts />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
