import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Base email template
const baseTemplate = (content, title = 'DigitalMarket') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .highlight { background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 DigitalMarket</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} DigitalMarket. Tous droits réservés.</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

// Send email
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"DigitalMarket" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Welcome email
export const sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Bienvenue ${user.first_name} ! 👋</h2>
    <p>Nous sommes ravis de vous accueillir sur DigitalMarket, la marketplace des produits digitaux.</p>
    <p>Vous pouvez maintenant :</p>
    <ul>
      <li>Explorer notre catalogue de produits digitaux</li>
      <li>Acheter et télécharger instantanément vos fichiers</li>
      <li>Devenir vendeur et proposer vos créations</li>
    </ul>
    <a href="${process.env.FRONTEND_URL}" class="button">Découvrir la marketplace</a>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Bienvenue sur DigitalMarket ! 🎉',
    html: baseTemplate(content, 'Bienvenue')
  });
};

// Email verification
export const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const content = `
    <h2>Vérifiez votre adresse email</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
    <a href="${verifyUrl}" class="button">Vérifier mon email</a>
    <p style="color: #666; font-size: 14px;">Ce lien expire dans 24 heures.</p>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Vérifiez votre adresse email',
    html: baseTemplate(content, 'Vérification email')
  });
};

// Password reset email
export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const content = `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
    <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
    <p style="color: #666; font-size: 14px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe',
    html: baseTemplate(content, 'Réinitialisation mot de passe')
  });
};

// Order confirmation email
export const sendOrderConfirmationEmail = async (user, order, items) => {
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} FCFA</td>
    </tr>
  `).join('');

  const content = `
    <h2>Commande confirmée ! 🎉</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Merci pour votre achat ! Votre commande a été confirmée avec succès.</p>
    
    <div class="highlight">
      <p><strong>Numéro de commande :</strong> ${order.order_number}</p>
      <p><strong>Date :</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f4f4f5;">
          <th style="padding: 10px; text-align: left;">Produit</th>
          <th style="padding: 10px; text-align: right;">Prix</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList}
        <tr>
          <td style="padding: 10px; font-weight: bold;">Total</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">${order.total_amount.toLocaleString()} FCFA</td>
        </tr>
      </tbody>
    </table>
    
    <a href="${process.env.FRONTEND_URL}/account/downloads" class="button">Télécharger mes fichiers</a>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Vos fichiers sont disponibles pendant 5 téléchargements maximum. Les liens expirent après ${process.env.DOWNLOAD_LINK_EXPIRE_MINUTES || 60} minutes.
    </p>
  `;
  
  return sendEmail({
    to: user.email,
    subject: `Commande ${order.order_number} confirmée ✓`,
    html: baseTemplate(content, 'Confirmation commande')
  });
};

// Vendor application approved
export const sendVendorApprovedEmail = async (user, vendor) => {
  const content = `
    <h2>Félicitations ! Vous êtes maintenant vendeur 🎊</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Nous sommes heureux de vous informer que votre demande de vendeur a été <strong style="color: #22c55e;">approuvée</strong> !</p>
    
    <div class="highlight">
      <p><strong>Nom de la boutique :</strong> ${vendor.store_name}</p>
    </div>
    
    <p>Vous pouvez maintenant :</p>
    <ul>
      <li>Ajouter vos produits digitaux</li>
      <li>Gérer votre boutique</li>
      <li>Suivre vos ventes et revenus</li>
      <li>Demander des retraits</li>
    </ul>
    
    <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="button">Accéder à mon tableau de bord</a>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Votre compte vendeur est approuvé ! 🎉',
    html: baseTemplate(content, 'Compte vendeur approuvé')
  });
};

// Vendor application rejected
export const sendVendorRejectedEmail = async (user, reason) => {
  const content = `
    <h2>Demande de vendeur</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Nous avons examiné votre demande de vendeur et malheureusement, nous ne pouvons pas l'approuver pour le moment.</p>
    
    ${reason ? `
    <div class="highlight">
      <p><strong>Raison :</strong></p>
      <p>${reason}</p>
    </div>
    ` : ''}
    
    <p>Vous pouvez soumettre une nouvelle demande après avoir pris en compte ces éléments.</p>
    
    <a href="${process.env.FRONTEND_URL}/become-vendor" class="button">Nouvelle demande</a>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Mise à jour de votre demande vendeur',
    html: baseTemplate(content, 'Demande vendeur')
  });
};

// Withdrawal processed email
export const sendWithdrawalProcessedEmail = async (user, withdrawal, status) => {
  const statusText = status === 'completed' ? 'effectué' : 'rejeté';
  const statusColor = status === 'completed' ? '#22c55e' : '#ef4444';
  
  const content = `
    <h2>Retrait ${statusText}</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Votre demande de retrait a été <strong style="color: ${statusColor};">${statusText}</strong>.</p>
    
    <div class="highlight">
      <p><strong>Montant :</strong> ${withdrawal.amount.toLocaleString()} FCFA</p>
      <p><strong>Méthode :</strong> ${withdrawal.payment_method === 'mobile_money' ? 'Mobile Money' : 'Virement bancaire'}</p>
      ${withdrawal.phone_number ? `<p><strong>Numéro :</strong> ${withdrawal.phone_number}</p>` : ''}
    </div>
    
    ${withdrawal.rejection_reason ? `
    <div class="highlight" style="background: #fef2f2;">
      <p><strong>Raison du rejet :</strong></p>
      <p>${withdrawal.rejection_reason}</p>
    </div>
    ` : ''}
    
    <a href="${process.env.FRONTEND_URL}/vendor/withdrawals" class="button">Voir mes retraits</a>
  `;
  
  return sendEmail({
    to: user.email,
    subject: `Retrait ${statusText} - ${withdrawal.amount.toLocaleString()} FCFA`,
    html: baseTemplate(content, 'Retrait')
  });
};

// New sale notification for vendor
export const sendNewSaleEmail = async (vendor, order, item) => {
  const content = `
    <h2>Nouvelle vente ! 💰</h2>
    <p>Bonjour,</p>
    <p>Vous avez réalisé une nouvelle vente sur DigitalMarket !</p>
    
    <div class="highlight">
      <p><strong>Produit :</strong> ${item.product_name}</p>
      <p><strong>Prix de vente :</strong> ${item.price.toLocaleString()} FCFA</p>
      <p><strong>Votre commission (90%) :</strong> ${item.vendor_amount.toLocaleString()} FCFA</p>
    </div>
    
    <a href="${process.env.FRONTEND_URL}/vendor/orders" class="button">Voir mes ventes</a>
  `;
  
  return sendEmail({
    to: vendor.email,
    subject: `Nouvelle vente : ${item.product_name} 🎉`,
    html: baseTemplate(content, 'Nouvelle vente')
  });
};
