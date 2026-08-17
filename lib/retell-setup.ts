import { prisma } from "@/lib/prisma";

const SETTINGS = {
  llmId: "retellDefaultLlmId",
  chatAgentId: "retellDefaultChatAgentId",
  voiceAgentId: "retellDefaultVoiceAgentId"
} as const;

const cache = new Map<string, string>();

const AGENT_PROMPT = `You are {{agent_name}}, an AI assistant for the business. Always reply in clear, simple English only. Never use Roman Urdu, Urdu, or Hinglish.

Use the business knowledge below to answer. If the answer is not in the knowledge, say you do not have that information and politely ask for the visitor's name, phone number, email, and what they need so the team can follow up.

When the visitor wants to book an appointment or meeting, share the booking link {{booking_url}} and help them pick a convenient time.

Welcome message: {{welcome_message}}
Tone: {{tone}}
Language: {{language}}

Business knowledge:
{{business_knowledge}}

Never invent prices, offers, or facts that are not in the knowledge.`;

function apiKey() {
  const key = process.env.RETELL_API_KEY;
  if (!key) throw new Error("Retell API key is not configured");
  return key;
}

async function retellPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`https://api.retellai.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Retell ${path} failed`, text);
    throw new Error(`Retell setup failed: ${text}`);
  }

  return response.json() as Promise<T>;
}

async function readSetting(key: string): Promise<string | null> {
  if (cache.has(key)) return cache.get(key)!;
  const row = await prisma.appSetting.findUnique({ where: { key } });
  if (row) cache.set(key, row.value);
  return row?.value ?? null;
}

async function saveSetting(key: string, value: string) {
  cache.set(key, value);
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

function envId(envName: string, settingKey: string): Promise<string | null> {
  const fromEnv = process.env[envName];
  if (fromEnv) return Promise.resolve(fromEnv);
  return readSetting(settingKey);
}

// Creates the shared Retell LLM once (used by both the default chat and voice agents).
async function ensureRetellLlm(): Promise<string> {
  const existing = await envId("RETELL_DEFAULT_LLM_ID", SETTINGS.llmId);
  if (existing) return existing;

  const data = await retellPost<{ llm_id?: string }>("/create-retell-llm", {
    general_prompt: AGENT_PROMPT,
    model: "gpt-4.1",
    default_dynamic_variables: {
      business_knowledge: "No business knowledge has been added yet.",
      agent_name: "Assistant",
      language: "English",
      tone: "Helpful",
      welcome_message: "Hi! How can I help today?",
      booking_url: "https://calendly.com/your-name"
    }
  });

  if (!data.llm_id) throw new Error("Retell did not return an llm_id");
  await saveSetting(SETTINGS.llmId, data.llm_id);
  return data.llm_id;
}

// Returns the shared default chat agent, creating it automatically on first use.
export async function ensureChatAgent(): Promise<string> {
  const existing = await envId("RETELL_DEFAULT_CHAT_AGENT_ID", SETTINGS.chatAgentId);
  if (existing) return existing;

  const llmId = await ensureRetellLlm();
  const data = await retellPost<{ agent_id?: string }>("/create-chat-agent", {
    response_engine: { type: "retell-llm", llm_id: llmId },
    agent_name: "AI Widget Assistant",
    language: "en-US",
    end_chat_after_silence_ms: 1_800_000,
    auto_close_message: "Thank you for chatting. The conversation has ended."
  });

  if (!data.agent_id) throw new Error("Retell did not return an agent_id");
  await saveSetting(SETTINGS.chatAgentId, data.agent_id);
  return data.agent_id;
}

// Returns the shared default voice agent, creating it automatically on first use.
export async function ensureVoiceAgent(): Promise<string> {
  const existing = await envId("RETELL_DEFAULT_VOICE_AGENT_ID", SETTINGS.voiceAgentId);
  if (existing) return existing;

  const llmId = await ensureRetellLlm();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
    ? process.env.NEXT_PUBLIC_APP_URL
    : null;

  const data = await retellPost<{ agent_id?: string }>("/v2/create-agent", {
    response_engine: { type: "retell-llm", llm_id: llmId },
    agent_name: "AI Voice Assistant",
    voice_id: "retell-Cimo",
    language: "en-US",
    ...(appUrl ? { call_webhook_url: `${appUrl}/api/retell/webhook` } : {})
  });

  if (!data.agent_id) throw new Error("Retell did not return an agent_id");
  await saveSetting(SETTINGS.voiceAgentId, data.agent_id);
  return data.agent_id;
}
