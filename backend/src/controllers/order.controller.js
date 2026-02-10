import { Order, OrderItem, Product, ProductFile, User } from '../models/index.js';

// Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ user_id: req.user.id });

    const orders = await Order.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get items for each order
    for (const order of orders) {
      order.id = order._id;
      const items = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'name thumbnail slug')
        .lean();
      order.items = items.map(item => ({
        ...item,
        id: item._id,
        product_name: item.product_id?.name,
        thumbnail: item.product_id?.thumbnail,
        slug: item.product_id?.slug
      }));
    }

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

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user_id: req.user.id }).lean();

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const items = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'name thumbnail slug')
      .populate('vendor_id', 'store_name store_slug')
      .lean();

    order.id = order._id;
    order.items = items.map(item => ({
      ...item,
      id: item._id,
      product_name: item.product_id?.name,
      thumbnail: item.product_id?.thumbnail,
      slug: item.product_id?.slug,
      store_name: item.vendor_id?.store_name,
      store_slug: item.vendor_id?.store_slug
    }));

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get my downloads
export const getMyDownloads = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id, payment_status: 'completed' }).lean();
    const orderIds = orders.map(o => o._id);

    const orderItems = await OrderItem.find({ order_id: { $in: orderIds } })
      .populate('order_id', 'order_number payment_status')
      .populate('product_id', 'name thumbnail slug')
      .populate('vendor_id', 'store_name')
      .sort({ created_at: -1 })
      .lean();

    const downloads = [];
    for (const item of orderItems) {
      const files = await ProductFile.find({ product_id: item.product_id?._id })
        .select('file_name file_size file_type')
        .lean();

      downloads.push({
        ...item,
        id: item._id,
        order_number: item.order_id?.order_number,
        payment_status: item.order_id?.payment_status,
        product_name: item.product_id?.name,
        thumbnail: item.product_id?.thumbnail,
        slug: item.product_id?.slug,
        store_name: item.vendor_id?.store_name,
        files: files.map(f => ({ ...f, id: f._id })),
        can_download: item.download_count < item.max_downloads
      });
    }

    res.json(downloads);
  } catch (error) {
    console.error('Get my downloads error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, payment_status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (payment_status) query.payment_status = payment_status;

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('user_id', 'email first_name last_name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedOrders = orders.map(o => ({
      ...o,
      id: o._id,
      email: o.user_id?.email,
      first_name: o.user_id?.first_name,
      last_name: o.user_id?.last_name
    }));

    res.json({
      orders: transformedOrders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get order by ID (admin)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user_id', 'email first_name last_name phone')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const items = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'name thumbnail')
      .populate('vendor_id', 'store_name store_slug')
      .lean();

    order.id = order._id;
    order.email = order.user_id?.email;
    order.first_name = order.user_id?.first_name;
    order.last_name = order.user_id?.last_name;
    order.phone = order.user_id?.phone;
    order.items = items.map(item => ({
      ...item,
      id: item._id,
      product_name: item.product_id?.name,
      thumbnail: item.product_id?.thumbnail,
      store_name: item.vendor_id?.store_name,
      store_slug: item.vendor_id?.store_slug
    }));

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get order stats (admin)
export const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total stats
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.find({ payment_status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalCommission = completedOrders.reduce((sum, o) => sum + (o.commission_amount || 0), 0);

    // Today's stats
    const todayOrders = await Order.find({ created_at: { $gte: today }, payment_status: 'completed' });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // This month stats
    const monthOrders = await Order.find({ created_at: { $gte: startOfMonth }, payment_status: 'completed' });
    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$payment_status', count: { $sum: 1 } } },
      { $project: { payment_status: '$_id', count: 1, _id: 0 } }
    ]);

    // Daily sales (last 30 days)
    const dailySales = await Order.aggregate([
      { $match: { created_at: { $gte: thirtyDaysAgo }, payment_status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', orders: 1, revenue: 1, _id: 0 } }
    ]);

    res.json({
      total: { total_orders: totalOrders, total_revenue: totalRevenue, total_commission: totalCommission },
      today: { orders: todayOrders.length, revenue: todayRevenue },
      month: { orders: monthOrders.length, revenue: monthRevenue },
      statusBreakdown,
      dailySales
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
