import { ChatConversation } from "../../types/chat";
import { useEffect } from "react";
import { fetchConversations } from "../../api/conversations";

export default function ChatList({ state, actions }) {
  useEffect(() => {
    actions.setLoading(true);
    fetchConversations()
      .then((data) => {
        const conversations = data.conversations.map(
          (conversation) => new ChatConversation(conversation)
        );
        actions.setConversations(conversations);
        actions.setLoading(false);
      })
      .catch((error) => {
        actions.setError(error.message);
        actions.setLoading(false);
      });
  }, [state.currentConversationId]);

  return (
    <div className="flex flex-col min-h-0 w-1/5 border-gray-500 border-2 rounded-md p-4 gap-4">
      <h5 className="text-2xl font-bold">Chat List</h5>
      <div
        className="hover:bg-gray-700 border-gray-700 border-2 rounded-md cursor-pointer p-0.5 text-center"
        title="New Conversation"
        onClick={() => {
          actions.startNewConversation();
        }}
      >
        New Conversation
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto">
        {state.conversations.map((conversation) => (
          <div
            className="hover:bg-gray-700 border-gray-700 border-2 rounded-md cursor-pointer p-0.5 text-center"
            title={conversation.id.toString()}
            key={conversation.id}
            onClick={() => {
              actions.setCurrentConversationId(conversation.id);
              actions.sendMessage({
                command: "start",
                conversation_id: conversation.id,
              });
            }}
          >
            {conversation.name}
          </div>
        ))}
      </div>
    </div>
  );
}
