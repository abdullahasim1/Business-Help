import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";

type ContactDetails = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  interestedService?: string | null;
};

// A visitor token prevents numeric contact IDs from being used as public credentials.
export async function findBusinessContact(contactId: number, businessId: number, visitorToken?: string | null) {
  if (!visitorToken) return null;
  return prisma.contact.findFirst({ where: { id: contactId, businessId, visitorToken } });
}

// Returns the visitor's existing contact when they start a new conversation with the same token.
export async function findContactByToken(businessId: number, visitorToken?: string | null) {
  if (!visitorToken) return null;
  return prisma.contact.findFirst({ where: { businessId, visitorToken } });
}

// Public widget requests always create a new lead. They never update an old lead by email or phone.
export async function createWidgetContact(businessId: number, details: ContactDetails, visitorToken?: string) {
  if (!details.name && !details.email && !details.phone) return null;

  return prisma.contact.create({
    data: {
      businessId,
      name: details.name || undefined,
      email: details.email || undefined,
      phone: details.phone || undefined,
      interestedService: details.interestedService || undefined,
      source: "AI Widget",
      visitorToken: visitorToken || randomBytes(24).toString("base64url")
    }
  });
}

// Fills in contact details as the visitor shares them during the chat conversation.
export async function updateWidgetContact(contactId: number, businessId: number, visitorToken: string | null, details: ContactDetails) {
  if (!visitorToken) return null;
  const data: ContactDetails = {};
  if (details.name) data.name = details.name;
  if (details.email) data.email = details.email;
  if (details.phone) data.phone = details.phone;
  if (details.interestedService) data.interestedService = details.interestedService;
  if (!Object.keys(data).length) return null;

  return prisma.contact.updateMany({
    where: { id: contactId, businessId, visitorToken },
    data
  });
}
