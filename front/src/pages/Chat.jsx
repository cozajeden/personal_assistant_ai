import ChatList from "../components/chat/ChatList";
import ChatBox from "../components/chat/ChatBox";
import { useState } from "react";

export default function Chat() {
  const [conversationId, setConversationId] = useState(null);
  return (
    <div className="flex flex-col min-h-0 w-full flex-grow">
      <h1 className="text-2xl font-bold mb-4 justify-center">Chat</h1>
      <div className="flex flex-row min-h-0 h-full">
        <ChatList setConversationId={setConversationId} />
        <ChatBox
          conversationId={conversationId}
          setConversationId={setConversationId}
        />
      </div>
    </div>
  );
}
