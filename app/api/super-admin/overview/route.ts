import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireSuperAdmin();
  const [totals, businesses, recentContacts] = await Promise.all([
    prisma.$transaction([
      prisma.business.count(),
      prisma.contact.count(),
      prisma.conversation.count(),
      prisma.call.count(),
      prisma.booking.count()
    ]),
    prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        website: true,
        status: true,
        createdAt: true,
        users: { select: { name: true, email: true } },
        _count: { select: { contacts: true, conversations: true, calls: true, bookings: true } }
      }
    }),
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        interestedService: true,
        status: true,
        source: true,
        createdAt: true,
        business: { select: { id: true, name: true } }
      }
    })
  ]);

  const [businessesCount, contacts, conversations, calls, bookings] = totals;

  return NextResponse.json({
    totals: { businesses: businessesCount, contacts, conversations, calls, bookings },
    businesses,
    recentContacts
  });
}