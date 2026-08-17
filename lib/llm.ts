export type RetellChatContext = {
  agentName: string;
  language: string;
  tone: string;
  knowledge: string;
  welcomeMessage: string;
  chatAgentId: string | null;
  bookingUrl: string | null;
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
// {{business_knowledge}}, {{agent_name}}, {{language}}, {{tone}}, {{welcome_message}}.
export async function startRetellChat(context: RetellChatContext) {
  const data = await retellJson<{ chat_id?: string }>("/create-chat", {
    agent_id: context.chatAgentId,
    retell_llm_dynamic_variables: {
      business_knowledge: context.knowledge || "No business knowledge has been added yet.",
      agent_name: context.agentName,
      language: context.language,
      tone: context.tone,
      welcome_message: context.welcomeMessage,
      booking_url: context.bookingUrl || "https://calendly.com/your-name"
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
export function generateLocalKnowledgeResponse(agentName: string, knowledge: string, message: string, bookingUrl?: string | null) {
  if (!knowledge.trim()) {
    return `${agentName}: I do not have business knowledge for that yet. I can take your name, email, phone, and the service you are interested in so the team can follow up.`;
  }

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

  const ranked = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: terms.reduce((sum, term) => sum + (sentence.toLowerCase().includes(term) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map((item) => item.sentence);

  const usefulText = ranked.join(" ").slice(0, 700);
  const followUp = "If you would like this service, share your name, phone number, and requirement so the team can follow up.";
  const booking = bookingUrl ? ` You can book a time directly here: ${bookingUrl}` : "";

  return `${agentName}: Based on the business knowledge, ${usefulText} ${followUp}${booking}`;
}
