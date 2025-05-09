---
sidebar_position: 1
---

# Magic Button State

A distributed state management system for TypeScript and React applications, providing robust, type-safe state management with support for synchronization across clients, persistence, and real-time updates.

## Features

- 📦 **Atomic State Model**: State is managed in atomic pieces for granular updates and efficient synchronization
- 🧩 **Type-Safe Schema Definition**: Define your state with full TypeScript type inference and runtime validation
- 🔄 **Distributed Synchronization**: Seamlessly sync state across multiple clients, tabs, and servers
- 🔌 **Pluggable Storage Adapters**: Persist state locally or remotely with built-in and custom adapters
- 🎣 **React Hooks API**: Simple, powerful React integration with custom hooks
- 📱 **Cross-Tab/Window Synchronization**: Out-of-the-box support for state sharing across browser tabs
- 🚀 **Optimistic Updates**: Built-in support for optimistic UI updates with automatic rollback
- 🧪 **Time-Travel Debugging**: Development tools for inspecting and manipulating state over time
- 📊 **Selectors and Computed Values**: Efficient derived state with automatic dependency tracking
- 🔒 **Transactional Updates**: Batch multiple state changes into a single atomic transaction

## Why Magic Button State?

### Problem

State management in modern applications presents several challenges:

- **Distribution**: Syncing state across multiple clients and servers
- **Consistency**: Maintaining a consistent view of state across components
- **Type Safety**: Ensuring state updates follow the correct structure
- **Performance**: Optimizing state updates and re-renders
- **Persistence**: Storing and retrieving state across sessions
- **Debugging**: Tracing and troubleshooting state changes

### Solution

Magic Button State addresses these challenges with a comprehensive state management library that provides:

- **Atomic State Model** for fine-grained updates and efficient synchronization
- **Type-Safe Schemas** with Zod for runtime validation and TypeScript inference
- **Pluggable Storage** for different persistence mechanisms
- **Synchronization Adapters** to keep state in sync across clients
- **React Hooks API** for seamless integration with React components
- **Development Tools** for debugging and time-travel

## Core Concepts

Magic Button State is built around a few key concepts:

### Atoms

Atoms are the fundamental units of state. Each atom represents a distinct piece of state that can be updated independently. Atoms are defined using Zod schemas which provide both runtime validation and TypeScript type inference.

```typescript
const counter = z.number().default(0);
const user = z.object({
  name: z.string().optional(),
  theme: z.enum(['light', 'dark']).default('light'),
}).default({});
```

### State Manager

The State Manager is the central hub that manages state. It provides methods for reading and updating state, subscribing to changes, and handling transactions.

```typescript
const stateManager = createStateManager({
  schema: {
    counter,
    user,
  },
  storageAdapter: 'localStorage',
  syncAdapter: 'broadcastChannel',
});
```

### Storage Adapters

Storage Adapters provide persistence for state. Magic Button State comes with several built-in adapters including localStorage, sessionStorage, memory, and IndexedDB. You can also implement custom adapters.

```typescript
// Using a built-in adapter
const stateManager = createStateManager({
  schema,
  storageAdapter: 'localStorage',
});

// Using a custom adapter
const stateManager = createStateManager({
  schema,
  storageAdapter: myCustomStorageAdapter,
});
```

### Sync Adapters

Sync Adapters enable state synchronization across multiple clients. Built-in adapters include BroadcastChannel for cross-tab communication, WebSockets for client-server synchronization, and SharedWorker for cross-browser-window communication.

```typescript
// Using a built-in adapter for cross-tab sync
const stateManager = createStateManager({
  schema,
  syncAdapter: 'broadcastChannel',
});

// Using WebSockets for client-server sync
const stateManager = createStateManager({
  schema,
  syncAdapter: websocketAdapter('wss://api.example.com/state-sync'),
});
```

### Transactions

Transactions allow you to batch multiple state changes into a single atomic operation. Changes within a transaction are all applied together or none at all if the transaction is rolled back.

```typescript
// Start a transaction
const transaction = stateManager.transaction();

// Update multiple atoms
transaction.update('counter', 5);
transaction.update('user', { name: 'Alice', theme: 'dark' });

// Commit the transaction to apply all changes at once
transaction.commit();

// Or roll back the transaction to discard all changes
// transaction.rollback();
```

### Selectors

Selectors derive new values from state. They efficiently compute and memoize derived state, updating only when their dependencies change.

```typescript
// Define a selector
const userGreeting = (state) => {
  return state.user.name
    ? `Hello, ${state.user.name}!`
    : 'Hello, Guest!';
};

// Use the selector
const greeting = useSelector(stateManager, userGreeting);
```

## Quick Example

```tsx
import { 
  createStateManager, 
  StateProvider, 
  useAtom, 
  useSelector 
} from '@magicbutton.cloud/state';
import { z } from 'zod';

// Define schema
const schema = {
  counter: z.number().default(0),
  user: z.object({
    name: z.string().optional(),
    theme: z.enum(['light', 'dark']).default('light'),
  }).default({}),
  todos: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean().default(false),
  })).default([]),
};

// Create state manager
const stateManager = createStateManager({
  schema,
  storageAdapter: 'localStorage',
  syncAdapter: 'broadcastChannel',
});

// Wrap your app with the provider
function App() {
  return (
    <StateProvider stateManager={stateManager}>
      <Counter />
      <UserProfile />
      <TodoList />
    </StateProvider>
  );
}

// Use state in components
function Counter() {
  const [count, setCount] = useAtom(stateManager, stateManager.atoms.counter);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

function UserProfile() {
  const [user, setUser] = useAtom(stateManager, stateManager.atoms.user);
  
  const toggleTheme = () => {
    setUser({
      ...user,
      theme: user.theme === 'light' ? 'dark' : 'light',
    });
  };
  
  return (
    <div>
      <p>Theme: {user.theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

function TodoList() {
  const [todos, setTodos] = useAtom(stateManager, stateManager.atoms.todos);
  
  // Use a selector for derived state
  const incompleteTodos = useSelector(stateManager, (state) => 
    state.todos.filter(todo => !todo.completed)
  );
  
  // Add a new todo
  const addTodo = (title) => {
    setTodos([...todos, { 
      id: Date.now().toString(), 
      title, 
      completed: false 
    }]);
  };
  
  // Toggle a todo
  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed } 
          : todo
      )
    );
  };
  
  return (
    <div>
      <h2>Todos ({incompleteTodos.length} remaining)</h2>
      {/* Todo list UI */}
    </div>
  );
}
```

## Next Steps

- [Installation](installation): Install Magic Button State in your project
- [Quick Start](quick-start): Get started with a simple example
- [Core Concepts](core-concepts): Learn about the key concepts in depth
- [React Integration](react-integration): Integrate with React components
- [Storage and Sync](storage-and-sync): Configure storage and synchronization
- [Transactions and Selectors](transactions-and-selectors): Advanced state operations