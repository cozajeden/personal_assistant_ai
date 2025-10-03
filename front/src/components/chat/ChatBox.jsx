import ChatHistory from "./ChatHistory";
import InputBox from "./InputBox";
import SelectModel from "./SelectModel";

const components = {
  ChatHistory,
  InputBox,
};

export default function ChatBox({
  conversationId,
  setConversationId,
  sendMessage,
  setOnMessage,
  choosenModel,
  setChoosenModel,
  chatVersion,
  setChatVersion,
  chatHistoryMemoryRef,
}) {
  if (conversationId === null) {
    return (
      <div className="flex flex-col min-h-0 min-w-0 w-full border-gray-500 border-2 items-center justify-center">
        <div>Select a conversation from the list</div>
        <div>or</div>
        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => {
            setConversationId(0);
            sendMessage({ command: "start", conversation_id: 0 });
          }}
        >
          create a new conversation
        </button>
        <div className="h-fit w-ful">
          <SelectModel
            setChoosenModel={setChoosenModel}
            choosenModel={choosenModel}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-0 min-w-0 w-4/5 border-gray-500 border-2 rounded-md grow">
      <ChatHistory
        setOnMessage={setOnMessage}
        conversationId={conversationId}
        chatVersion={chatVersion}
        setChatVersion={setChatVersion}
        chatHistoryMemoryRef={chatHistoryMemoryRef}
      />
      <InputBox
        sendMessage={sendMessage}
        setChoosenModel={setChoosenModel}
        choosenModel={choosenModel}
      />
    </div>
  );
}
