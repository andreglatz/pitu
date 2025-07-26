/**
 * @fileoverview Main entry point for the Pitu bot framework.
 *
 * This module provides a complete conversational bot framework with support for:
 * - Flow-based conversation management
 * - Node-based state transitions
 * - Plugin system for extensibility
 * - Type-safe context handling
 * - Message processing and routing
 *
 * @example Basic bot setup
 * ```typescript
 * import { Bot } from "pitu";
 * import { twilioPlugin } from "pitu/plugins/twilio";
 *
 * const bot = new Bot({
 *   defaultStartNode: "main.welcome",
 *   plugins: [twilioPlugin()]
 * });
 *
 * bot.flow("main", (flow) => {
 *   flow.node("welcome", {
 *     onEnter: ({ send }) => {
 *       send("Welcome to our bot!");
 *     },
 *     onReceive: ({ message, transition }) => {
 *       if (message === "help") {
 *         transition("help");
 *       }
 *     }
 *   });
 * });
 * ```
 *
 * @example Running the bot
 * ```typescript
 * const response = await bot.run({
 *   context: { userId: "123", sessionId: "abc" },
 *   message: "hello"
 * });
 *
 * console.log(response.messages); // ["Welcome to our bot!"]
 * console.log(response.next);     // "main.welcome"
 * console.log(response.done);     // false
 * ```
 *
 * @version 1.0.0
 * @author Pitu Bot Framework
 */

export * from "./core";
export * from "./types";

export { Bot as default } from "./core";
