import ChatHistory from "./ChatHistory";
import InputBox from "./InputBox";
import { useWebSocket } from "../../ws/chat";
import { API_BASE } from "../../config/api";

const components = {
  ChatHistory,
  InputBox,
};

export default function ChatBox() {
  const { sendMessage, setOnMessage } = useWebSocket(`${API_BASE}/ws/chat/new`);
  return (
    <div className="flex flex-col min-h-0 min-w-0 w-4/5 border-gray-500 border-2 rounded-md grow">
      <ChatHistory setOnMessage={setOnMessage} />
      <InputBox sendMessage={sendMessage} />
    </div>
  );
}
