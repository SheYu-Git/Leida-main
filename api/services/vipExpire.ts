const MIN_VALID_MS = Date.UTC(2000, 0, 1, 0, 0, 0, 0);
const MAX_VALID_MS = Date.UTC(2100, 0, 1, 0, 0, 0, 0);

export const readVipExpireRawMs = (raw: any): number => {
  if (raw == null || raw === '') return 0;
  if (raw instanceof Date) return Number(raw.getTime() || 0);
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const s = String(raw).trim();
  if (!s) return 0;
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
};

export const normalizeVipExpireMs = (raw: any): number => {
  let ms = readVipExpireRawMs(raw);
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  if (ms > 0 && ms < 1_000_000_000_000) ms *= 1000;
  ms = Math.floor(ms);
  if (ms < MIN_VALID_MS || ms > MAX_VALID_MS) return 0;
  return ms;
};

export const toVipExpireDate = (raw: any): Date | null => {
  const ms = normalizeVipExpireMs(raw);
  if (!ms) return null;
  return new Date(ms);
};

export const formatVipExpireDate = (raw: any): string => {
  const d = toVipExpireDate(raw);
  if (!d) return '';
  return d.toISOString().slice(0, 10);
};
