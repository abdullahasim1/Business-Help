export type RetellChatContext = {
  agentName: string;
  language: string;
  tone: string;
  knowledge: string;
  chatAgentId: string | null;
  bookingUrl: string | null;
  instructions: string;
  contactSummary: string;
};

function retellHeaders() {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) throw new Error("Retell API key is not configured");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}

async function retellJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`https://api.retellai.com${path}`, {
    method: "POST",
    headers: retellHeaders(),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    console.error(`Retell ${path} failed`, await response.text());
    throw new Error("Retell request failed");
  }

  return response.json() as Promise<T>;
}

// Starts a Retell chat session for one visitor conversation. The Retell chat agent
// must be built in the Retell dashboard and may use these dynamic variables in its prompt:
// {{business_knowledge}}, {{system_instructions}}, {{agent_name}}, {{language}}, {{tone}}, {{booking_url}}.
export async function startRetellChat(context: RetellChatContext) {
  const data = await retellJson<{ chat_id?: string }>("/create-chat", {
    agent_id: context.chatAgentId,
    retell_llm_dynamic_variables: {
      system_instructions: context.instructions,
      contact_summary: context.contactSummary,
      business_knowledge: context.knowledge,
      agent_name: context.agentName,
      language: context.language,
      tone: context.tone,
      booking_url: context.bookingUrl || ""
    }
  });

  if (!data.chat_id) throw new Error("Retell did not return a chat id");
  return data.chat_id;
}

// Sends one visitor message to an existing Retell chat session and returns the agent reply.
export async function sendRetellChatMessage(chatId: string, message: string) {
  const data = await retellJson<{ messages?: Array<{ role?: string; content?: string }> }>("/create-chat-completion", {
    chat_id: chatId,
    content: message
  });

  const agentMessage = data.messages?.find((item) => item.role === "agent" && item.content);
  return agentMessage?.content || "I do not have enough information to answer that yet.";
}

export async function generateRetellResponse(context: RetellChatContext, providerChatId: string | null, message: string) {
  try {
    const chatId = providerChatId || (await startRetellChat(context));
    const answer = await sendRetellChatMessage(chatId, message);
    return { providerChatId: chatId, answer };
  } catch (error) {
    console.error("Retell chat failed", error);
    return {
      providerChatId: providerChatId || null,
      answer: "I am having trouble reaching the AI service right now. Please try again in a moment."
    };
  }
}

// Local fallback when Retell is not configured yet, so the widget still answers in development.
export function generateLocalKnowledgeResponse(agentName: string, knowledge: string, message: string) {
  const terms = Array.from(
    new Set(
      message
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length > 3)
    )
  );

  const sentences = knowledge
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const usefulText = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: terms.reduce((sum, term) => sum + (sentence.toLowerCase().includes(term) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map((item) => item.sentence)
    .join(" ")
    .slice(0, 700);

  if (!usefulText) return `${agentName}: I do not have that information yet.`;
  return `${agentName}: ${usefulText}`;
}
