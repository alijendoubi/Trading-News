import { AuthService } from '../services/auth.service.js';
import { logger } from '../config/logger.js';
import { successResponse, errorResponse } from '../utils/http-response.js';
import Joi from 'joi';
// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).required(),
});
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});
const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});
export class AuthController {
    /**
     * Register a new user
     * POST /api/auth/register
     */
    static async register(req, res) {
        try {
            // Validate request body
            const { error, value } = registerSchema.validate(req.body);
            if (error) {
                errorResponse(res, error.details[0].message, 400);
                return;
            }
            const { email, password, name } = value;
            // Register user
            const user = await AuthService.register(email, password, name);
            // Generate tokens
            const tokens = await AuthService.login(email, password);
            successResponse(res, {
                user: tokens.user,
                tokens: tokens.tokens,
            }, 'User registered successfully', 201);
        }
        catch (error) {
            logger.error('Registration error:', error);
            if (error instanceof Error && error.message === 'User with this email already exists') {
                errorResponse(res, error.message, 409);
            }
            else {
                errorResponse(res, 'Registration failed', 500);
            }
        }
    }
    /**
     * Login user
     * POST /api/auth/login
     */
    static async login(req, res) {
        try {
            // Validate request body
            const { error, value } = loginSchema.validate(req.body);
            if (error) {
                errorResponse(res, error.details[0].message, 400);
                return;
            }
            const { email, password } = value;
            // Login user
            const { user, tokens } = await AuthService.login(email, password);
            successResponse(res, {
                user,
                tokens,
            }, 'Login successful');
        }
        catch (error) {
            logger.error('Login error:', error);
            if (error instanceof Error && error.message === 'Invalid email or password') {
                errorResponse(res, error.message, 401);
            }
            else {
                errorResponse(res, 'Login failed', 500);
            }
        }
    }
    /**
     * Refresh access token
     * POST /api/auth/refresh
     */
    static async refresh(req, res) {
        try {
            // Validate request body
            const { error, value } = refreshTokenSchema.validate(req.body);
            if (error) {
                errorResponse(res, error.details[0].message, 400);
                return;
            }
            const { refreshToken } = value;
            // Refresh tokens
            const tokens = await AuthService.refreshToken(refreshToken);
            successResponse(res, { tokens }, 'Token refreshed successfully');
        }
        catch (error) {
            logger.error('Token refresh error:', error);
            if (error instanceof Error && error.message === 'Invalid or expired refresh token') {
                errorResponse(res, error.message, 401);
            }
            else {
                errorResponse(res, 'Token refresh failed', 500);
            }
        }
    }
    /**
     * Get current user profile
     * GET /api/auth/me
     */
    static async getProfile(req, res) {
        try {
            // User is already attached to request by auth middleware
            const user = req.user;
            successResponse(res, { user }, 'User profile retrieved successfully');
        }
        catch (error) {
            logger.error('Get profile error:', error);
            errorResponse(res, 'Failed to retrieve user profile', 500);
        }
    }
    /**
     * Logout user (client-side token removal)
     * POST /api/auth/logout
     */
    static async logout(req, res) {
        try {
            // In a stateless JWT system, logout is handled client-side
            // This endpoint is provided for consistency
            successResponse(res, null, 'Logout successful');
        }
        catch (error) {
            logger.error('Logout error:', error);
            errorResponse(res, 'Logout failed', 500);
        }
    }
}
//# sourceMappingURL=auth.controller.js.map