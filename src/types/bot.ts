import { BotPlugin } from "./plugin";

/**
 * Arguments passed to the bot's run method for executing a conversation step.
 *
 * @template T - The type of context data maintained throughout the conversation
 *
 * @example
 * ```typescript
 * const args: RunArgs<{ userId: string; sessionId: string }> = {
 *   node: "main.welcome",
 *   context: { userId: "123", sessionId: "abc" },
 *   message: "Hello"
 * };
 *
 * const response = await bot.run(args);
 * ```
 */
export type RunArgs<T = any> = {
  /**
   * Optional specific node to execute. If not provided, uses the bot's defaultStartNode.
   * Format should be "flow.node" (e.g., "main.welcome", "booking.confirm")
   */
  node?: string;

  /**
   * Context data of type T that persists throughout the conversation.
   * This can contain user information, session data, or any application-specific data.
   */
  context: T;

  /**
   * Optional incoming message from the user to process.
   * When provided, triggers the current node's onReceive handler.
   */
  message?: string;
};

/**
 * Configuration object for initializing a Bot instance.
 *
 * @example
 * ```typescript
 * const config: BotConfig = {
 *   defaultStartNode: "main.welcome",
 *   plugins: [
 *     twilioPlugin(),
 *     loggingPlugin()
 *   ]
 * };
 *
 * const bot = new Bot(config);
 * ```
 */
export type BotConfig = {
  /**
   * The initial node to start conversations from.
   * Must be in "flow.node" format (e.g., "main.welcome").
   * This node's onEnter handler will be called for new conversations.
   */
  defaultStartNode: string;

  /**
   * Optional array of plugins to extend bot functionality.
   * Plugins can intercept and modify bot execution, add logging,
   * transform messages, or integrate with external services.
   */
  plugins?: BotPlugin[];
};
