import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RetellCall = {
  call_id?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  transcript?: string;
  recording_url?: string;
  call_analysis?: { call_summary?: string };
};

function validSignature(body: string, signature: string | null) {
  const apiKey = process.env.RETELL_API_KEY;
  const match = signature?.match(/^v=(\d+),d=([a-f0-9]{64})$/i);
  if (!apiKey || !match) return false;

  const timestamp = Number(match[1]);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 5 * 60_000) return false;

  const expected = createHmac("sha256", apiKey).update(body + match[1]).digest();
  const received = Buffer.from(match[2], "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-retell-signature"))) {
    return NextResponse.json({ error: "Invalid Retell signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { event?: string; call?: RetellCall };
  const call = payload.call;
  if (!call?.call_id || (payload.event !== "call_ended" && payload.event !== "call_analyzed")) {
    return new NextResponse(null, { status: 204 });
  }

  const duration = call.start_timestamp && call.end_timestamp ? Math.max(0, Math.round((call.end_timestamp - call.start_timestamp) / 1000)) : undefined;
  const summary = call.call_analysis?.call_summary || "Call transcript saved.";

  await prisma.call.updateMany({
    where: { providerCallId: call.call_id },
    data: {
      duration,
      transcript: call.transcript || undefined,
      recordingUrl: call.recording_url || undefined,
      summary
    }
  });

  return new NextResponse(null, { status: 204 });
}
