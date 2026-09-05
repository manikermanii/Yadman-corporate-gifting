import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const authController = {
  // Customer Register
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, name, phone, companyName } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'کاربری با این ایمیل یا شماره موبایل قبلاً ثبت‌نام کرده است.' },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        companyName,
        role: 'CUSTOMER',
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      fullName: user.name,
      phoneNumber: user.phone || undefined,
    });

    res.cookie('yadman_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          companyName: user.companyName,
          role: user.role,
        },
      },
    });
  },

  // Customer / Common Login
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'ایمیل یا رمز عبور اشتباه است.' },
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'ایمیل یا رمز عبور اشتباه است.' },
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      fullName: user.name,
      phoneNumber: user.phone || undefined,
    });

    res.cookie('yadman_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          companyName: user.companyName,
          role: user.role,
        },
      },
    });
  },

  // Admin Login
  async adminLogin(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'SUPERADMIN')) {
      res.status(401).json({
        success: false,
        error: { code: 'ADMIN_ACCESS_DENIED', message: 'اطلاعات ورود مدیر نامعتبر است یا دسترسی لازم وجود ندارد.' },
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'رمز عبور مدیریت اشتباه است.' },
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      fullName: user.name,
      phoneNumber: user.phone || undefined,
    });

    res.cookie('yadman_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  },

  // Get Current Authenticated User (Me / getMe)
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'احراز هویت نشده است.' },
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        role: true,
        avatar: true,
        createdAt: true,
        addresses: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'کاربر یافت نشد.' },
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    return authController.getMe(req, res);
  },

  // Update Profile
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'احراز هویت نشده است.' } });
      return;
    }

    const { name, phone, companyName, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(companyName !== undefined && { companyName }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        role: true,
        avatar: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
    });
  },

  // Logout
  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('yadman_token');
    res.clearCookie('yadman_admin_token');
    res.json({
      success: true,
      message: 'با موفقیت خارج شدید.',
    });
  },

  // Admin: Get all users
  async getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    });

    res.json({
      success: true,
      data: { users },
    });
  },
};
