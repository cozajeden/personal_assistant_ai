import ChatList from "../components/chat/ChatList";
import ChatBox from "../components/chat/ChatBox";
import { useChatState } from "../hooks/useChatState";
import { API_BASE } from "../config/api";

export default function Chat() {
  const { state, actions } = useChatState(`${API_BASE}/ws/chat/new`);

  if (!state) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-0 w-full flex-grow">
      <h1 className="text-2xl font-bold mb-4 justify-center">Chat</h1>
      <div className="flex flex-row min-h-0 h-full">
        <ChatList state={state} actions={actions} />
        <ChatBox state={state} actions={actions} />
      </div>
    </div>
  );
}
