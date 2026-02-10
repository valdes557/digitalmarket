import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate access token
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Generate both tokens
export const generateTokens = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
};

// Generate random token (for email verification, password reset, etc.)
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate secure download token
export const generateDownloadToken = (orderItemId, productId, userId) => {
  const payload = {
    orderItemId,
    productId,
    userId,
    timestamp: Date.now()
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: `${process.env.DOWNLOAD_LINK_EXPIRE_MINUTES || 60}m` }
  );
};

// Verify download token
export const verifyDownloadToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate order number
export const generateOrderNumber = () => {
  const prefix = 'DM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
};
