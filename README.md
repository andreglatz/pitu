# Pitu Bot Framework

A TypeScript-first conversational bot framework with flow-based conversation management, node transitions, and extensible plugin system.

## Features

- 🔄 **Flow-based Architecture**: Organize conversations into logical flows with interconnected nodes
- 🎯 **Type-safe Context**: Full TypeScript support with generic context types
- 🔌 **Plugin System**: Extensible middleware architecture for integrations
- 📱 **Platform Agnostic**: Built-in Twilio support with extensible plugin model
- 🚀 **Simple API**: Intuitive builder pattern for creating conversation flows
- 📚 **Comprehensive Documentation**: Full TSDoc documentation with examples

## Installation

```bash
npm install pitu
# or
yarn add pitu
# or
pnpm add pitu
```

## Quick Start

```typescript
import { Bot } from "pitu";
import { twilioPlugin } from "pitu/plugins/twilio";

// Create a bot with configuration
const bot = new Bot({
  defaultStartNode: "main.welcome",
  plugins: [twilioPlugin()],
});

// Define a conversation flow
bot.flow("main", (flow) => {
  flow.node("welcome", {
    onEnter: ({ send }) => {
      send("Welcome! How can I help you today?");
    },
    onReceive: ({ message, transition }) => {
      if (message.toLowerCase().includes("help")) {
        transition("help");
      } else {
        transition("menu");
      }
    },
  });

  flow.node("menu", {
    onEnter: ({ send }) => {
      send("Choose an option:\n1. Services\n2. Support\n3. Exit");
    },
    onReceive: ({ message, transition, send }) => {
      switch (message) {
        case "1":
          transition("services.list");
          break;
        case "2":
          transition("support.contact");
          break;
        case "3":
          transition("goodbye");
          break;
        default:
          send("Please choose a valid option (1-3)");
      }
    },
  });

  flow.node("goodbye", {
    end: true,
    onEnter: ({ send }) => {
      send("Thank you for using our service. Goodbye!");
    },
  });
});

// Run the bot
const response = await bot.run({
  context: { userId: "123", sessionId: "abc" },
  message: "hello",
});

console.log(response.messages); // ["Welcome! How can I help you today?"]
console.log(response.next); // "main.welcome"
console.log(response.done); // false
```

## Core Concepts

### Bot Configuration

The `Bot` class is initialized with a configuration object:

```typescript
import { Bot, BotConfig } from "pitu";

const config: BotConfig = {
  defaultStartNode: "main.welcome", // Initial node for new conversations
  plugins: [
    // Optional plugins array
    twilioPlugin(),
    loggingPlugin(),
  ],
};

const bot = new Bot(config);
```

### Flows and Nodes

Conversations are organized into **flows**, which contain multiple **nodes**:

```typescript
bot.flow("booking", (flow) => {
  // Entry node
  flow.node("start", {
    onEnter: ({ send }) => {
      send("What service would you like to book?");
    },
    onReceive: ({ message, transition }) => {
      if (message) {
        transition("confirm"); // Transition within same flow
      }
    },
  });

  // Confirmation node
  flow.node("confirm", {
    onEnter: ({ send }) => {
      send("Please confirm your booking:");
    },
    onReceive: ({ transition }) => {
      transition("main.thank-you"); // Transition to different flow
    },
  });
});
```

### Node Handlers

Each node can have optional lifecycle handlers:

#### `onEnter`

Called when the conversation transitions into the node:

```typescript
flow.node("welcome", {
  onEnter: ({ context, send, transition }) => {
    send(`Hello ${context.userName}!`);
    if (context.isFirstTime) {
      transition("onboarding.start");
    }
  },
});
```

#### `onReceive`

Called when a message is received while in the node:

```typescript
flow.node("menu", {
  onReceive: ({ message, context, send, transition }) => {
    if (message === "profile") {
      send(`Your profile: ${context.userName}`);
    } else if (message === "settings") {
      transition("settings.main");
    } else {
      send("I didn't understand that command.");
    }
  },
});
```

#### Terminal Nodes

Mark nodes as conversation endpoints:

```typescript
flow.node("goodbye", {
  end: true, // This ends the conversation
  onEnter: ({ send }) => {
    send("Goodbye! Have a great day!");
  },
});
```

### Context Management

Use TypeScript generics for type-safe context:

```typescript
interface UserContext {
  userId: string;
  userName: string;
  preferences: {
    language: string;
    notifications: boolean;
  };
}

const bot = new Bot<UserContext>({
  defaultStartNode: "main.welcome",
});

bot.flow("profile", (flow) => {
  flow.node("show", {
    onEnter: ({ context, send }) => {
      // context is fully typed as UserContext
      send(`Welcome ${context.userName}!`);
      send(`Language: ${context.preferences.language}`);
    },
  });
});
```

### Node Transitions

Nodes can transition within the same flow or to other flows:

```typescript
// Within same flow
transition("next-node");

// To different flow
transition("other-flow.start");

// Examples
transition("confirm"); // booking.confirm
transition("main.menu"); // main.menu
transition("support.contact"); // support.contact
```

