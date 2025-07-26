import { BotConfig, FlowResponse, NodeHandlers, RunArgs } from "@/types";

import { Flow } from "./flow";

/**
 * Main Bot class for creating conversational flows with nodes and transitions.
 *
 * @template T - The type of context data passed through the bot's execution
 *
 * @example
 * ```typescript
 * const bot = new Bot({
 *   defaultStartNode: "main.welcome",
 *   plugins: [twilioPlugin()]
 * });
 *
 * bot.flow("main", (flow) => {
 *   flow.node("welcome", {
 *     onEnter: ({ send }) => {
 *       send("Welcome to our bot!");
 *     }
 *   });
 * });
 * ```
 */
export class Bot<T = any> {
  /** Bot configuration containing default start node and plugins */
  private config: BotConfig;

  /** Internal state manager that stores all flow nodes by their full ID (flow.node) */
  private stateManager: Map<string, NodeHandlers<T>>;

  /**
   * Creates a new Bot instance with the provided configuration.
   *
   * @param config - Bot configuration object
   * @param config.defaultStartNode - The initial node to start from (format: "flow.node")
   * @param config.plugins - Optional array of plugins to extend bot functionality
   */
  constructor(config: BotConfig) {
    this.config = config;
    this.stateManager = new Map<string, NodeHandlers<T>>();
  }

  /**
   * Defines a new conversation flow with multiple nodes.
   *
   * @param name - Unique name for the flow
   * @param builder - Function that receives a Flow instance to define nodes
   *
   * @example
   * ```typescript
   * bot.flow("booking", (flow) => {
   *   flow.node("start", {
   *     onEnter: ({ send }) => send("What would you like to book?"),
   *     onReceive: ({ message, transition }) => {
   *       if (message) transition("confirm");
   *     }
   *   });
   * });
   * ```
   */
  flow(name: string, builder: (flow: Flow<T>) => void) {
    const f = new Flow<T>(name, this.stateManager);
    builder(f);
  }

  /**
   * Executes the bot with the provided arguments, processing through plugins and nodes.
   *
   * @param args - Execution arguments
   * @param args.node - Optional specific node to run (defaults to defaultStartNode)
   * @param args.context - Context data of type T to pass through execution
   * @param args.message - Optional incoming message to process
   *
   * @returns Promise resolving to FlowResponse with messages, next node, and completion status
   *
   * @example
   * ```typescript
   * const response = await bot.run({
   *   context: { userId: "123" },
   *   message: "Hello"
   * });
   *
   * console.log(response.messages); // ["Welcome!", "How can I help?"]
   * console.log(response.next);     // "main.menu"
   * console.log(response.done);     // false
   * ```
   */
  async run(args: RunArgs<T>): Promise<FlowResponse> {
    const plugins = this.config.plugins || [];

    let handler = () => this.internalRun(args);

    for (const plugin of [...plugins].reverse()) {
      const next = handler;
      if (plugin?.intercept) {
        handler = () => plugin.intercept!(args.context, next);
      }
    }

    return handler();
  }

  private async internalRun(args: RunArgs<T>): Promise<FlowResponse> {
    const isFirstRun = !args.node;
    const messages: string[] = [];
    let next: string | undefined;
    const currentNodeId = args.node || this.config.defaultStartNode;

    const node = this.stateManager.get(currentNodeId);

    const send = (message: string) => messages.push(message);
    const transition = (nodeId: string) => {
      const [currentFlowName] = currentNodeId.split(".");
      next = nodeId.includes(".") ? nodeId : `${currentFlowName}.${nodeId}`;
    };

    if (args.message && node?.onReceive) {
      await node.onReceive({
        message: args.message,
        context: args.context,
        send,
        transition,
      });
    }

    const finalNode = this.stateManager.get(next || currentNodeId);

    if (isFirstRun || next) {
      if (finalNode?.onEnter) {
        await finalNode.onEnter({
          context: args.context,
          send,
          transition,
        });
      }
    }

    return {
      messages,
      next: finalNode?.end ? undefined : next || currentNodeId,
      done: finalNode?.end,
    };
  }
}
