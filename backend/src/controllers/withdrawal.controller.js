import { Withdrawal, Commission, Setting, User, Vendor, Notification } from '../models/index.js';
import { sendWithdrawalProcessedEmail } from '../utils/email.utils.js';

// Get my withdrawals
export const getMyWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Withdrawal.countDocuments({ vendor_id: req.vendor._id });

    const withdrawals = await Withdrawal.find({ vendor_id: req.vendor._id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      withdrawals: withdrawals.map(w => ({ ...w, id: w._id })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my withdrawals error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get balance
export const getBalance = async (req, res) => {
  try {
    // Available balance
    const availableResult = await Commission.aggregate([
      { $match: { vendor_id: req.vendor._id, status: 'available' } },
      { $group: { _id: null, total: { $sum: '$vendor_amount' } } }
    ]);

    // Pending withdrawals
    const pendingResult = await Withdrawal.aggregate([
      { $match: { vendor_id: req.vendor._id, status: { $in: ['pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total earned
    const totalResult = await Commission.aggregate([
      { $match: { vendor_id: req.vendor._id } },
      { $group: { _id: null, total: { $sum: '$vendor_amount' } } }
    ]);

    // Total withdrawn
    const withdrawnResult = await Withdrawal.aggregate([
      { $match: { vendor_id: req.vendor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      available: availableResult[0]?.total || 0,
      pending: pendingResult[0]?.total || 0,
      total_earned: totalResult[0]?.total || 0,
      total_withdrawn: withdrawnResult[0]?.total || 0
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Request withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const {
      amount, payment_method, mobile_network, phone_number,
      bank_name, bank_account, bank_iban, notes
    } = req.body;

    // Get minimum withdrawal amount from settings
    const setting = await Setting.findOne({ setting_key: 'min_withdrawal' });
    const minWithdrawal = setting ? parseInt(setting.setting_value) : 5000;

    if (!amount || amount < minWithdrawal) {
      return res.status(400).json({ 
        error: `Le montant minimum de retrait est de ${minWithdrawal} FCFA` 
      });
    }

    // Check available balance
    const availableResult = await Commission.aggregate([
      { $match: { vendor_id: req.vendor._id, status: 'available' } },
      { $group: { _id: null, total: { $sum: '$vendor_amount' } } }
    ]);
    const availableBalance = availableResult[0]?.total || 0;

    if (amount > availableBalance) {
      return res.status(400).json({ 
        error: `Solde insuffisant. Disponible: ${availableBalance} FCFA` 
      });
    }

    // Validate payment method
    if (payment_method === 'mobile_money') {
      if (!mobile_network || !phone_number) {
        return res.status(400).json({ error: 'Réseau mobile et numéro requis' });
      }
    } else if (payment_method === 'bank_transfer') {
      if (!bank_name || !bank_account) {
        return res.status(400).json({ error: 'Informations bancaires requises' });
      }
    } else {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      vendor_id: req.vendor._id,
      amount,
      payment_method,
      mobile_network: mobile_network || null,
      phone_number: phone_number || null,
      bank_name: bank_name || null,
      bank_account: bank_account || null,
      bank_iban: bank_iban || null,
      notes: notes || null
    });

    // Mark commissions as pending withdrawal
    await Commission.updateMany(
      { vendor_id: req.vendor._id, status: 'available' },
      { status: 'pending' }
    );

    // Create notification for admin
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await Notification.create({
        user_id: admin._id,
        type: 'withdrawal',
        title: 'Nouvelle demande de retrait',
        message: `Demande de retrait de ${amount} FCFA par ${req.vendor.store_name}`,
        link: '/admin/withdrawals'
      });
    }

    res.status(201).json({
      message: 'Demande de retrait envoyée',
      withdrawal
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ error: 'Erreur lors de la demande' });
  }
};

// Get all withdrawals (admin)
export const getAllWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const total = await Withdrawal.countDocuments(query);

    const withdrawals = await Withdrawal.find(query)
      .populate({
        path: 'vendor_id',
        select: 'store_name user_id',
        populate: { path: 'user_id', select: 'email first_name last_name' }
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedWithdrawals = withdrawals.map(w => ({
      ...w,
      id: w._id,
      store_name: w.vendor_id?.store_name,
      email: w.vendor_id?.user_id?.email,
      first_name: w.vendor_id?.user_id?.first_name,
      last_name: w.vendor_id?.user_id?.last_name
    }));

    res.json({
      withdrawals: transformedWithdrawals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Process withdrawal (admin)
export const processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, transaction_reference } = req.body;

    if (!['completed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const withdrawal = await Withdrawal.findById(id)
      .populate({
        path: 'vendor_id',
        select: 'user_id',
        populate: { path: 'user_id', select: 'email first_name' }
      });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    // Update withdrawal
    withdrawal.status = status;
    withdrawal.rejection_reason = status === 'rejected' ? rejection_reason : null;
    withdrawal.transaction_reference = transaction_reference || null;
    withdrawal.processed_by = req.user.id;
    withdrawal.processed_at = new Date();
    await withdrawal.save();

    // Update commissions status
    if (status === 'completed') {
      await Commission.updateMany(
        { vendor_id: withdrawal.vendor_id._id, status: 'pending' },
        { status: 'withdrawn' }
      );
    } else {
      await Commission.updateMany(
        { vendor_id: withdrawal.vendor_id._id, status: 'pending' },
        { status: 'available' }
      );
    }

    // Create notification for vendor
    await Notification.create({
      user_id: withdrawal.vendor_id.user_id._id,
      type: 'withdrawal',
      title: status === 'completed' ? 'Retrait effectué' : 'Retrait rejeté',
      message: status === 'completed' 
        ? `Votre retrait de ${withdrawal.amount} FCFA a été effectué`
        : `Votre demande de retrait a été rejetée. Raison: ${rejection_reason}`,
      link: '/vendor/withdrawals'
    });

    // Send email
    sendWithdrawalProcessedEmail(
      { email: withdrawal.vendor_id.user_id.email, first_name: withdrawal.vendor_id.user_id.first_name },
      { ...withdrawal.toObject(), rejection_reason },
      status
    );

    res.json({ message: `Demande ${status === 'completed' ? 'approuvée' : 'rejetée'}` });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