## Plugin System

Plugins extend bot functionality through middleware-style interception:

### Using Existing Plugins

```typescript
import { twilioPlugin } from "pitu/plugins/twilio";

const bot = new Bot({
  defaultStartNode: "main.welcome",
  plugins: [twilioPlugin()],
});
```

### Creating Custom Plugins

```typescript
import { BotPlugin, FlowResponse } from "pitu";

// Logging plugin
const loggingPlugin = (): BotPlugin => ({
  intercept: async (context, next) => {
    console.log("Bot execution started:", context);
    const result = await next();
    console.log("Bot execution completed:", result);
    return result;
  },
});

// Authentication plugin
const authPlugin = (): BotPlugin<{ userId?: string }> => ({
  intercept: async (context, next) => {
    if (!context.userId) {
      return {
        messages: ["Please authenticate first"],
        next: "auth.login",
        done: false,
      };
    }
    return next();
  },
});

// Rate limiting plugin
const rateLimitPlugin = (maxRequests: number): BotPlugin => {
  const requests = new Map<string, number>();

  return {
    intercept: async (context, next) => {
      const userId = context.userId || "anonymous";
      const count = requests.get(userId) || 0;

      if (count >= maxRequests) {
        return {
          messages: ["Rate limit exceeded. Please try again later."],
          next: undefined,
          done: true,
        };
      }

      requests.set(userId, count + 1);
      return next();
    },
  };
};
```

## Built-in Plugins

### Twilio Plugin

Transforms bot messages into TwiML format for Twilio webhooks:

```typescript
import { twilioPlugin } from "pitu/plugins/twilio";

const bot = new Bot({
  defaultStartNode: "main.welcome",
  plugins: [twilioPlugin()],
});

// Messages like ["Hello!", "How can I help?"]
// Are transformed to TwiML:
// <?xml version="1.0" encoding="UTF-8"?>
// <Response>
//   <Message>Hello!</Message>
//   <Message>How can I help?</Message>
// </Response>
```

## Advanced Examples

### Multi-Flow Restaurant Bot

```typescript
interface RestaurantContext {
  customerId: string;
  currentOrder: {
    items: string[];
    total: number;
  };
  customerInfo: {
    name: string;
    phone: string;
  };
}

const restaurantBot = new Bot<RestaurantContext>({
  defaultStartNode: "main.welcome",
  plugins: [twilioPlugin()],
});

// Main flow
restaurantBot.flow("main", (flow) => {
  flow.node("welcome", {
    onEnter: ({ send }) => {
      send("🍕 Welcome to Tony's Pizza!");
      send("1. Order Food\n2. Track Order\n3. Contact Us");
    },
    onReceive: ({ message, transition, send }) => {
      switch (message) {
        case "1":
          transition("order.menu");
          break;
        case "2":
          transition("tracking.start");
          break;
        case "3":
          transition("contact.info");
          break;
        default:
          send("Please choose 1, 2, or 3");
      }
    },
  });
});

// Order flow
restaurantBot.flow("order", (flow) => {
  flow.node("menu", {
    onEnter: ({ send }) => {
      send("🍕 Our Menu:");
      send("1. Margherita Pizza - $12");
      send("2. Pepperoni Pizza - $14");
      send("3. Caesar Salad - $8");
      send("4. View Cart\n5. Back to Main Menu");
    },
    onReceive: ({ message, context, transition, send }) => {
      switch (message) {
        case "1":
          context.currentOrder.items.push("Margherita Pizza");
          context.currentOrder.total += 12;
          send("Added Margherita Pizza to cart!");
          break;
        case "2":
          context.currentOrder.items.push("Pepperoni Pizza");
          context.currentOrder.total += 14;
          send("Added Pepperoni Pizza to cart!");
          break;
        case "3":
          context.currentOrder.items.push("Caesar Salad");
          context.currentOrder.total += 8;
          send("Added Caesar Salad to cart!");
          break;
        case "4":
          transition("cart");
          break;
        case "5":
          transition("main.welcome");
          break;
        default:
          send("Please choose a valid option");
      }
    },
  });

  flow.node("cart", {
    onEnter: ({ context, send }) => {
      if (context.currentOrder.items.length === 0) {
        send("Your cart is empty");
        return;
      }

      send("🛒 Your Cart:");
      context.currentOrder.items.forEach((item) => send(`- ${item}`));
      send(`Total: $${context.currentOrder.total}`);
      send("1. Checkout\n2. Continue Shopping\n3. Clear Cart");
    },
    onReceive: ({ message, context, transition, send }) => {
      switch (message) {
        case "1":
          transition("checkout");
          break;
        case "2":
          transition("menu");
          break;
        case "3":
          context.currentOrder.items = [];
          context.currentOrder.total = 0;
          send("Cart cleared!");
          transition("menu");
          break;
        default:
          send("Please choose 1, 2, or 3");
      }
    },
  });

  flow.node("checkout", {
    onEnter: ({ send }) => {
      send("Please provide your delivery information:");
      send("Format: Name, Phone, Address");
    },
    onReceive: ({ message, context, transition, send }) => {
      const parts = message.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        context.customerInfo.name = parts[0];
        context.customerInfo.phone = parts[1];
        transition("confirm");
      } else {
        send("Please provide: Name, Phone, Address");
      }
    },
  });

  flow.node("confirm", {
    onEnter: ({ context, send }) => {
      send("📋 Order Summary:");
      context.currentOrder.items.forEach((item) => send(`- ${item}`));
      send(`Total: $${context.currentOrder.total}`);
      send(`Delivery to: ${context.customerInfo.name}`);
      send("1. Confirm Order\n2. Cancel");
    },
    onReceive: ({ message, transition, send }) => {
      if (message === "1") {
        send("🎉 Order confirmed! Estimated delivery: 30-45 minutes");
        transition("main.welcome");
      } else if (message === "2") {
        send("Order cancelled");
        transition("main.welcome");
      } else {
        send("Please choose 1 to confirm or 2 to cancel");
      }
    },
  });
});
```

