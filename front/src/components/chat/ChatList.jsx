import { ChatConversation } from "../../types/chat";
import { useEffect, useState } from "react";
import { fetchConversations } from "../../api/conversations";

export default function ChatList({ conversationId, setConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations()
      .then((data) => {
        const conversations = data.conversations.map(
          (conversation) => new ChatConversation(conversation)
        );
        setConversations(conversations);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [conversationId]);


  return (
    <div className="flex flex-col min-h-0 w-1/5 border-gray-500 border-2 rounded-md p-4 gap-4">
      <h5 className="text-2xl font-bold">Chat List</h5>
      <div
        className="hover:bg-gray-700 border-gray-700 border-2 rounded-md cursor-pointer p-0.5 text-center"
        title="New Conversation"
        onClick={() => setConversationId(0)}
      >
        New Conversation
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            className="hover:bg-gray-700 border-gray-700 border-2 rounded-md cursor-pointer p-0.5 text-center"
            title={conversation.id.toString()}
            key={conversation.id}
            onClick={() => setConversationId(conversation.id)}
          >
            {conversation.name}
          </div>
        ))}
      </div>
    </div>
  );
}
