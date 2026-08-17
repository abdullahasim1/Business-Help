type PublicBusiness = {
  website: string | null;
  publicKey: string;
  allowedOrigins: string | null;
};

function originFromUrl(value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string) {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

// Each business can allow its main website plus extra domains written one per line.
export function allowedOrigins(business: PublicBusiness) {
  const extraOrigins = business.allowedOrigins?.split(/[\n,]/) || [];
  return [business.website, ...extraOrigins].map(originFromUrl).filter((value): value is string => Boolean(value));
}

export function isAllowedWidgetRequest(request: Request, business: PublicBusiness, widgetKey?: string | null) {
  const origin = request.headers.get("origin");
  const keyMatches = Boolean(widgetKey && widgetKey === business.publicKey);
  const appOrigin = originFromUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (!keyMatches) return false;
  if (process.env.NODE_ENV !== "production" && (!origin || isLocalOrigin(origin))) return true;
  return Boolean(origin && (origin === appOrigin || allowedOrigins(business).includes(origin)));
}

export function corsOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin && originFromUrl(origin) ? origin : undefined;
}
