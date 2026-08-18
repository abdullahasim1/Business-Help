export type LeadFields = {
  name?: string;
  email?: string;
  phone?: string;
  interestedService?: string;
};

export function extractLeadFields(text: string): LeadFields {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim();
  const stop = "(?!(?:my|phone|email|number|is|and|the|please|a)\\b)";
  const name = text.match(new RegExp(`(?:my name is|i am|i'm)\\s+([a-z]{2,}(?:\\s+${stop}[a-z]{2,}){0,3})`, "i"))?.[1]?.trim();
  const interestedService = text.match(new RegExp(`(?:interested in|need|looking for)\\s+([a-z]{2,}(?:\\s+${stop}[a-z]{2,}){0,4})`, "i"))?.[1]?.trim();

  return { name, email, phone, interestedService };
}
