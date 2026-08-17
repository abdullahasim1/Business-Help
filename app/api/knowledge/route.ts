import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { cleanText, saveKnowledge } from "@/lib/knowledge";
import { fetchPublicWebsite } from "@/lib/safe-url";

const knowledgeSchema = z.object({
  type: z.enum(["WEBSITE", "MANUAL"]),
  url: z.string().url().optional().or(z.literal("")),
  content: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const body = knowledgeSchema.parse(await request.json());
    let content = body.content || "";

    if (body.type === "WEBSITE") {
      if (!body.url) return jsonError("Website URL is required");
      content = cleanText(await fetchPublicWebsite(body.url));
    }

    if (!content.trim()) return jsonError("Knowledge content is empty", 422);

    const business = await saveKnowledge(user.businessId!, content);

    return NextResponse.json({ business });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Website")) {
      return jsonError(error.message, 422);
    }
    return handleRouteError(error);
  }
}
