/**
 * Admin Authentication, Username & Password Management Service
 */

const ADMIN_USERNAME_KEY = 'DYNAMIC_PORTFOLIO_ADMIN_USERNAME_V1';
const ADMIN_PASSWORD_KEY = 'DYNAMIC_PORTFOLIO_ADMIN_PASSWORD_V1';
const ADMIN_SESSION_KEY = 'DYNAMIC_PORTFOLIO_ADMIN_SESSION_V1';

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin';

export class AuthService {
  /**
   * Get the current stored username or fallback to default
   */
  public static getStoredUsername(): string {
    if (typeof window === 'undefined') return DEFAULT_ADMIN_USERNAME;
    try {
      const stored = localStorage.getItem(ADMIN_USERNAME_KEY);
      return stored && stored.trim() ? stored.trim() : DEFAULT_ADMIN_USERNAME;
    } catch {
      return DEFAULT_ADMIN_USERNAME;
    }
  }

  /**
   * Get the current stored password or fallback to default
   */
  public static getStoredPassword(): string {
    if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
    try {
      const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
      return stored || DEFAULT_ADMIN_PASSWORD;
    } catch {
      return DEFAULT_ADMIN_PASSWORD;
    }
  }

  /**
   * Check if admin is currently authenticated in this browser session
   */
  public static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
    } catch {
      return false;
    }
  }

  /**
   * Check if custom credentials have been set that differ from default
   */
  public static hasCustomCredentials(): boolean {
    const user = this.getStoredUsername();
    const pass = this.getStoredPassword();
    return user !== DEFAULT_ADMIN_USERNAME || pass !== DEFAULT_ADMIN_PASSWORD;
  }

  /**
   * Verify username and password to login
   */
  public static login(username: string, password: string): { success: boolean; error?: string } {
    const userClean = (username || '').trim();
    const passClean = (password || '').trim();

    if (!userClean) {
      return { success: false, error: 'ইউজারনেম প্রদান করুন / Please enter username' };
    }
    if (!password && !passClean) {
      return { success: false, error: 'পাসওয়ার্ড প্রদান করুন / Please enter password' };
    }

    const currentUsername = this.getStoredUsername().trim();
    const currentPassword = this.getStoredPassword();

    // Check against active stored credentials
    const isUserMatch = userClean.toLowerCase() === currentUsername.toLowerCase();
    const isPassMatch = password === currentPassword || passClean === currentPassword.trim();

    if (isUserMatch && isPassMatch) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
        window.dispatchEvent(new CustomEvent('portfolio_auth_changed', { detail: { authenticated: true } }));
      }
      return { success: true };
    }

    return { 
      success: false, 
      error: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! / Invalid username or password.' 
    };
  }

  /**
   * Logout the current admin session
   */
  public static logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      window.dispatchEvent(new CustomEvent('portfolio_auth_changed', { detail: { authenticated: false } }));
    }
  }

  /**
   * Change admin username and/or password
   */
  public static updateCredentials({
    currentUsername,
    currentPassword,
    newUsername,
    newPassword,
    confirmPassword,
  }: {
    currentUsername: string;
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
    confirmPassword?: string;
  }): { success: boolean; message: string } {
    const existingUser = this.getStoredUsername();
    const existingPass = this.getStoredPassword();

    // Validate current username (case-insensitive)
    if (currentUsername.trim().toLowerCase() !== existingUser.trim().toLowerCase()) {
      return { 
        success: false, 
        message: 'বর্তমান ইউজারনেম সঠিক নয়! / Current username is incorrect.' 
      };
    }

    // Validate current password
    if (currentPassword !== existingPass && currentPassword.trim() !== existingPass.trim()) {
      return { 
        success: false, 
        message: 'বর্তমান পাসওয়ার্ড সঠিক নয়! / Current password is incorrect.' 
      };
    }

    // Check if updating username
    const targetUsername = newUsername && newUsername.trim() ? newUsername.trim() : existingUser;
    if (newUsername && newUsername.trim().length < 3) {
      return {
        success: false,
        message: 'নতুন ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে। / Username must be at least 3 characters.',
      };
    }

    // Check if updating password
    let targetPassword = existingPass;
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        return { 
          success: false, 
          message: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে। / New password must be at least 4 characters.' 
        };
      }
      if (newPassword !== confirmPassword && newPassword.trim() !== (confirmPassword || '').trim()) {
        return { 
          success: false, 
          message: 'নতুন পাসওয়ার্ড দুটি মিলছে না! / New passwords do not match.' 
        };
      }
      targetPassword = newPassword.trim();
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_USERNAME_KEY, targetUsername);
      localStorage.setItem(ADMIN_PASSWORD_KEY, targetPassword);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      window.dispatchEvent(new CustomEvent('portfolio_auth_changed', { detail: { authenticated: true } }));
      window.dispatchEvent(new CustomEvent('portfolio_credentials_updated', { detail: { username: targetUsername } }));
    }

    return { 
      success: true, 
      message: 'ইউজারনেম ও পাসওয়ার্ড সফলভাবে আপডেট ও সেভ হয়েছে! / Credentials updated and saved successfully!' 
    };
  }

  /**
   * Reset credentials to default ('admin' and 'admin')
   */
  public static resetCredentialsToDefault(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_USERNAME_KEY, DEFAULT_ADMIN_USERNAME);
      localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      window.dispatchEvent(new CustomEvent('portfolio_auth_changed', { detail: { authenticated: true } }));
      window.dispatchEvent(new CustomEvent('portfolio_credentials_updated', { detail: { username: DEFAULT_ADMIN_USERNAME } }));
    }
  }
}
