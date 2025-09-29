import { API_BASE } from "../config/api";

export const fetchConversations = async (limit = 30) => {
  const response = await fetch(
    `${API_BASE}/conversations/get/list?limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
};

export const fetchConversation = async (conversationId) => {
  const response = await fetch(
    `${API_BASE}/conversations/get/show?conversation_id=${conversationId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }
  return response.json();
};
