import { Model } from "./models";
import { ChatHistoryMemory, ChatMessage, ChatConversation } from "./chat";

export type ChatStateListener = (state: ChatState) => void;

export interface ChatState {
  // WebSocket state
  isConnected: boolean;
  url: string;

  // Model state
  selectedModel: Model;

  // Conversation state
  currentConversationId: number | null;
  conversations: ChatConversation[];

  // Chat history state
  chatHistory: ChatHistoryMemory;
  chatVersion: number;

  // UI state
  isLoading: boolean;
  error: string | null;
}

export class ChatStateManager {
  private state: ChatState;
  private listeners: Set<ChatStateListener> = new Set();
  private ws: WebSocket | null = null;
  private messageHandler: ((data: string) => void) | null = null;

  constructor(wsUrl: string) {
    this.state = {
      isConnected: false,
      url: wsUrl,
      selectedModel: new Model({
        model_name: undefined,
        context_window: 0,
        size: 0,
        capabilities: [],
      }),
      currentConversationId: null,
      conversations: [],
      chatHistory: new ChatHistoryMemory(),
      chatVersion: 0,
      isLoading: false,
      error: null,
    };
  }

  // State management methods
  subscribe(listener: ChatStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private updateState(updates: Partial<ChatState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // WebSocket methods
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(this.state.url);

    this.ws.onopen = () => {
      this.updateState({ isConnected: true, error: null });
      console.debug("WebSocket connected");
    };

    this.ws.onmessage = (event) => {
      console.debug("WebSocket message:", event.data);
      if (this.messageHandler) {
        this.messageHandler(event.data);
      } else {
        console.error("No message handler set");
      }
    };

    this.ws.onclose = () => {
      this.updateState({ isConnected: false });
      console.debug("WebSocket disconnected");
    };

    this.ws.onerror = (err) => {
      this.updateState({ error: `WebSocket error: ${err}` });
      console.error("WebSocket error", err);
    };
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.updateState({ isConnected: false });
  }

  setMessageHandler(handler: (data: string) => void): void {
    this.messageHandler = handler;
  }

  sendMessage(message: any): void {
    console.debug(
      "Sending message:",
      message,
      this.state.selectedModel,
      this.state.currentConversationId
    );
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          model_name: this.state.selectedModel.model_name,
          conversation_id: this.state.currentConversationId,
          ...message,
        })
      );
    }
  }

  // Model methods
  setSelectedModel(model: Model): void {
    this.updateState({ selectedModel: model });
  }

  // Conversation methods
  setCurrentConversationId(id: number | null): void {
    this.updateState({ currentConversationId: id });
    if (id !== null) {
      this.state.chatHistory.clear();
      this.updateState({ chatVersion: this.state.chatVersion + 1 });
    }
  }

  setConversations(conversations: ChatConversation[]): void {
    this.updateState({ conversations });
  }

  addConversation(conversation: ChatConversation): void {
    this.updateState({
      conversations: [...this.state.conversations, conversation],
    });
  }

  // Chat history methods
  addMessage(message: ChatMessage): void {
    this.state.chatHistory.addMessage(message);
    this.updateState({ chatVersion: this.state.chatVersion + 1 });
  }

  getMessages(): ChatMessage[] {
    return this.state.chatHistory.getMessages();
  }

  clearChatHistory(): void {
    this.state.chatHistory.clear();
    this.updateState({ chatVersion: this.state.chatVersion + 1 });
  }

  // UI state methods
  setLoading(loading: boolean): void {
    this.updateState({ isLoading: loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  // Getters for current state
  getCurrentState(): ChatState {
    return { ...this.state };
  }

  // Convenience methods
  startNewConversation(): void {
    this.setCurrentConversationId(0);
    this.sendMessage({ command: "start", conversation_id: 0 });
  }

  processIncomingMessage(rawData: string): void {
    try {
      const parsed = JSON.parse(rawData);
      parsed.forEach((msg: any) => {
        const message = new ChatMessage(msg);
        this.addMessage(message);
      });
    } catch (e) {
      console.error("Invalid JSON from WS:", rawData);
      this.setError(`Invalid JSON from WebSocket: ${e}`);
    }
  }
}
