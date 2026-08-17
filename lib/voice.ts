import { randomUUID } from "node:crypto";
import { ensureVoiceAgent } from "@/lib/retell-setup";

export type VoiceCallContext = {
  agentName: string;
  language: string;
  tone: string;
  knowledge: string;
  welcomeMessage: string;
  bookingUrl: string | null;
};

export async function startVoiceCall(params: {
  businessId: number;
  contactId?: number;
  voiceAgentId?: string | null;
  context?: VoiceCallContext;
}) {
  const apiKey = process.env.RETELL_API_KEY;

  let voiceAgentId = params.voiceAgentId;
  if (!voiceAgentId && apiKey) {
    try {
      voiceAgentId = await ensureVoiceAgent();
    } catch (error) {
      console.error("Default voice agent unavailable", error);
    }
  }

  if (!apiKey || !voiceAgentId) {
    return {
      providerCallId: `mock_${randomUUID()}`,
      clientSecret: "mock-call-session",
      mode: "unavailable" as const,
      summary: "Voice call setup is incomplete."
    };
  }

  const response = await fetch("https://api.retellai.com/v2/create-web-call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      agent_id: voiceAgentId,
      metadata: { businessId: params.businessId, contactId: params.contactId },
      ...(params.context
        ? {
            retell_llm_dynamic_variables: {
              business_knowledge: params.context.knowledge || "No business knowledge has been added yet.",
              agent_name: params.context.agentName,
              language: params.context.language,
              tone: params.context.tone,
              welcome_message: params.context.welcomeMessage,
              booking_url: params.context.bookingUrl || "https://calendly.com/your-name"
            }
          }
        : {})
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Retell create-web-call failed", text);
    throw new Error("Could not start the voice call");
  }

  const data = (await response.json()) as { call_id?: string; access_token?: string };
  return {
    providerCallId: data.call_id,
    clientSecret: data.access_token,
    mode: "live" as const,
    summary: "Voice call session created."
  };
}
