export type Conversation = {
  id: number;
  createdAt: string;
  contact: { name: string | null; email: string | null; phone: string | null } | null;
  messagesJson: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string; createdAt: string };

export const readMessages = (value: string): ChatMessage[] => {
  try {
    const messages = JSON.parse(value) as ChatMessage[];
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
};
