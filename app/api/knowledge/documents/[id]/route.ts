import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { deleteKnowledgeDoc } from "@/lib/knowledge";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireBusinessAdmin();
    const { id } = await context.params;
    await deleteKnowledgeDoc(Number(id), user.businessId!);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
