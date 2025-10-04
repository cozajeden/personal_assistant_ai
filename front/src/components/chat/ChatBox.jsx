import ChatHistory from "./ChatHistory";
import InputBox from "./InputBox";
import SelectModel from "./SelectModel";

const components = {
  ChatHistory,
  InputBox,
};

export default function ChatBox({ state, actions }) {
  if (state.currentConversationId === null) {
    return (
      <div className="flex flex-col min-h-0 min-w-0 w-full border-gray-500 border-2 items-center justify-center">
        <div>Select a conversation from the list</div>
        <div>or</div>
        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => {
            actions.startNewConversation();
          }}
        >
          create a new conversation
        </button>
        <div className="h-fit w-ful">
          <SelectModel actions={actions} state={state} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-0 min-w-0 w-4/5 border-gray-500 border-2 rounded-md grow">
      <ChatHistory state={state} actions={actions} />
      <InputBox state={state} actions={actions} />
    </div>
  );
}
