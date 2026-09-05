/**
 * Admin Authentication & Authorization Service for Yadman Luxury Admin Panel
 * Manages admin credential verification, session validation, and security tokens.
 */

export interface AdminSession {
  adminId: string;
  username: string;
  role: 'superadmin';
  token: string;
  loginTime: number;
  expiresAt: number;
}

export interface AdminAuthResult {
  success: boolean;
  session?: AdminSession;
  error?: string;
}

const ADMIN_SESSION_STORAGE_KEY = 'yadman_admin_session_v1';
const SESSION_DURATION_HOURS = 8;

/**
 * Default Admin Configuration for Development / Production
 * Modify these credentials when deploying to production or wire with backend / environment.
 */
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'YadmanAdmin2026!',
  adminId: 'yadman-admin-01',
  role: 'superadmin' as const,
};

/**
 * Generate a random session token
 */
function generateAdminToken(): string {
  const rand = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return `yad_adm_${rand}`;
}

/**
 * Validate admin username and password
 */
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<AdminAuthResult> {
  const normalizedUser = (usernameInput || '').trim().toLowerCase();
  const normalizedPass = (passwordInput || '').trim();

  // Validate presence
  if (!normalizedUser || !normalizedPass) {
    return {
      success: false,
      error: 'نام کاربری یا رمز عبور اشتباه است.',
    };
  }

  // Exact credential match check
  const isUserMatch = normalizedUser === ADMIN_CREDENTIALS.username.toLowerCase();
  const isPassMatch = normalizedPass === ADMIN_CREDENTIALS.password;

  if (!isUserMatch || !isPassMatch) {
    return {
      success: false,
      error: 'نام کاربری یا رمز عبور اشتباه است.',
    };
  }

  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_HOURS * 60 * 60 * 1000;

  const session: AdminSession = {
    adminId: ADMIN_CREDENTIALS.adminId,
    username: ADMIN_CREDENTIALS.username,
    role: ADMIN_CREDENTIALS.role,
    token: generateAdminToken(),
    loginTime: now,
    expiresAt,
  };

  saveAdminSession(session);

  return {
    success: true,
    session,
  };
}

/**
 * Save admin session to storage
 */
export function saveAdminSession(session: AdminSession): void {
  try {
    const serialized = JSON.stringify(session);
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, serialized);
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save admin session', err);
  }
}

/**
 * Retrieve active and unexpired admin session
 */
export function getAdminSession(): AdminSession | null {
  try {
    let raw = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    }
    if (!raw) return null;

    const parsed: AdminSession = JSON.parse(raw);
    if (!parsed || !parsed.token || !parsed.expiresAt) {
      clearAdminSession();
      return null;
    }

    // Check expiry
    if (Date.now() > parsed.expiresAt) {
      clearAdminSession();
      return null;
    }

    // Validate username and adminId match
    if (parsed.username !== ADMIN_CREDENTIALS.username || parsed.adminId !== ADMIN_CREDENTIALS.adminId) {
      clearAdminSession();
      return null;
    }

    return parsed;
  } catch {
    clearAdminSession();
    return null;
  }
}

/**
 * Check if admin is currently authenticated
 */
export function isCurrentAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}

/**
 * Clear admin session (Logout)
 */
export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear admin session', err);
  }
}
