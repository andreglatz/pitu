import { twiml } from "twilio";

import { BotPlugin } from "@/types/plugin";

/**
 * Creates a Twilio plugin that transforms bot messages into TwiML format.
 *
 * This plugin intercepts bot execution and converts all outgoing messages
 * into Twilio Messaging Response (TwiML) format, which is required for
 * Twilio webhook responses. The plugin wraps each message in a TwiML
 * `<Message>` element and returns the complete TwiML string.
 *
 * @returns A BotPlugin that transforms messages to TwiML format
 *
 * @example
 * ```typescript
 * import { Bot } from "./core";
 * import { twilioPlugin } from "./plugins/twilio";
 *
 * const bot = new Bot({
 *   defaultStartNode: "main.welcome",
 *   plugins: [twilioPlugin()]
 * });
 *
 * // Bot messages like ["Hello!", "How can I help?"]
 * // Will be transformed to TwiML format:
 * // "<?xml version="1.0" encoding="UTF-8"?><Response><Message>Hello!</Message><Message>How can I help?</Message></Response>"
 * ```
 *
 * @see {@link https://www.twilio.com/docs/messaging/twiml | Twilio TwiML Documentation}
 */
export const twilioPlugin = (): BotPlugin => ({
  intercept: async (context, next) => {
    const t = new twiml.MessagingResponse();

    const result = await next();

    result.messages.forEach((m) => t.message(m));
    result.messages = [t.toString()];

    return result;
  },
});
