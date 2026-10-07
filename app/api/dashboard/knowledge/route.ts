import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { listKnowledgeDocs } from "@/lib/knowledge";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireBusinessAdmin();
    const business = await prisma.business.findUnique({
      where: { id: user.businessId! },
      select: { knowledgeText: true }
    });
    const documents = await listKnowledgeDocs(user.businessId!);

    return NextResponse.json({
      knowledgeText: business?.knowledgeText || "",
      documents
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
