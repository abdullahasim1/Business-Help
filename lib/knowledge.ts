import pdfParse from "pdf-parse";
import { prisma } from "./prisma";

export function cleanText(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function saveKnowledge(businessId: number, content: string) {
  return prisma.business.update({
    where: { id: businessId },
    data: { knowledgeText: cleanText(content) }
  });
}

export async function extractPdfText(buffer: Buffer) {
  const result = await pdfParse(buffer);
  return cleanText(result.text).slice(0, 100_000);
}

export async function listKnowledgeDocs(businessId: number) {
  return prisma.knowledgeDoc.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true, fileSize: true, createdAt: true }
  });
}

export async function saveKnowledgeDoc(businessId: number, fileName: string, fileSize: number, content: string) {
  return prisma.knowledgeDoc.create({
    data: { businessId, fileName, fileSize, content }
  });
}

export async function deleteKnowledgeDoc(id: number, businessId: number) {
  await prisma.knowledgeDoc.deleteMany({ where: { id, businessId } });
}

export async function retrieveKnowledge(businessId: number) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { knowledgeText: true }
  });

  const docs = await prisma.knowledgeDoc.findMany({
    where: { businessId },
    select: { fileName: true, content: true }
  });

  const inline = business?.knowledgeText || "";
  const docText = docs.map((doc) => `[From document: ${doc.fileName}]\n${doc.content}`).join("\n\n");

  return [inline, docText].filter(Boolean).join("\n\n").slice(0, 12_000);
}
