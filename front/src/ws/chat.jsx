import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url) {
  const ws = useRef(null);
  const messageHandler = useRef(null);

  // Register callback from outside
  const setOnMessage = useCallback((callback) => {
    messageHandler.current = callback;
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      console.log("WebSocket message:", event.data);
      if (messageHandler.current) {
        messageHandler.current(event.data);
      } else {
        console.error("No message handler set");
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  }, []);

  return { sendMessage, setOnMessage };
}
