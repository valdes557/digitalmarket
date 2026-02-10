import axios from 'axios';
import crypto from 'crypto';
import { Product, Vendor, Order, OrderItem, Commission, User, Notification } from '../models/index.js';
import { generateOrderNumber, generateDownloadToken } from '../utils/token.utils.js';
import { sendOrderConfirmationEmail, sendNewSaleEmail } from '../utils/email.utils.js';

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE) || 0.10;

// Initialize payment
export const initializePayment = async (req, res) => {
  try {
    const { items, payment_method } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Aucun produit sélectionné' });
    }

    // Get product details
    const productIds = items.map(i => i.product_id);
    const products = await Product.find({ _id: { $in: productIds }, status: 'published' })
      .populate('vendor_id')
      .lean();

    if (products.length !== items.length) {
      return res.status(400).json({ error: 'Certains produits ne sont pas disponibles' });
    }

    // Check if user already owns any of these products
    const userOrders = await Order.find({ user_id: req.user.id, payment_status: 'completed' });
    const orderIds = userOrders.map(o => o._id);
    const existingPurchases = await OrderItem.find({ 
      order_id: { $in: orderIds }, 
      product_id: { $in: productIds } 
    });

    if (existingPurchases.length > 0) {
      const ownedIds = existingPurchases.map(p => p.product_id);
      return res.status(400).json({ 
        error: 'Vous possédez déjà certains de ces produits',
        owned_products: ownedIds
      });
    }

    // Calculate totals
    let totalAmount = 0;
    const orderItems = products.map(product => {
      const price = product.sale_price || product.price;
      const commissionAmount = Math.round(price * COMMISSION_RATE);
      const vendorAmount = price - commissionAmount;
      totalAmount += price;

      return {
        product_id: product._id,
        vendor_id: product.vendor_id._id,
        product_name: product.name,
        price,
        commission_amount: commissionAmount,
        vendor_amount: vendorAmount
      };
    });

    const commissionTotal = Math.round(totalAmount * COMMISSION_RATE);
    const vendorTotal = totalAmount - commissionTotal;

    // Create order
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      order_number: orderNumber,
      user_id: req.user.id,
      total_amount: totalAmount,
      commission_amount: commissionTotal,
      vendor_amount: vendorTotal,
      payment_method,
      customer_email: req.user.email,
      customer_phone: req.body.phone || null,
      currency: 'XOF'
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order._id,
        product_id: item.product_id,
        vendor_id: item.vendor_id,
        product_name: item.product_name,
        price: item.price,
        commission_amount: item.commission_amount,
        vendor_amount: item.vendor_amount,
        max_downloads: parseInt(process.env.MAX_DOWNLOAD_ATTEMPTS) || 5
      });
    }

    // Initialize CinetPay payment
    const cinetpayData = {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: orderNumber,
      amount: totalAmount,
      currency: 'XOF',
      description: `Commande ${orderNumber} - DigitalMarket`,
      notify_url: process.env.CINETPAY_NOTIFY_URL,
      return_url: `${process.env.CINETPAY_RETURN_URL}?order=${orderNumber}`,
      cancel_url: process.env.CINETPAY_CANCEL_URL,
      channels: payment_method === 'card' ? 'CREDIT_CARD' : 'MOBILE_MONEY',
      customer_name: `${req.user.first_name} ${req.user.last_name}`,
      customer_email: req.user.email,
      customer_phone_number: req.body.phone || '',
      customer_address: '',
      customer_city: '',
      customer_country: 'CI',
      customer_state: '',
      customer_zip_code: ''
    };

    const cinetpayResponse = await axios.post(
      'https://api-checkout.cinetpay.com/v2/payment',
      cinetpayData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (cinetpayResponse.data.code !== '201') {
      await Order.findByIdAndUpdate(order._id, { status: 'cancelled' });
      return res.status(400).json({ 
        error: 'Erreur lors de l\'initialisation du paiement',
        details: cinetpayResponse.data.message
      });
    }

    // Update order with payment reference
    await Order.findByIdAndUpdate(order._id, {
      payment_reference: cinetpayResponse.data.data.payment_token,
      status: 'processing'
    });

    res.json({
      success: true,
      order_number: orderNumber,
      payment_url: cinetpayResponse.data.data.payment_url,
      payment_token: cinetpayResponse.data.data.payment_token
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'initialisation du paiement' });
  }
};

