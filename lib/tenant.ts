import { Role } from "@prisma/client";
import { jsonError } from "./http";
import type { SessionUser } from "./auth";

export function businessScopeFor(user: SessionUser, requestedBusinessId?: number) {
  if (user.role === Role.SUPER_ADMIN) {
    if (!requestedBusinessId) throw new Error("Super Admin must select a business");
    return requestedBusinessId;
  }

  if (!user.businessId) throw new Error("Business Admin is not assigned to a business");
  return user.businessId;
}

export function forbidBusinessAdminCrossTenant(user: SessionUser, businessId: number) {
  if (user.role === Role.BUSINESS_ADMIN && user.businessId !== businessId) {
    return jsonError("Forbidden", 403);
  }

  return null;
}
