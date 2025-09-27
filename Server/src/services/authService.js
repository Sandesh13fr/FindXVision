import crypto from 'crypto';
import { User } from '../models/User.js';
import { generateTokens } from '../middleware/auth.js';
import { sendEmail } from './emailService.js';


const ROLE_MAP = {
  ADMIN: 'ADMINISTRATOR',
  ADMINISTRATOR: 'ADMINISTRATOR',
  USER: 'GENERAL_USER',
  GENERAL_USER: 'GENERAL_USER',
};

const mapRoleKey = (role) => {
  if (role === 'ADMINISTRATOR') return 'ADMIN';
  if (role === 'GENERAL_USER') return 'USER';
  return role;
};

const serializeUser = (user) => {
  const userResponse = user.toObject();
  delete userResponse.password;
  return {
    ...userResponse,
    roleKey: mapRoleKey(userResponse.role),
  };
};

export class AuthService {
  static async register(data){
    const { email, password, firstName, lastName, phoneNumber } = data;
    const requestedRole = data.role ? data.role.toString().trim().toUpperCase() : 'GENERAL_USER';
    const resolvedRole = ROLE_MAP[requestedRole] || 'GENERAL_USER';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: resolvedRole,
      phoneNumber,
    });

    await user.save();

    // Generate tokens
  const tokens = generateTokens(user);

    // Remove password from response
    return { user: serializeUser(user), tokens };
  }

  static async login(data){
    const { email, password } = data;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await User.updateOne(
        { _id: user._id },
        {
          $unset: { loginAttempts: 1, lockUntil: 1 }
        }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from response
    return { user: serializeUser(user), tokens };
  }

  static async requestPasswordReset(email){
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user not found (security best practice)
      return { message: 'If an account with that email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: 'FindXVision - Password Reset Request',
        template: 'password-reset',
        data: {
          firstName: user.firstName,
          resetToken,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
          expiresIn: '1 hour',
        },
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      throw new Error('Failed to send password reset email');
    }

    return { message: 'If an account with that email exists, a password reset link has been sent' };
  }

  static async resetPassword(token, newPassword){
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  static async changePassword(userId, currentPassword, newPassword){
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  static async refreshToken(refreshToken){
    try {
      const { verifyToken } = await import('../middleware/auth.js');
      const decoded = verifyToken(refreshToken, true);
      
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(userId){
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success
    return { message: 'Logged out successfully' };
  }
}