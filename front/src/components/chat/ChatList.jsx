import { ChatConversation } from "../../types/chat";
import { useEffect, useState } from "react";
import { fetchConversations } from "../../api/conversations";

export default function ChatList() {
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
  }, []);
  return (
    <div className="flex flex-col min-h-0 w-1/5 border-gray-500 border-2 rounded-md p-4">
      <h5 className="text-2xl font-bold">Chat List</h5>
      <p>Chat List - placeholder</p>
    </div>
  );
}
