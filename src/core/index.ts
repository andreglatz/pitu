/**
 * @fileoverview Core bot functionality exports.
 *
 * This module provides the main classes and utilities for creating
 * conversational bots with flows, nodes, and transitions.
 *
 * @example
 * ```typescript
 * import { Bot } from "./core";
 *
 * const bot = new Bot({
 *   defaultStartNode: "main.welcome"
 * });
 *
 * bot.flow("main", (flow) => {
 *   flow.node("welcome", {
 *     onEnter: ({ send }) => send("Hello!")
 *   });
 * });
 * ```
 */

export * from "./bot";
export * from "./flow";
