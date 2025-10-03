import ChatList from "../components/chat/ChatList";
import ChatBox from "../components/chat/ChatBox";
import { useWebSocket } from "../ws/chat";
import { API_BASE } from "../config/api";

export default function Chat() {
  const {
    sendMessage,
    setOnMessage,
    choosenModel,
    setChoosenModel,
    conversationId,
    setConversationId,
    chatVersion,
    setChatVersion,
    chatHistoryMemoryRef,
  } = useWebSocket(`${API_BASE}/ws/chat/new`);
  return (
    <div className="flex flex-col min-h-0 w-full flex-grow">
      <h1 className="text-2xl font-bold mb-4 justify-center">Chat</h1>
      <div className="flex flex-row min-h-0 h-full">
        <ChatList
          sendMessage={sendMessage}
          conversationId={conversationId}
          setConversationId={setConversationId}
          chatVersion={chatVersion}
          setChatVersion={setChatVersion}
          chatHistoryMemoryRef={chatHistoryMemoryRef}
        />
        <ChatBox
          sendMessage={sendMessage}
          setOnMessage={setOnMessage}
          choosenModel={choosenModel}
          setChoosenModel={setChoosenModel}
          conversationId={conversationId}
          setConversationId={setConversationId}
          chatVersion={chatVersion}
          setChatVersion={setChatVersion}
          chatHistoryMemoryRef={chatHistoryMemoryRef}
        />
      </div>
    </div>
  );
}
