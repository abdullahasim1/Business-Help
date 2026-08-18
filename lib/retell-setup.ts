import { prisma } from "@/lib/prisma";

const SETTINGS = {
  llmId: "retellDefaultLlmId"
} as const;

const cache = new Map<string, string>();

const AGENT_PROMPT = `You are {{agent_name}}.

{{system_instructions}}

Previously collected visitor details (do not ask for these again if listed): {{contact_summary}}

Answer only the question asked. Keep responses concise and do not add unrelated information.
Share the booking link {{booking_url}} only when the visitor asks to book or schedule a meeting. Never invent or alter the link. If {{booking_url}} is empty, do not mention any booking link.

Tone: {{tone}}
Language: {{language}}

Business knowledge:
{{business_knowledge}}`;

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
      system_instructions: "",
      contact_summary: "",
      business_knowledge: "",
      agent_name: "Assistant",
      language: "English",
      tone: "Helpful",
      booking_url: ""
    }
  });

  if (!data.llm_id) throw new Error("Retell did not return an llm_id");
  await saveSetting(SETTINGS.llmId, data.llm_id);
  return data.llm_id;
}

// Returns the business's own chat agent (named after the business), creating it on first use.
export async function ensureBusinessChatAgent(businessId: number, agentName: string): Promise<string> {
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { chatAgentId: true } });
  if (business?.chatAgentId) return business.chatAgentId;

  const llmId = await ensureRetellLlm();
  const data = await retellPost<{ agent_id?: string }>("/create-chat-agent", {
    response_engine: { type: "retell-llm", llm_id: llmId },
    agent_name: agentName,
    language: "en-US",
    end_chat_after_silence_ms: 1_800_000,
    auto_close_message: "Thank you for chatting. The conversation has ended."
  });

  if (!data.agent_id) throw new Error("Retell did not return an agent_id");
  await prisma.business.update({ where: { id: businessId }, data: { chatAgentId: data.agent_id } });
  return data.agent_id;
}

// Returns the business's own voice agent (named after the business), creating it on first use.
export async function ensureBusinessVoiceAgent(businessId: number, agentName: string): Promise<string> {
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { voiceAgentId: true } });
  if (business?.voiceAgentId) return business.voiceAgentId;

  const llmId = await ensureRetellLlm();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
    ? process.env.NEXT_PUBLIC_APP_URL
    : null;

  const data = await retellPost<{ agent_id?: string }>("/v2/create-agent", {
    response_engine: { type: "retell-llm", llm_id: llmId },
    agent_name: agentName,
    voice_id: "retell-Cimo",
    language: "en-US",
    ...(appUrl ? { call_webhook_url: `${appUrl}/api/retell/webhook` } : {})
  });

  if (!data.agent_id) throw new Error("Retell did not return an agent_id");
  await prisma.business.update({ where: { id: businessId }, data: { voiceAgentId: data.agent_id } });
  return data.agent_id;
}
