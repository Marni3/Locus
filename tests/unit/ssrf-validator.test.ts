import { describe, it, expect, vi } from 'vitest';
import { validateWebhookUrl, isPrivateOrReservedIp } from '../../src/integrations/notifications/ssrfValidator';
import dns from 'dns/promises';

describe('SSRF Validator (Tier 1 TDD)', () => {
  describe('isPrivateOrReservedIp', () => {
    it('detects IPv4 loopbacks (127.0.0.0/8)', () => {
      expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('127.0.1.5')).toBe(true);
    });

    it('detects Cloud Metadata endpoint (169.254.169.254) and link-local (169.254.0.0/16)', () => {
      expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
      expect(isPrivateOrReservedIp('169.254.1.1')).toBe(true);
    });

    it('detects RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)', () => {
      expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('10.255.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('172.31.255.254')).toBe(true);
      expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
      expect(isPrivateOrReservedIp('192.168.0.254')).toBe(true);
    });

    it('detects IPv6 loopback (::1) and private addresses', () => {
      expect(isPrivateOrReservedIp('::1')).toBe(true);
      expect(isPrivateOrReservedIp('fe80::1')).toBe(true);
      expect(isPrivateOrReservedIp('fc00::1')).toBe(true);
    });

    it('allows valid public IP addresses', () => {
      expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
      expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
      expect(isPrivateOrReservedIp('142.250.190.46')).toBe(false); // Google
    });
  });

  describe('validateWebhookUrl', () => {
    it('rejects non-HTTPS URLs', async () => {
      const resHttp = await validateWebhookUrl('http://hooks.zapier.com/catch/123');
      expect(resHttp.isValid).toBe(false);
      expect(resHttp.error).toContain('HTTPS is required');

      const resFtp = await validateWebhookUrl('ftp://example.com/webhook');
      expect(resFtp.isValid).toBe(false);
      expect(resFtp.error).toContain('HTTPS is required');
    });

    it('rejects localhost and cloud metadata endpoints', async () => {
      const resLocal = await validateWebhookUrl('https://localhost:8080/hook');
      expect(resLocal.isValid).toBe(false);
      expect(resLocal.error).toMatch(/internal|private|loopback/i);

      const resMeta = await validateWebhookUrl('https://169.254.169.254/latest/meta-data');
      expect(resMeta.isValid).toBe(false);
      expect(resMeta.error).toMatch(/internal|private|reserved/i);
    });

    it('rejects domain names resolving to internal IPs (DNS Rebinding Defense)', async () => {
      // Mock DNS resolution returning private IP for an attacker domain
      vi.spyOn(dns, 'lookup').mockResolvedValueOnce({
        address: '10.0.0.5',
        family: 4,
      } as any);

      const res = await validateWebhookUrl('https://malicious-internal-proxy.org/hook');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/resolves to private or internal IP/i);
    });

    it('accepts legitimate public HTTPS webhooks', async () => {
      vi.spyOn(dns, 'lookup').mockResolvedValueOnce({
        address: '54.214.24.10',
        family: 4,
      } as any);

      const res = await validateWebhookUrl('https://hooks.zapier.com/hooks/catch/999/xyz');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });
});
