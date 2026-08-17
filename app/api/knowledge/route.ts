import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { cleanText, saveKnowledge } from "@/lib/knowledge";
import { fetchPublicWebsite } from "@/lib/safe-url";
import { jsonBody, oneOf, strOptional, url } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const body = await jsonBody(request);
    const type = oneOf(body.type, ["WEBSITE", "MANUAL"], "type");
    const knowledgeUrl = url(body.url, "url", true);
    let content = strOptional(body.content, "content") || "";

    if (type === "WEBSITE") {
      if (!knowledgeUrl) return jsonError("Website URL is required");
      content = cleanText(await fetchPublicWebsite(knowledgeUrl));
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
