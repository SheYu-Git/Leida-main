import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { bindInviterByCode } from '../services/referral.js';
import sequelize from '../config/database.js';
import { QueryTypes, Op, col, fn, where } from 'sequelize';

const normalizeAuthText = (v: unknown) => String(v == null ? '' : v).trim();

export const register = async (req: Request, res: Response) => {
  try {
    const username = normalizeAuthText(req.body?.username);
    const password = String(req.body?.password || '');
    const nickname = normalizeAuthText(req.body?.nickname) || username;
    const phone = normalizeAuthText(req.body?.phone);
    const inviteCode = normalizeAuthText(req.body?.inviteCode);
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          where(fn('lower', col('username')), username.toLowerCase()),
          ...(phone ? [{ phone }] : []),
        ],
      } as any,
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      nickname,
      phone: phone || null,
      role: 'user' // Default role
    });
    if (inviteCode) {
      await bindInviterByCode(Number((user as any).id), String(inviteCode));
    }

    res.status(201).json({ success: true, message: 'User registered successfully', user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const loginId = normalizeAuthText(req.body?.username);
    const password = String(req.body?.password || '');
    if (!loginId || !password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let user: any = null;
    try {
      user = await User.findOne({
        where: {
          [Op.or]: [
            { username: loginId },
            { phone: loginId },
            where(fn('lower', col('username')), loginId.toLowerCase()),
          ],
        } as any,
      });
    } catch (e: any) {
      const msg = String((e && (e.message || (e.parent && e.parent.sqlMessage))) || '');
      if (!msg.includes('Unknown column')) throw e;
      const rows = await sequelize.query(
        "SELECT id, username, password, nickname, avatar FROM users WHERE username = :loginId OR LOWER(username) = LOWER(:loginId) OR phone = :loginId LIMIT 1",
        { replacements: { loginId }, type: QueryTypes.SELECT }
      );
      const row: any = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (row) user = { ...row, role: 'user' };
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const role = String((user as any).role || 'user');
    const toDateText = (v: any) => {
      if (!v) return '';
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    };
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role,
        vipLevel: String((user as any).vip_level || 'free'),
        vipScopeValue: String((user as any).vip_scope_value || ''),
        vipExpire: toDateText((user as any).vip_expire_at)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
