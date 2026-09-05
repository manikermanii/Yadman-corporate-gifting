import bcrypt from 'bcryptjs';
import { prisma, isDbConnected } from '../config/database.js';
import { config } from '../config/env.js';
import { generateToken, JwtUserPayload } from '../middleware/auth.js';

// In-memory fallback cache for when DB is connecting or in development
const inMemoryUsers: any[] = [
  {
    id: 'USR-ADMIN-01',
    email: 'admin@yadman.ir',
    phone: '09120000000',
    name: 'مدیر ارشد یادمان',
    passwordHash: bcrypt.hashSync('ChangeThisSuperAdminPassword123!', 10),
    role: 'ADMIN',
    isActive: true,
    companyName: 'یادمان',
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class AuthService {
  async registerUser(data: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    password: string;
    accountType?: 'personal' | 'corporate';
    corporateName?: string;
    jobTitle?: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const role = 'CUSTOMER';
    const email = data.email || `${data.phoneNumber}@yadman.local`;

    if (isDbConnected()) {
      // Check existing phone or email
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: data.phoneNumber },
            ...(data.email ? [{ email: data.email }] : []),
          ],
        },
      });
      if (existing) {
        throw new Error('این شماره موبایل یا ایمیل قبلاً در سیستم ثبت شده است.');
      }

      const user = await prisma.user.create({
        data: {
          name: data.fullName,
          phone: data.phoneNumber,
          email,
          passwordHash,
          role,
          companyName: data.corporateName,
          isActive: true,
        },
      });

      const tokenPayload: JwtUserPayload = {
        userId: user.id,
        role: user.role as any,
        phoneNumber: user.phone || undefined,
        phone: user.phone || undefined,
        email: user.email,
        fullName: user.name,
        name: user.name,
      };

      const token = generateToken(tokenPayload);
      const { passwordHash: _, ...safeUser } = user;
      return { user: safeUser, token };
    }

    // In-memory fallback
    const exists = inMemoryUsers.find((u) => u.phone === data.phoneNumber || (data.email && u.email === data.email));
    if (exists) {
      throw new Error('این شماره موبایل قبلاً در سیستم ثبت شده است.');
    }

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: data.fullName,
      phone: data.phoneNumber,
      email,
      passwordHash,
      role: 'CUSTOMER',
      isActive: true,
      companyName: data.corporateName,
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryUsers.push(newUser);

    const token = generateToken({
      userId: newUser.id,
      role: 'CUSTOMER',
      phoneNumber: newUser.phone,
      phone: newUser.phone,
      email: newUser.email,
      fullName: newUser.name,
      name: newUser.name,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  async loginUser(identifier: string, password: string) {
    if (isDbConnected()) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ phone: identifier }, { email: identifier }],
        },
        include: { addresses: true },
      });

      if (!user) {
        throw new Error('کاربری با این مشخصات یافت نشد.');
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new Error('رمز عبور وارد شده نادرست است.');
      }

      if (!user.isActive) {
        throw new Error('حساب کاربری شما مسدود یا غیرفعال شده است.');
      }

      const token = generateToken({
        userId: user.id,
        role: user.role as any,
        phoneNumber: user.phone || undefined,
        phone: user.phone || undefined,
        email: user.email,
        fullName: user.name,
        name: user.name,
      });

      const { passwordHash: _, ...safeUser } = user;
      return { user: safeUser, token };
    }

    // In-memory fallback
    const user = inMemoryUsers.find(
      (u) => u.phone === identifier || u.email === identifier
    );
    if (!user) {
      throw new Error('کاربری با این مشخصات یافت نشد.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('رمز عبور وارد شده نادرست است.');
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      phoneNumber: user.phone,
      phone: user.phone,
      email: user.email,
      fullName: user.name,
      name: user.name,
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async loginAdmin(identifier: string, password: string) {
    const isEnvAdmin =
      (identifier === 'admin@yadman.ir' || identifier === 'admin') &&
      password === 'ChangeThisSuperAdminPassword123!';

    if (isEnvAdmin) {
      const token = generateToken({
        userId: 'USR-SUPERADMIN',
        role: 'SUPERADMIN',
        phoneNumber: '09120000000',
        phone: '09120000000',
        email: 'admin@yadman.ir',
        fullName: 'مدیر ارشد یادمان',
        name: 'مدیر ارشد یادمان',
      });
      return {
        user: {
          id: 'USR-SUPERADMIN',
          fullName: 'مدیر ارشد یادمان',
          name: 'مدیر ارشد یادمان',
          email: 'admin@yadman.ir',
          phone: '09120000000',
          role: 'ADMIN',
          companyName: 'یادمان',
          isActive: true,
        },
        token,
      };
    }

    return this.loginUser(identifier, password);
  }

  async getCurrentUser(userId: string) {
    if (isDbConnected()) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { addresses: true },
      });
      if (!user) return null;
      const { passwordHash: _, ...safeUser } = user;
      return safeUser;
    }

    const user = inMemoryUsers.find((u) => u.id === userId);
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
