/**
 * @fileoverview Type definitions for the bot system.
 *
 * This module exports all TypeScript types and interfaces used throughout
 * the bot framework, including configuration types, handler interfaces,
 * and plugin definitions.
 *
 * @example
 * ```typescript
 * import { BotConfig, NodeHandlers, FlowResponse } from "./types";
 *
 * const config: BotConfig = {
 *   defaultStartNode: "main.welcome"
 * };
 *
 * const nodeHandler: NodeHandlers = {
 *   onEnter: ({ send }) => send("Welcome!")
 * };
 * ```
 */

export * from "./bot";
export * from "./flow";
export * from "./node-handlers";
export * from "./plugin";
