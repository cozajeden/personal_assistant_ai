import { useEffect, useRef } from "react";

export default function ChatHistory({ state, actions }) {
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
      <div
        className={`border-gray-500 ${
          message.type === "ai"
            ? "mr-20"
            : message.type === "generating"
            ? "mr-20"
            : message.type === "human"
            ? "ml-20"
            : "mr-30 ml-30"
        } border-2 rounded-md p-4`}
      >
        <span
          className="font-bold bg-gray-500 rounded-md"
          title={JSON.stringify(message)}
        >
          {message.type?.toUpperCase()}
          {message.type === "tool" ? ` (${message.name})` : ""}:
        </span>{" "}
        {message.content}
      </div>
    );
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.lastElementChild?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      chatHistoryRef.current.scrollBy(0, chatHistoryRef.current.clientHeight);
    }
  }, [state.chatVersion]);

  return (
    <div
      ref={chatHistoryRef}
      className="flex flex-col h-full overflow-y-auto border border-gray-500 rounded-md p-4 whitespace-pre-wrap gap-5"
    >
      {state.chatHistory.getMessages().map((msg, i) => (
        <div key={i}>{formatMessage(msg)}</div>
      ))}
    </div>
  );
}
