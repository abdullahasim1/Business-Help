import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
