import { NodeHandlers } from "@/types/node-handlers";

/**
 * Represents a conversation flow that contains multiple nodes with handlers.
 *
 * A Flow is used within the Bot's flow builder function to define nodes
 * that make up a complete conversation flow. Each node can have enter/receive
 * handlers and can transition to other nodes within the same flow or different flows.
 *
 * @template T - The type of context data passed through the flow execution
 *
 * @example
 * ```typescript
 * // Used within bot.flow() builder function
 * bot.flow("booking", (flow) => {
 *   flow.node("start", {
 *     onEnter: ({ send }) => send("What service do you want to book?"),
 *     onReceive: ({ message, transition }) => {
 *       if (message) transition("confirm");
 *     }
 *   });
 *
 *   flow.node("confirm", {
 *     onEnter: ({ send }) => send("Confirm booking?"),
 *     onReceive: ({ transition }) => transition("main.bye")
 *   });
 * });
 * ```
 */
export class Flow<T = any> {
  constructor(
    private flowName: string,
    private stateManager: Map<string, any>,
  ) {}

  /**
   * Defines a node within this flow with the specified handlers.
   *
   * Nodes are registered with a full ID in the format `${flowName}.${id}`.
   * This allows nodes to reference other nodes both within the same flow
   * (using just the node ID) or in other flows (using "flow.node" format).
   *
   * @param id - Unique identifier for the node within this flow
   * @param handlers - Object containing the node's behavior handlers
   * @param handlers.onEnter - Optional function called when entering the node
   * @param handlers.onReceive - Optional function called when receiving a message
   * @param handlers.end - Optional flag to mark this as a terminal node
   *
   * @example
   * ```typescript
   * flow.node("welcome", {
   *   onEnter: ({ send, context }) => {
   *     send(`Hello ${context.userName}!`);
   *   },
   *   onReceive: ({ message, transition, send }) => {
   *     if (message === "menu") {
   *       transition("main.menu"); // Transition to different flow
   *     } else if (message === "help") {
   *       transition("help"); // Transition within same flow
   *     } else {
   *       send("I didn't understand that.");
   *     }
   *   }
   * });
   * ```
   */
  node(id: string, handlers: NodeHandlers<T>) {
    this.stateManager.set(`${this.flowName}.${id}`, handlers);
  }
}