// CinetPay webhook
export const cinetpayWebhook = async (req, res) => {
  try {
    const { cpm_trans_id, cpm_site_id } = req.body;

    if (!cpm_trans_id || cpm_site_id !== process.env.CINETPAY_SITE_ID) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Verify payment with CinetPay
    const verifyResponse = await axios.post(
      'https://api-checkout.cinetpay.com/v2/payment/check',
      {
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id
      }
    );

    const paymentData = verifyResponse.data.data;

    // Get order
    const order = await Order.findOne({ order_number: cpm_trans_id });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (paymentData.status === 'ACCEPTED') {
      await processSuccessfulPayment(order, paymentData.payment_method);
    } else if (paymentData.status === 'REFUSED') {
      await Order.findByIdAndUpdate(order._id, { payment_status: 'failed', status: 'cancelled' });
    }

    res.json({ status: 'OK' });
  } catch (error) {
    console.error('CinetPay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Verify CinetPay payment
export const verifyCinetpayPayment = async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const verifyResponse = await axios.post(
      'https://api-checkout.cinetpay.com/v2/payment/check',
      {
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id
      }
    );

    const paymentData = verifyResponse.data.data;

    // Get order
    const order = await Order.findOne({ order_number: transaction_id });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (paymentData.status === 'ACCEPTED' && order.payment_status !== 'completed') {
      await processSuccessfulPayment(order, paymentData.payment_method);
    }

    res.json({
      status: paymentData.status,
      order_number: order.order_number,
      payment_status: order.payment_status
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
  }
};

// Initialize card payment
export const initializeCardPayment = async (req, res) => {
  req.body.payment_method = 'card';
  return initializePayment(req, res);
};

// Card payment webhook
export const cardPaymentWebhook = async (req, res) => {
  return cinetpayWebhook(req, res);
};

// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { order_number } = req.params;

    const order = await Order.findOne({ order_number, user_id: req.user.id });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // If pending, check with CinetPay
    if (order.payment_status === 'pending' || order.payment_status === 'processing') {
      try {
        const verifyResponse = await axios.post(
          'https://api-checkout.cinetpay.com/v2/payment/check',
          {
            apikey: process.env.CINETPAY_API_KEY,
            site_id: process.env.CINETPAY_SITE_ID,
            transaction_id: order_number
          }
        );

        if (verifyResponse.data.data.status === 'ACCEPTED' && order.payment_status !== 'completed') {
          await processSuccessfulPayment(order, verifyResponse.data.data.payment_method);
          order.payment_status = 'completed';
        }
      } catch (e) {
        // Ignore verification errors
      }
    }

    res.json({
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: order.total_amount
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Process successful payment
async function processSuccessfulPayment(order, paymentMethod) {
  try {
    // Update order
    await Order.findByIdAndUpdate(order._id, {
      payment_status: 'completed',
      status: 'completed',
      transaction_id: paymentMethod
    });

    // Get order items
    const items = await OrderItem.find({ order_id: order._id });

    const downloadExpires = new Date();
    downloadExpires.setMinutes(downloadExpires.getMinutes() + (parseInt(process.env.DOWNLOAD_LINK_EXPIRE_MINUTES) || 60));

    for (const item of items) {
      // Generate download token
      const downloadToken = generateDownloadToken(item._id, item.product_id, order.user_id);

      // Update order item
      await OrderItem.findByIdAndUpdate(item._id, {
        download_token: downloadToken,
        download_expires: downloadExpires
      });

      // Create commission record
      await Commission.create({
        order_id: order._id,
        order_item_id: item._id,
        vendor_id: item.vendor_id,
        total_amount: item.price,
        commission_rate: COMMISSION_RATE * 100,
        commission_amount: item.commission_amount,
        vendor_amount: item.vendor_amount,
        status: 'available',
        available_at: new Date()
      });

      // Update product sales count
      await Product.findByIdAndUpdate(item.product_id, { $inc: { sales_count: 1 } });

      // Update vendor total sales
      await Vendor.findByIdAndUpdate(item.vendor_id, { $inc: { total_sales: item.vendor_amount } });

      // Get vendor email for notification
      const vendor = await Vendor.findById(item.vendor_id).populate('user_id', 'email');
      if (vendor) {
        sendNewSaleEmail(vendor, order, item);
      }
    }

    // Create notification for user
    await Notification.create({
      user_id: order.user_id,
      type: 'order',
      title: 'Commande confirmée',
      message: `Votre commande ${order.order_number} a été confirmée. Téléchargez vos fichiers maintenant !`,
      link: '/account/downloads'
    });

    // Send confirmation email
    const user = await User.findById(order.user_id);
    if (user) {
      sendOrderConfirmationEmail(user, order, items);
    }
  } catch (error) {
    console.error('Process payment error:', error);
    throw error;
  }
}
