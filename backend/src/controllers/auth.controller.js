import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User, Vendor } from '../models/index.js';
import { generateTokens, generateRandomToken } from '../utils/token.utils.js';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.utils.js';

// Register new user
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateRandomToken();

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      email_verification_token: verificationToken
    });

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Save refresh token
    user.refresh_token = tokens.refreshToken;
    await user.save();

    // Send welcome email
    sendWelcomeEmail({ email, first_name });
    
    // Send verification email
    sendVerificationEmail({ email, first_name }, verificationToken);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar: user.avatar
      },
      ...tokens
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Check if active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Votre compte a été désactivé' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Save refresh token
    user.refresh_token = tokens.refreshToken;
    await user.save();

    // Get vendor info if applicable
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user_id: user._id });
    }

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar: user.avatar,
        email_verified: user.email_verified
      },
      vendor,
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refresh_token: null });
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const tokens = generateTokens(req.user.id);

    // Update refresh token
    await User.findByIdAndUpdate(req.user.id, { refresh_token: tokens.refreshToken });

    res.json(tokens);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Erreur lors du rafraîchissement du token' });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'Si cet email existe, vous recevrez un lien de réinitialisation' });
    }

    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.password_reset_token = resetToken;
    user.password_reset_expires = resetExpires;
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    res.json({ message: 'Si cet email existe, vous recevrez un lien de réinitialisation' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token et mot de passe requis' });
    }

    const user = await User.findOne({
      password_reset_token: token,
      password_reset_expires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ email_verification_token: token });

    if (!user) {
      return res.status(400).json({ error: 'Token de vérification invalide' });
    }

    user.email_verified = true;
    user.email_verification_token = null;
    await user.save();

    res.json({ message: 'Email vérifié avec succès' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refresh_token');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user_id: user._id });
    }

    res.json({ user, vendor });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
