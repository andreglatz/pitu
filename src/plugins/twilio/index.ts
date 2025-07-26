/**
 * @fileoverview Twilio plugin for bot message transformation.
 *
 * This module provides a plugin that transforms bot messages into
 * Twilio Messaging Response (TwiML) format, which is required for
 * Twilio webhook responses in SMS/WhatsApp applications.
 *
 * @example
 * ```typescript
 * import { twilioPlugin } from "./plugins/twilio";
 * import { Bot } from "./core";
 *
 * const bot = new Bot({
 *   defaultStartNode: "main.welcome",
 *   plugins: [twilioPlugin()]
 * });
 * ```
 *
 * @see {@link https://www.twilio.com/docs/messaging/twiml | Twilio TwiML Documentation}
 */

export * from "./twilio";
