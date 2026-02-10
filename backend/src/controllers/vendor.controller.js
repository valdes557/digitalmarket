import { validationResult } from 'express-validator';
import slugify from 'slugify';
import { Vendor, User, Product, Category, SellerRequest, OrderItem, Order, Withdrawal, Commission } from '../models/index.js';
import { sendVendorApprovedEmail, sendVendorRejectedEmail } from '../utils/email.utils.js';

// Get all approved vendors
export const getVendors = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Vendor.countDocuments({ status: 'approved' });

    const vendors = await Vendor.find({ status: 'approved' })
      .populate('user_id', 'first_name last_name')
      .sort({ total_sales: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedVendors = vendors.map(v => ({
      ...v,
      id: v._id,
      first_name: v.user_id?.first_name,
      last_name: v.user_id?.last_name
    }));

    res.json({
      vendors: transformedVendors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get vendor by slug
export const getVendorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const vendor = await Vendor.findOne({ store_slug: slug, status: 'approved' })
      .populate('user_id', 'first_name avatar')
      .lean();

    if (!vendor) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    res.json({
      ...vendor,
      id: vendor._id,
      first_name: vendor.user_id?.first_name,
      avatar: vendor.user_id?.avatar
    });
  } catch (error) {
    console.error('Get vendor by slug error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get vendor products
export const getVendorProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const vendor = await Vendor.findOne({ store_slug: slug });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    const total = await Product.countDocuments({ vendor_id: vendor._id, status: 'published' });

    const products = await Product.find({ vendor_id: vendor._id, status: 'published' })
      .populate('category_id', 'name slug')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedProducts = products.map(p => ({
      ...p,
      id: p._id,
      category_name: p.category_id?.name,
      category_slug: p.category_id?.slug
    }));

    res.json({
      products: transformedProducts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Apply to become vendor
export const applyAsVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if already a vendor or has pending request
    const existingVendor = await Vendor.findOne({ user_id: req.user.id });
    if (existingVendor) {
      return res.status(400).json({ error: 'Vous êtes déjà vendeur' });
    }

    const existingRequest = await SellerRequest.findOne({ user_id: req.user.id })
      .sort({ created_at: -1 });

    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({ error: 'Vous avez déjà une demande en cours' });
    }

    const {
      store_name, store_description, business_name, business_address,
      phone, motivation, portfolio_url, id_document
    } = req.body;

    const request = await SellerRequest.create({
      user_id: req.user.id,
      store_name,
      store_description,
      business_name,
      business_address,
      phone,
      motivation,
      portfolio_url,
      id_document
    });

    res.status(201).json({
      message: 'Demande envoyée avec succès. Vous serez notifié par email.',
      requestId: request._id
    });
  } catch (error) {
    console.error('Apply as vendor error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la demande' });
  }
};

// Get vendor dashboard
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    // Get stats
    const orderItems = await OrderItem.find({ vendor_id: vendorId });
    const totalSalesCount = orderItems.length;
    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.vendor_amount || 0), 0);

    const pendingWithdrawalsResult = await Withdrawal.aggregate([
      { $match: { vendor_id: vendorId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingWithdrawals = pendingWithdrawalsResult[0]?.total || 0;

    const availableBalanceResult = await Commission.aggregate([
      { $match: { vendor_id: vendorId, status: 'available' } },
      { $group: { _id: null, total: { $sum: '$vendor_amount' } } }
    ]);
    const availableBalance = availableBalanceResult[0]?.total || 0;

    const recentOrders = await OrderItem.find({ vendor_id: vendorId })
      .populate({
        path: 'order_id',
        match: { payment_status: 'completed' },
        select: 'order_number created_at'
      })
      .populate('product_id', 'name thumbnail')
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    const filteredOrders = recentOrders
      .filter(o => o.order_id)
      .map(o => ({
        ...o,
        id: o._id,
        order_number: o.order_id?.order_number,
        order_date: o.order_id?.created_at,
        product_name: o.product_id?.name,
        thumbnail: o.product_id?.thumbnail
      }));

    const topProducts = await Product.find({ vendor_id: vendorId, status: 'published' })
      .select('name slug thumbnail sales_count rating price')
      .sort({ sales_count: -1 })
      .limit(5)
      .lean();

    res.json({
      stats: {
        totalSales: totalSalesCount,
        totalRevenue,
        pendingWithdrawals,
        availableBalance
      },
      recentOrders: filteredOrders,
      topProducts: topProducts.map(p => ({ ...p, id: p._id })),
      vendor: req.vendor
    });
  } catch (error) {
    console.error('Get vendor dashboard error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get my products
export const getMyProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { vendor_id: req.vendor._id };
    if (status) {
      query.status = status;
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedProducts = products.map(p => ({
      ...p,
      id: p._id,
      category_name: p.category_id?.name
    }));

    res.json({
      products: transformedProducts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const orderItems = await OrderItem.find({ vendor_id: req.vendor._id })
      .populate({
        path: 'order_id',
        match: { payment_status: 'completed' },
        select: 'order_number created_at customer_email'
      })
      .populate('product_id', 'name thumbnail')
      .sort({ created_at: -1 })
      .lean();

    const filteredItems = orderItems.filter(o => o.order_id);
    const total = filteredItems.length;
    const paginatedItems = filteredItems.slice(skip, skip + parseInt(limit));

    const orders = paginatedItems.map(o => ({
      ...o,
      id: o._id,
      order_number: o.order_id?.order_number,
      order_date: o.order_id?.created_at,
      customer_email: o.order_id?.customer_email,
      product_name: o.product_id?.name,
      thumbnail: o.product_id?.thumbnail
    }));

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get my stats
export const getMyStats = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Monthly sales aggregation
    const monthlySales = await OrderItem.aggregate([
      { $match: { vendor_id: vendorId } },
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      { $match: { 'order.payment_status': 'completed', 'order.created_at': { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$order.created_at' } },
          sales: { $sum: 1 },
          revenue: { $sum: '$vendor_amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', sales: 1, revenue: 1, _id: 0 } }
    ]);

    // Top categories
    const topCategories = await OrderItem.aggregate([
      { $match: { vendor_id: vendorId } },
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      { $match: { 'order.payment_status': 'completed' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $group: { _id: '$category.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      monthlySales,
      topCategories
    });
  } catch (error) {
    console.error('Get my stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Update vendor profile
export const updateVendorProfile = async (req, res) => {
  try {
    const {
      store_name, store_description, store_logo, store_banner,
      business_name, business_address, phone, website,
      social_facebook, social_twitter, social_instagram
    } = req.body;

    // Update slug if store_name changed
    let store_slug = req.vendor.store_slug;
    if (store_name && store_name !== req.vendor.store_name) {
      store_slug = slugify(store_name, { lower: true, strict: true });
      const existing = await Vendor.findOne({ store_slug, _id: { $ne: req.vendor._id } });
      if (existing) {
        store_slug = `${store_slug}-${Date.now()}`;
      }
    }

    const updated = await Vendor.findByIdAndUpdate(req.vendor._id, {
      store_name: store_name || req.vendor.store_name,
      store_slug,
      store_description: store_description || req.vendor.store_description,
      store_logo: store_logo || req.vendor.store_logo,
      store_banner: store_banner || req.vendor.store_banner,
      business_name,
      business_address,
      phone,
      website,
      social_facebook,
      social_twitter,
      social_instagram
    }, { new: true });

    res.json({
      message: 'Profil mis à jour avec succès',
      vendor: updated
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
};

// Get vendor requests (admin)
export const getVendorRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const total = await SellerRequest.countDocuments({ status });

    const requests = await SellerRequest.find({ status })
      .populate('user_id', 'email first_name last_name avatar')
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedRequests = requests.map(r => ({
      ...r,
      id: r._id,
      email: r.user_id?.email,
      first_name: r.user_id?.first_name,
      last_name: r.user_id?.last_name,
      avatar: r.user_id?.avatar
    }));

    res.json({
      requests: transformedRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vendor requests error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Process vendor request (admin)
export const processVendorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const request = await SellerRequest.findById(id).populate('user_id', 'email first_name');

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    // Update request
    request.status = status;
    request.admin_notes = admin_notes;
    request.reviewed_by = req.user.id;
    request.reviewed_at = new Date();
    await request.save();

    if (status === 'approved') {
      // Create vendor
      let store_slug = slugify(request.store_name, { lower: true, strict: true });
      const existing = await Vendor.findOne({ store_slug });
      if (existing) {
        store_slug = `${store_slug}-${Date.now()}`;
      }

      const vendor = await Vendor.create({
        user_id: request.user_id._id,
        store_name: request.store_name,
        store_slug,
        store_description: request.store_description,
        business_name: request.business_name,
        business_address: request.business_address,
        phone: request.phone,
        status: 'approved',
        approved_at: new Date(),
        approved_by: req.user.id
      });

      // Update user role
      await User.findByIdAndUpdate(request.user_id._id, { role: 'vendor' });

      // Send approval email
      sendVendorApprovedEmail(
        { email: request.user_id.email, first_name: request.user_id.first_name },
        vendor
      );
    } else {
      // Send rejection email
      sendVendorRejectedEmail(
        { email: request.user_id.email, first_name: request.user_id.first_name },
        admin_notes
      );
    }

    res.json({ message: `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès` });
  } catch (error) {
    console.error('Process vendor request error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get all vendors (admin)
export const getAllVendors = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const total = await Vendor.countDocuments(query);

    const vendors = await Vendor.find(query)
      .populate('user_id', 'email first_name last_name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedVendors = vendors.map(v => ({
      ...v,
      id: v._id,
      email: v.user_id?.email,
      first_name: v.user_id?.first_name,
      last_name: v.user_id?.last_name
    }));

    res.json({
      vendors: transformedVendors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Update vendor status (admin)
export const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    await Vendor.findByIdAndUpdate(id, { status });

    res.json({ message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error('Update vendor status error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
