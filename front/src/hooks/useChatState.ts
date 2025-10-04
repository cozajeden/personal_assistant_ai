import { useEffect, useState, useCallback } from "react";
import { ChatStateManager, ChatState } from "../types/ChatStateManager";

let globalChatStateManager: ChatStateManager | null = null;

export function useChatState(wsUrl: string) {
  const [state, setState] = useState<ChatState | null>(null);

  // Initialize global state manager
  useEffect(() => {
    if (!globalChatStateManager) {
      globalChatStateManager = new ChatStateManager(wsUrl);
    }

    const unsubscribe = globalChatStateManager.subscribe(setState);
    globalChatStateManager.connect();

    return () => {
      unsubscribe();
    };
  }, [wsUrl]);

  // Set up message handler
  useEffect(() => {
    if (globalChatStateManager) {
      globalChatStateManager.setMessageHandler((data) => {
        globalChatStateManager?.processIncomingMessage(data);
      });
    }
  }, []);

  const actions = {
    sendMessage: useCallback((message: any) => {
      globalChatStateManager?.sendMessage(message);
    }, []),

    setSelectedModel: useCallback((model: any) => {
      globalChatStateManager?.setSelectedModel(model);
    }, []),

    setCurrentConversationId: useCallback((id: number | null) => {
      globalChatStateManager?.setCurrentConversationId(id);
    }, []),

    setConversations: useCallback((conversations: any[]) => {
      globalChatStateManager?.setConversations(conversations);
    }, []),

    addConversation: useCallback((conversation: any) => {
      globalChatStateManager?.addConversation(conversation);
    }, []),

    clearChatHistory: useCallback(() => {
      globalChatStateManager?.clearChatHistory();
    }, []),

    startNewConversation: useCallback(() => {
      globalChatStateManager?.startNewConversation();
    }, []),

    setLoading: useCallback((loading: boolean) => {
      globalChatStateManager?.setLoading(loading);
    }, []),

    setError: useCallback((error: string | null) => {
      globalChatStateManager?.setError(error);
    }, []),
  };

  return {
    state,
    actions,
  };
}
