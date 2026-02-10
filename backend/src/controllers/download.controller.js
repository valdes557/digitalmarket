import { OrderItem, Order, ProductFile, Product, DownloadLog } from '../models/index.js';
import { verifyDownloadToken, generateDownloadToken } from '../utils/token.utils.js';
import { getSecureDownloadUrl } from '../config/cloudinary.js';

// Generate download link
export const generateDownloadLink = async (req, res) => {
  try {
    const { order_item_id, file_id } = req.body;

    // Get order item
    const item = await OrderItem.findById(order_item_id)
      .populate('order_id', 'user_id payment_status');

    if (!item) {
      return res.status(404).json({ error: 'Achat non trouvé' });
    }

    // Verify ownership
    if (item.order_id.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Check payment status
    if (item.order_id.payment_status !== 'completed') {
      return res.status(400).json({ error: 'Paiement non confirmé' });
    }

    // Check download limit
    if (item.download_count >= item.max_downloads) {
      return res.status(400).json({ 
        error: 'Limite de téléchargements atteinte',
        downloads_used: item.download_count,
        max_downloads: item.max_downloads
      });
    }

    // Get file
    let file;
    if (file_id) {
      file = await ProductFile.findOne({ _id: file_id, product_id: item.product_id });
      if (!file) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }
    } else {
      file = await ProductFile.findOne({ product_id: item.product_id })
        .sort({ is_main: -1, sort_order: 1 });
      if (!file) {
        return res.status(404).json({ error: 'Aucun fichier disponible' });
      }
    }

    // Generate secure download token
    const expiresInMinutes = parseInt(process.env.DOWNLOAD_LINK_EXPIRE_MINUTES) || 60;
    const token = generateDownloadToken(item._id, item.product_id, req.user.id);

    const downloadUrl = `${process.env.FRONTEND_URL}/api/downloads/file/${token}?file=${file._id}`;

    res.json({
      download_url: downloadUrl,
      file_name: file.file_name,
      expires_in: expiresInMinutes * 60,
      downloads_remaining: item.max_downloads - item.download_count
    });
  } catch (error) {
    console.error('Generate download link error:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du lien' });
  }
};

// Download file
export const downloadFile = async (req, res) => {
  try {
    const { token } = req.params;
    const { file } = req.query;

    // Verify token
    const decoded = verifyDownloadToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Lien de téléchargement invalide ou expiré' });
    }

    const { orderItemId, productId, userId } = decoded;

    // Get order item
    const item = await OrderItem.findOne({ _id: orderItemId, product_id: productId })
      .populate('order_id', 'user_id payment_status');

    if (!item) {
      return res.status(404).json({ error: 'Achat non trouvé' });
    }

    // Verify user
    if (item.order_id.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Check download limit
    if (item.download_count >= item.max_downloads) {
      return res.status(400).json({ error: 'Limite de téléchargements atteinte' });
    }

    // Get file
    let fileData = await ProductFile.findOne({ _id: file, product_id: productId });
    if (!fileData) {
      fileData = await ProductFile.findOne({ product_id: productId }).sort({ is_main: -1 });
      if (!fileData) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }
    }

    // Generate secure Cloudinary URL
    if (fileData.cloudinary_id) {
      const result = getSecureDownloadUrl(fileData.cloudinary_id, 300);
      if (!result.success) {
        return res.status(500).json({ error: 'Erreur lors de la génération du lien de téléchargement' });
      }

      // Increment download count
      await OrderItem.findByIdAndUpdate(orderItemId, { $inc: { download_count: 1 } });

      // Log download
      await DownloadLog.create({
        order_item_id: orderItemId,
        user_id: userId,
        product_id: productId,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      // Update product download count
      await Product.findByIdAndUpdate(productId, { $inc: { download_count: 1 } });

      return res.redirect(result.url);
    }

    // Fallback to direct file path
    if (fileData.file_path) {
      await OrderItem.findByIdAndUpdate(orderItemId, { $inc: { download_count: 1 } });

      await DownloadLog.create({
        order_item_id: orderItemId,
        user_id: userId,
        product_id: productId,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.redirect(fileData.file_path);
    }

    res.status(404).json({ error: 'Fichier non disponible' });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

// Get download history
export const getDownloadHistory = async (req, res) => {
  try {
    const downloads = await DownloadLog.find({ user_id: req.user.id })
      .populate('product_id', 'name thumbnail')
      .populate('order_item_id', 'download_count max_downloads')
      .sort({ downloaded_at: -1 })
      .limit(50)
      .lean();

    const result = downloads.map(d => ({
      ...d,
      id: d._id,
      product_name: d.product_id?.name,
      thumbnail: d.product_id?.thumbnail,
      download_count: d.order_item_id?.download_count,
      max_downloads: d.order_item_id?.max_downloads
    }));

    res.json(result);
  } catch (error) {
    console.error('Get download history error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
