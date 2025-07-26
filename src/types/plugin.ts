import { FlowResponse } from "./flow";

/**
 * Plugin interface for extending bot functionality through middleware-style interception.
 *
 * Plugins can intercept bot execution to add features like:
 * - Message transformation (e.g., converting to platform-specific formats)
 * - Logging and analytics
 * - Authentication and authorization
 * - Rate limiting
 * - External API integrations
 *
 * Plugins follow a middleware pattern where they can modify the context,
 * call the next handler in the chain, and transform the response.
 *
 * @template C - The type of context data passed through the bot execution
 *
 * @example
 * ```typescript
 * const loggingPlugin = (): BotPlugin => ({
 *   intercept: async (context, next) => {
 *     console.log('Bot execution started', context);
 *     const result = await next();
 *     console.log('Bot execution completed', result);
 *     return result;
 *   }
 * });
 * ```
 */
export type BotPlugin<C = any> = {
  /**
   * Optional interception function that can modify bot execution.
   *
   * This function is called during bot execution and allows the plugin to:
   * - Inspect or modify the context before processing
   * - Call the next handler in the plugin chain
   * - Transform the response after processing
   * - Implement cross-cutting concerns like logging, caching, etc.
   *
   * @param context - The conversation context data
   * @param next - Function to call the next handler in the chain (required to continue execution)
   * @returns Promise resolving to the potentially modified FlowResponse
   *
   * @example
   * ```typescript
   * const authPlugin: BotPlugin<{ userId?: string }> = {
   *   intercept: async (context, next) => {
   *     if (!context.userId) {
   *       return {
   *         messages: ["Please authenticate first"],
   *         next: "auth.login",
   *         done: false
   *       };
   *     }
   *     return next();
   *   }
   * };
   * ```
   */
  intercept?: (context: C, next: () => Promise<FlowResponse>) => Promise<FlowResponse>;
};
