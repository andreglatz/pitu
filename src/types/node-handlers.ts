/**
 * Configuration object defining the behavior handlers for a conversation node.
 *
 * Each node in a flow can have optional handlers for different lifecycle events:
 * - `onEnter`: Called when the conversation transitions into this node
 * - `onReceive`: Called when a message is received while in this node
 * - `end`: Marks the node as terminal, ending the conversation
 *
 * @template T - The type of context data passed through the conversation
 *
 * @example
 * ```typescript
 * const menuNode: NodeHandlers<{ userId: string }> = {
 *   onEnter: ({ send, context }) => {
 *     send(`Welcome ${context.userId}! Choose an option:`);
 *   },
 *   onReceive: ({ message, transition, send }) => {
 *     switch (message) {
 *       case "1":
 *         transition("booking.start");
 *         break;
 *       case "2":
 *         transition("help.main");
 *         break;
 *       default:
 *         send("Please choose a valid option");
 *     }
 *   }
 * };
 * ```
 */
export type NodeHandlers<T = any> = {
  /**
   * Optional flag to mark this node as terminal.
   * When `true`, the conversation ends after this node executes,
   * and no further transitions are possible.
   */
  end?: boolean;

  /**
   * Optional handler called when the conversation enters this node.
   * Typically used to send welcome messages or initialize node state.
   * Called before `onReceive` when transitioning to a new node.
   *
   * @param args - Arguments containing context, send function, and transition function
   */
  onEnter?: (args: OnEnterArgs<T>) => Promise<void> | void;

  /**
   * Optional handler called when a message is received while in this node.
   * Used to process user input and determine next actions or transitions.
   * Only called when a message is provided to the bot's run method.
   *
   * @param args - Arguments containing the message, context, send function, and transition function
   */
  onReceive?: (args: OnReceiveArgs<T>) => Promise<void> | void;
};

/**
 * Arguments passed to a node's `onEnter` handler when the conversation transitions into the node.
 *
 * @template T - The type of context data maintained throughout the conversation
 *
 * @example
 * ```typescript
 * const handler = ({ context, send, transition }: OnEnterArgs<UserContext>) => {
 *   send(`Welcome back, ${context.userName}!`);
 *   if (context.isFirstVisit) {
 *     transition("onboarding.start");
 *   }
 * };
 * ```
 */
export type OnEnterArgs<T = any> = {
  /**
   * The conversation context data of type T.
   * Contains persistent data that can be read and potentially modified.
   */
  context: T;

  /**
   * Function to send a message back to the user.
   * Messages are queued and returned in the FlowResponse.
   *
   * @param message - The message text to send to the user
   */
  send: (message: string) => void;

  /**
   * Function to transition to another node.
   * Can transition within the same flow (using just node ID) or to other flows (using "flow.node" format).
   *
   * @param nodeId - Target node ID, either "nodeId" for same flow or "flow.nodeId" for different flow
   */
  transition: (nodeId: string) => void;
};

/**
 * Arguments passed to a node's `onReceive` handler when a message is received while in the node.
 *
 * @template T - The type of context data maintained throughout the conversation
 *
 * @example
 * ```typescript
 * const handler = ({ message, context, send, transition }: OnReceiveArgs<UserContext>) => {
 *   if (message.toLowerCase() === "help") {
 *     send("Available commands: menu, quit, status");
 *   } else if (message.toLowerCase() === "quit") {
 *     transition("main.goodbye");
 *   } else {
 *     send("I didn't understand that. Type 'help' for available commands.");
 *   }
 * };
 * ```
 */
export type OnReceiveArgs<T = any> = {
  /**
   * The message text received from the user.
   * This is the input that triggered the onReceive handler.
   */
  message: string;

  /**
   * The conversation context data of type T.
   * Contains persistent data that can be read and potentially modified.
   */
  context: T;

  /**
   * Function to send a message back to the user.
   * Messages are queued and returned in the FlowResponse.
   *
   * @param message - The message text to send to the user
   */
  send: (message: string) => void;

  /**
   * Function to transition to another node.
   * Can transition within the same flow (using just node ID) or to other flows (using "flow.node" format).
   *
   * @param nodeId - Target node ID, either "nodeId" for same flow or "flow.nodeId" for different flow
   */
  transition: (nodeId: string) => void;
};
