export type LeadFields = {
  name?: string;
  email?: string;
  phone?: string;
  interestedService?: string;
};

export function extractLeadFields(text: string): LeadFields {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim();
  const name = text.match(/(?:my name is|i am|i'm)\s+([a-z][a-z\s'-]{1,60})/i)?.[1]?.trim();
  const interestedService = text.match(/(?:interested in|need|looking for)\s+([a-z][a-z\s'-]{2,80})/i)?.[1]?.trim();

  return { name, email, phone, interestedService };
}
