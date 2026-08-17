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

// Public widget requests always create a new lead. They never update an old lead by email or phone.
export async function createWidgetContact(businessId: number, details: ContactDetails) {
  if (!details.email && !details.phone) return null;

  return prisma.contact.create({
    data: {
      businessId,
      name: details.name || undefined,
      email: details.email || undefined,
      phone: details.phone || undefined,
      interestedService: details.interestedService || undefined,
      source: "AI Widget",
      visitorToken: randomBytes(24).toString("base64url")
    }
  });
}
