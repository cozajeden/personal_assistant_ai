import { useEffect, useState, useRef } from "react";

export default function ChatHistory({ setOnMessage }) {
  const [chatHistory, setChatHistory] = useState([]);
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
    setOnMessage((raw) => {
      try {
        const parsed = JSON.parse(raw);
        parsed.forEach((msg) => {
          setChatHistory((prev) => [...prev, formatMessage(msg)]);
        });
      } catch (e) {
        console.error("Invalid JSON from WS:", raw);
      }
    });
  }, [setOnMessage]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.lastElementChild?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chatHistory]);

  return (
    <div
      ref={chatHistoryRef}
      className="flex flex-col h-full overflow-y-auto border border-gray-500 rounded-md p-4 whitespace-pre-wrap"
    >
      {chatHistory.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  );
}
