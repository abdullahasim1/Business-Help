import { corsJson, corsOptions } from "@/lib/cors";
import { parseId } from "@/lib/ids";
import { corsOrigin, isAllowedWidgetRequest } from "@/lib/public-widget";
import { prisma } from "@/lib/prisma";
import { allowRequest, requestIp } from "@/lib/rate-limit";

export function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function GET(request: Request, { params }: { params: Promise<{ businessId: string }> }) {
  const origin = corsOrigin(request);
  const businessId = parseId((await params).businessId);
  if (!businessId) return corsJson({ error: "Invalid business ID" }, { status: 400 }, origin);
  const business = await prisma.business.findFirst({
    where: { id: businessId, status: "ACTIVE" }
  });

  if (!business) {
    return corsJson({ error: "Business not found" }, { status: 404 }, origin);
  }

  const widgetKey = new URL(request.url).searchParams.get("key");
  if (!isAllowedWidgetRequest(request, business, widgetKey)) {
    return corsJson({ error: "This widget is not allowed on this website." }, { status: 403 }, origin);
  }

  if (!allowRequest(`widget:${business.id}:${requestIp(request)}`, 60, 60_000)) {
    return corsJson({ error: "Too many widget requests. Please try again shortly." }, { status: 429 }, origin);
  }

  return corsJson({
    business: { id: business.id, name: business.name },
    widget: {
      welcomeMessage: business.welcomeMessage,
      primaryColor: business.primaryColor,
      callEnabled: business.callEnabled,
      chatEnabled: business.chatEnabled
    },
    agent: business.agentStatus === "ACTIVE" ? { name: business.agentName } : null
  }, undefined, origin);
}
