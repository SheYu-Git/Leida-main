import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { bindInviterByCode, ensureInviteCode } from '../services/referral.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, nickname, phone, inviteCode } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      nickname,
      phone,
      role: 'user' // Default role
    });
    await ensureInviteCode(user as any);
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
    const { username, password } = req.body;

    let user: any = null;
    try {
      user = await User.findOne({ where: { username } });
    } catch (e: any) {
      const msg = String((e && (e.message || (e.parent && e.parent.sqlMessage))) || '');
      if (!msg.includes('Unknown column')) throw e;
      const rows = await sequelize.query(
        "SELECT id, username, password, nickname, avatar FROM users WHERE username = :username LIMIT 1",
        { replacements: { username }, type: QueryTypes.SELECT }
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

    try { await ensureInviteCode(user as any); } catch (e) {}
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
