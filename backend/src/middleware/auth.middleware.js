import jwt from 'jsonwebtoken';
import { User, Vendor } from '../models/index.js';

// Verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Non autorisé, veuillez vous connecter' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id)
        .select('email first_name last_name role is_active');

      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Compte désactivé' });
      }

      req.user = { ...user.toObject(), id: user._id };
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Token invalide' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
          .select('email first_name last_name role is_active');

        if (user && user.is_active) {
          req.user = { ...user.toObject(), id: user._id };
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
};

// Check if user is vendor
export const isVendor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux vendeurs' });
    }

    // Get vendor info
    const vendor = await Vendor.findOne({ user_id: req.user.id, status: 'approved' });

    if (!vendor && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Votre compte vendeur n\'est pas encore approuvé' });
    }

    if (vendor) {
      req.vendor = { ...vendor.toObject(), _id: vendor._id };
    }

    next();
  } catch (error) {
    console.error('Vendor middleware error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Check if user is admin or vendor
export const isAdminOrVendor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user_id: req.user.id, status: 'approved' });

      if (vendor) {
        req.vendor = { ...vendor.toObject(), _id: vendor._id };
        return next();
      }
    }

    res.status(403).json({ error: 'Accès non autorisé' });
  } catch (error) {
    console.error('AdminOrVendor middleware error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Refresh token verification
export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requis' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findById(decoded.id)
        .select('email role is_active refresh_token');

      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({ error: 'Refresh token invalide' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Compte désactivé' });
      }

      req.user = { ...user.toObject(), id: user._id };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Refresh token middleware error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
