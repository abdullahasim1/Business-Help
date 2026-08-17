import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_BYTES = 1_000_000;

function isPrivateIp(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }

  const value = address.toLowerCase();
  return value === "::1" || value === "::" || value.startsWith("fe80:") || value.startsWith("fc") || value.startsWith("fd");
}

async function checkUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only HTTP and HTTPS websites are allowed.");
  if (url.username || url.password) throw new Error("Website URL cannot contain login details.");
  if (url.hostname === "localhost") throw new Error("Private website URLs are not allowed.");

  const address = await lookup(url.hostname);
  if (isPrivateIp(address.address)) throw new Error("Private website URLs are not allowed.");
}

async function readLimitedText(response: Response) {
  const length = Number(response.headers.get("content-length") || 0);
  if (length > MAX_BYTES) throw new Error("Website content is too large.");

  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) throw new Error("Website content is too large.");
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

// Fetches only a public website and checks every redirect again.
export async function fetchPublicWebsite(value: string) {
  let url = new URL(value);

  for (let redirects = 0; redirects < 4; redirects += 1) {
    await checkUrl(url);
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000) });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Website redirect is missing a location.");
      url = new URL(location, url);
      continue;
    }

    if (!response.ok) throw new Error("Could not fetch website.");
    return readLimitedText(response);
  }

  throw new Error("Website redirected too many times.");
}
