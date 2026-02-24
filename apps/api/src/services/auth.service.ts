import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authRepository } from '../repositories/auth.repository';
import { AppError } from '../middlewares/error.handler';
import { env } from '../config/env';
import {
  RegisterInput,
  LoginInput,
  JwtPayload,
  AuthTokens,
  AuthUser,
} from '@salescore/shared';

const SALT_ROUNDS = 12;

const generateTokens = (payload: JwtPayload): AuthTokens => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const getRefreshExpiry = (): Date => {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10) || 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const authService = {
  async register(data: RegisterInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    // Check if email already exists
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create company
    const company = await authRepository.createCompany(data.companyName);

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create admin user
    const user = await authRepository.createUser(
      company.id,
      data.name,
      data.email,
      passwordHash,
      'ADMIN'
    );

    const payload: JwtPayload = {
      userId: user.id,
      companyId: company.id,
      role: user.role,
      email: user.email,
    };

    const tokens = generateTokens(payload);

    // Save refresh token hash
    await authRepository.saveRefreshToken(
      user.id,
      hashToken(tokens.refreshToken),
      getRefreshExpiry()
    );

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: company.id,
      companyName: company.name,
    };

    return { user: authUser, tokens };
  },

  async login(data: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const company = await authRepository.findCompanyById(user.company_id);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    const payload: JwtPayload = {
      userId: user.id,
      companyId: user.company_id,
      role: user.role,
      email: user.email,
    };

    const tokens = generateTokens(payload);

    await authRepository.saveRefreshToken(
      user.id,
      hashToken(tokens.refreshToken),
      getRefreshExpiry()
    );

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      companyName: company.name,
    };

    return { user: authUser, tokens };
  },

  async refreshTokens(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await authRepository.findRefreshToken(tokenHash);
    if (!storedToken) {
      throw new AppError('Refresh token not found or expired', 401, 'INVALID_TOKEN');
    }

    // Rotate refresh token
    await authRepository.deleteRefreshToken(tokenHash);

    const payload: JwtPayload = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
      email: decoded.email,
    };

    const tokens = generateTokens(payload);

    await authRepository.saveRefreshToken(
      decoded.userId,
      hashToken(tokens.refreshToken),
      getRefreshExpiry()
    );

    return { tokens };
  },

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await authRepository.deleteRefreshToken(tokenHash);
  },

  async getMe(userId: string): Promise<AuthUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const company = await authRepository.findCompanyById(user.company_id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      companyName: company?.name || '',
    };
  },

  async updateBranding(
    companyId: string,
    name: string,
    logoUrl: string | null,
    primaryColor: string
  ) {
    return authRepository.updateCompanyBranding(companyId, name, logoUrl, primaryColor);
  },
};
