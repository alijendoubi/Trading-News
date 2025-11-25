import bcrypt from 'bcryptjs'; // Note: Install bcryptjs if needed, or migrate to Firebase Auth
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
export class AuthService {
    /**
     * Register a new user
     */
    static async register(email, password, name) {
        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        // Create user
        const user = await UserModel.create(email, passwordHash, name);
        logger.info(`New user registered: ${email}`);
        return this.sanitizeUser(user);
    }
    /**
     * Login user and generate tokens
     */
    static async login(email, password) {
        // Find user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        // Generate tokens
        const tokens = this.generateTokens(user);
        logger.info(`User logged in: ${email}`);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
    /**
     * Refresh access token
     */
    static async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, env.JWT_SECRET);
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }
            // Find user
            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Generate new tokens
            return this.generateTokens(user);
        }
        catch (error) {
            logger.error('Token refresh failed:', error);
            throw new Error('Invalid or expired refresh token');
        }
    }
    /**
     * Verify access token
     */
    static async verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }
            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            return this.sanitizeUser(user);
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    /**
     * Generate access and refresh tokens
     */
    static generateTokens(user) {
        const accessToken = jwt.sign({ userId: user.id, email: user.email, type: 'access' }, env.JWT_SECRET, { expiresIn: '7d' });
        const refreshToken = jwt.sign({ userId: user.id, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }
    /**
     * Remove sensitive data from user object
     */
    static sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            preferences: user.preferences,
            createdAt: user.created_at,
        };
    }
}
//# sourceMappingURL=auth.service.js.map