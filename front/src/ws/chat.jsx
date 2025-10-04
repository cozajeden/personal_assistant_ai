import { useEffect, useRef, useState, useCallback } from "react";
import { Model } from "../types/models";
import { ChatHistoryMemory } from "../types/chat";

export function useWebSocket(url) {
  const ws = useRef(null);
  const messageHandler = useRef(null);
  const [choosenModel, setChoosenModel] = useState(
    new Model({
      model_name: undefined,
      context_window: 0,
      size: 0,
      capabilities: [],
    })
  );
  const [conversationId, setConversationId] = useState(null);
  const chatHistoryMemoryRef = useRef(new ChatHistoryMemory());
  const [chatVersion, setChatVersion] = useState(0);

  // Register callback from outside
  const setOnMessage = useCallback((callback) => {
    messageHandler.current = callback;
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.debug("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      console.debug("WebSocket message:", event.data);
      if (messageHandler.current) {
        messageHandler.current(event.data);
      } else {
        console.error("No message handler set");
      }
    };

    ws.current.onclose = () => {
      console.debug("WebSocket disconnected");
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = useCallback(
    (message) => {
      console.debug("Sending message:", message, choosenModel, conversationId);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            model_name: choosenModel.model_name,
            conversation_id: conversationId,
            ...message,
          })
        );
      }
    },
    [choosenModel, conversationId]
  );

  return {
    sendMessage,
    setOnMessage,
    choosenModel,
    setChoosenModel,
    conversationId,
    setConversationId,
    chatVersion,
    setChatVersion,
    chatHistoryMemoryRef,
  };
}