### Error Handling and Validation

```typescript
bot.flow("registration", (flow) => {
  flow.node("email", {
    onEnter: ({ send }) => {
      send("Please enter your email address:");
    },
    onReceive: ({ message, context, transition, send }) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailRegex.test(message)) {
        context.email = message;
        transition("phone");
      } else {
        send("❌ Invalid email format. Please try again:");
      }
    },
  });

  flow.node("phone", {
    onEnter: ({ send }) => {
      send("Please enter your phone number:");
    },
    onReceive: ({ message, context, transition, send }) => {
      const phoneRegex = /^\+?[\d\s-()]+$/;

      if (phoneRegex.test(message) && message.replace(/\D/g, "").length >= 10) {
        context.phone = message;
        transition("confirm");
      } else {
        send("❌ Invalid phone number. Please enter a valid phone number:");
      }
    },
  });
});
```

## API Reference

### Bot Class

```typescript
class Bot<T = any> {
  constructor(config: BotConfig);
  flow(name: string, builder: (flow: Flow<T>) => void): void;
  run(args: RunArgs<T>): Promise<FlowResponse>;
}
```

### Types

```typescript
interface BotConfig {
  defaultStartNode: string;
  plugins?: BotPlugin[];
}

interface RunArgs<T = any> {
  node?: string;
  context: T;
  message?: string;
}

interface FlowResponse {
  messages: string[];
  next: string | undefined;
  done?: boolean;
}

interface NodeHandlers<T = any> {
  end?: boolean;
  onEnter?: (args: OnEnterArgs<T>) => Promise<void> | void;
  onReceive?: (args: OnReceiveArgs<T>) => Promise<void> | void;
}

interface BotPlugin<C = any> {
  intercept?: (context: C, next: () => Promise<FlowResponse>) => Promise<FlowResponse>;
}
```

## Best Practices

### 1. Organize Flows Logically

```typescript
// ✅ Good - Logical flow organization
bot.flow("onboarding", (flow) => {
  /* ... */
});
bot.flow("main-menu", (flow) => {
  /* ... */
});
bot.flow("booking", (flow) => {
  /* ... */
});
bot.flow("support", (flow) => {
  /* ... */
});

// ❌ Avoid - Everything in one flow
bot.flow("everything", (flow) => {
  /* 50+ nodes */
});
```

### 2. Use Descriptive Node Names

```typescript
// ✅ Good - Clear, descriptive names
flow.node("collect-service-type", {
  /* ... */
});
flow.node("confirm-booking-details", {
  /* ... */
});
flow.node("payment-processing", {
  /* ... */
});

// ❌ Avoid - Unclear names
flow.node("step1", {
  /* ... */
});
flow.node("thing", {
  /* ... */
});
flow.node("node", {
  /* ... */
});
```

### 3. Implement Proper Error Handling

```typescript
flow.node("user-input", {
  onReceive: ({ message, send, transition }) => {
    try {
      const data = JSON.parse(message);
      if (validateData(data)) {
        transition("success");
      } else {
        send("Invalid data format. Please try again.");
      }
    } catch (error) {
      send("Please send valid JSON data.");
    }
  },
});
```

### 4. Provide Clear User Guidance

```typescript
flow.node("main-menu", {
  onEnter: ({ send }) => {
    send("🏠 Main Menu");
    send("");
    send("Choose an option:");
    send("1️⃣ Book Service");
    send("2️⃣ View Bookings");
    send("3️⃣ Contact Support");
    send("4️⃣ Settings");
    send("");
    send("Type the number of your choice:");
  },
});
```

### 5. Use Context for State Management

```typescript
interface AppContext {
  user: {
    id: string;
    name: string;
    preferences: UserPreferences;
  };
  session: {
    startTime: Date;
    currentFlow: string;
    data: Record<string, any>;
  };
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/andreglatz/pitu/docs)
- 🐛 [Issue Tracker](https://github.com/andreglatz/pitu/issues)
- 💬 [Discussions](https://github.com/andreglatz/pitu/discussions)
