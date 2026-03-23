import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ADMIN_PIN_TOKEN_HEADER = 'x-admin-pin-token';
const ADMIN_ROLES = new Set(['admin', 'superadmin', 'ops_admin', 'order_admin', 'finance_admin', 'support_admin', 'auditor']);

const rolePermissions: Record<string, string[]> = {
  superadmin: ['*'],
  admin: ['member.read', 'member.write', 'order.read', 'order.write', 'code.read', 'code.write', 'reward.read', 'reward.write', 'info.read', 'audit.read', 'admin.read'],
  ops_admin: ['member.read', 'member.write', 'code.read', 'code.write', 'reward.read', 'info.read', 'audit.read'],
  order_admin: ['order.read', 'order.write', 'member.read', 'info.read'],
  finance_admin: ['order.read', 'reward.read', 'reward.write', 'info.read', 'audit.read'],
  support_admin: ['member.read', 'member.write', 'order.read', 'code.read', 'info.read'],
  auditor: ['member.read', 'order.read', 'code.read', 'reward.read', 'info.read', 'audit.read', 'admin.read'],
};

const resolveAdmin = async (req: Request) => {
  const uid = Number((req as any).user?.id || 0);
  if (!uid) return null;
  const user = await User.findByPk(uid);
  return user || null;
};

export const requireAdminRole = async (req: Request, res: Response, next: NextFunction) => {
  const user = await resolveAdmin(req);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const role = String((user as any).role || 'user');
  if (!ADMIN_ROLES.has(role)) {
    res.status(403).json({ code: 0, msg: '仅管理员可访问' });
    return;
  }
  (req as any).adminUser = user;
  next();
};

const getPermissionSet = (user: any) => {
  const role = String((user as any).role || 'user');
  const defaults = rolePermissions[role] || [];
  const set = new Set(defaults);
  const raw = String((user as any).admin_permissions_json || '[]');
  try {
    const extras = JSON.parse(raw);
    if (Array.isArray(extras)) extras.map((x) => String(x || '').trim()).filter(Boolean).forEach((x) => set.add(x));
  } catch (e) {}
  return set;
};

export const hasAdminPermission = (user: any, perm: string) => {
  const p = String(perm || '').trim();
  if (!p) return true;
  const set = getPermissionSet(user);
  if (set.has('*')) return true;
  if (set.has(p)) return true;
  const seg = p.split('.')[0];
  if (seg && set.has(`${seg}.*`)) return true;
  return false;
};

export const requireAdminPermission = (perm: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).adminUser || await resolveAdmin(req);
    if (!user) {
      res.status(401).json({ code: 0, msg: 'Unauthorized' });
      return;
    }
    if (!hasAdminPermission(user, perm)) {
      res.status(403).json({ code: 0, msg: 'Access denied. Admin only.' });
      return;
    }
    (req as any).adminUser = user;
    next();
  };
};

export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = await resolveAdmin(req);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const role = String((user as any).role || 'user');
  if (role !== 'superadmin') {
    res.status(403).json({ code: 0, msg: '仅超级管理员可访问' });
    return;
  }
  (req as any).adminUser = user;
  next();
};

export const signAdminPinToken = (userId: number) => {
  const secret = `${process.env.JWT_SECRET || 'secret'}__admin_pin__`;
  return jwt.sign({ uid: Number(userId), t: 'admin-pin' }, secret, { expiresIn: '30m' });
};

export const verifyAdminPinToken = (token: string) => {
  const secret = `${process.env.JWT_SECRET || 'secret'}__admin_pin__`;
  try {
    return jwt.verify(token, secret) as any;
  } catch (e) {
    return null;
  }
};

export const requireAdminPinVerified = async (req: Request, res: Response, next: NextFunction) => {
  const pinToken = String(req.headers[ADMIN_PIN_TOKEN_HEADER] || '');
  if (!pinToken) {
    res.status(401).json({ code: 0, msg: '需要PIN二次验证' });
    return;
  }
  const payload = verifyAdminPinToken(pinToken);
  const uid = Number((req as any).user?.id || 0);
  if (!payload || Number(payload.uid || 0) !== uid) {
    res.status(401).json({ code: 0, msg: 'PIN验证已失效' });
    return;
  }
  next();
};
