import { useEffect, useState, useRef } from "react";
import { ChatHistoryMemory, ChatMessage } from "../../types/chat";

export default function ChatHistory({ setOnMessage, conversationId }) {
  const [version, setVersion] = useState(false);
  const chatHistoryMemoryRef = useRef(new ChatHistoryMemory());
  const chatHistoryRef = useRef(null);

  const formatMessage = (message) => {
    if (message.error) {
      return (
        <div className="border-gray-500 border-2 rounded-md p-4">
          <span
            className="font-bold bg-red-500 rounded-md"
            title={JSON.stringify(message)}
          >
            ERROR:
          </span>{" "}
          {message.error} + {message.traceback}
        </div>
      );
    }
    return (
      <div className="border-gray-500 border-2 rounded-md p-4">
        <span
          className="font-bold bg-gray-500 rounded-md"
          title={JSON.stringify(message)}
        >
          {message.type?.toUpperCase()}:
        </span>{" "}
        {message.content}
      </div>
    );
  };

  useEffect(() => {
    chatHistoryMemoryRef.current.clear();
  }, [conversationId]);

  useEffect(() => {
    setOnMessage((raw) => {
      try {
        const parsed = JSON.parse(raw);
        parsed.forEach((msg) => {
          const message = new ChatMessage(msg);
          chatHistoryMemoryRef.current.addMessage(message);
        });
      } catch (e) {
        console.error("Invalid JSON from WS:", raw);
      }
      setVersion((prev) => !prev);
    });
  }, [setOnMessage]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.lastElementChild?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      chatHistoryRef.current.scrollBy(0, chatHistoryRef.current.clientHeight);
    }
  }, [version]);

  return (
    <div
      ref={chatHistoryRef}
      className="flex flex-col h-full overflow-y-auto border border-gray-500 rounded-md p-4 whitespace-pre-wrap"
    >
      {chatHistoryMemoryRef.current.getMessages().map((msg, i) => (
        <div key={i}>{formatMessage(msg)}</div>
      ))}
    </div>
  );
}
