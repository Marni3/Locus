import dns from 'dns/promises';
import net from 'net';
import { WebhookValidationResult } from './types';

/**
 * Validates whether an IP address belongs to private, loopback, or cloud metadata CIDRs.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;

  // Normalize IPv6 mapped IPv4 (e.g. ::ffff:127.0.0.1)
  const normalized = ip.startsWith('::ffff:') ? ip.slice(7) : ip;

  const ipVersion = net.isIP(normalized);
  if (ipVersion === 0) {
    // Not an IP literal (e.g. a domain name string)
    return false;
  }

  // IPv4 Checks
  if (ipVersion === 4) {
    const parts = normalized.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some(isNaN)) return true;

    const [a, b] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;
    // 10.0.0.0/8 (RFC 1918 Private)
    if (a === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-Local / Cloud Metadata)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (RFC 1918 Private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (RFC 1918 Private)
    if (a === 192 && b === 168) return true;
    // 100.64.0.0/10 (Shared Address Space / CGNAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 198.18.0.0/15 (Benchmarking)
    if (a === 198 && (b === 18 || b === 19)) return true;

    return false;
  }

  // IPv6 Checks
  const lower = normalized.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:')) return true; // Link-local
  if (lower.startsWith('fc00:') || lower.startsWith('fd')) return true; // Unique local

  return false;
}

/**
 * Validates a user-supplied webhook URL at save time AND send time.
 * Enforces HTTPS and verifies that DNS resolution points to a public, safe IP.
 */
export async function validateWebhookUrl(urlString: string): Promise<WebhookValidationResult> {
  if (!urlString || typeof urlString !== 'string') {
    return { isValid: false, error: 'Webhook URL cannot be empty.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { isValid: false, error: 'Invalid URL format.' };
  }

  // 1. Strict HTTPS Scheme Requirement
  if (parsed.protocol !== 'https:') {
    return { isValid: false, error: 'HTTPS is required. Insecure HTTP or other protocols are forbidden.' };
  }

  // 2. Direct Hostname Filter
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { isValid: false, error: 'Localhost and internal hostnames are forbidden.' };
  }

  // Direct IP literal check
  if (isPrivateOrReservedIp(hostname)) {
    return { isValid: false, error: 'Webhook targets internal, private, or cloud metadata IP addresses.' };
  }

  // 3. Dual-Pass DNS Resolution Check (DNS Rebinding Defense)
  try {
    const lookupResult = await dns.lookup(hostname);
    const resolvedIp = lookupResult.address;

    if (isPrivateOrReservedIp(resolvedIp)) {
      return {
        isValid: false,
        error: `Hostname "${hostname}" resolves to private or internal IP (${resolvedIp}).`,
        resolvedIp,
      };
    }

    return { isValid: true, resolvedIp };
  } catch (dnsErr: any) {
    return { isValid: false, error: `Could not resolve hostname "${hostname}" via DNS.` };
  }
}
