export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export function readMessages(value: string) {
  try {
    const messages = JSON.parse(value) as ChatMessage[];
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

export function addMessage(value: string, role: ChatMessage["role"], content: string) {
  return JSON.stringify([...readMessages(value), { role, content, createdAt: new Date().toISOString() }]);
}
