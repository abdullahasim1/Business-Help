import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { extractPdfText, saveKnowledgeDoc } from "@/lib/knowledge";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return jsonError("PDF file is required", 422);
    if (file.type !== "application/pdf") return jsonError("Only PDF files are allowed", 422);
    if (file.size > MAX_FILE_SIZE) return jsonError("PDF must be under 10 MB", 422);

    const buffer = Buffer.from(await file.arrayBuffer());
    const content = await extractPdfText(buffer);

    if (!content.trim()) {
      return jsonError("No readable text found in this PDF. It may be a scanned image.", 422);
    }

    const doc = await saveKnowledgeDoc(user.businessId!, file.name, file.size, content);
    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
