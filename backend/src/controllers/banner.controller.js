import { Banner } from '../models/index.js';

// Get active banners
export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      is_active: true,
      $or: [{ start_date: null }, { start_date: { $lte: now } }],
      $or: [{ end_date: null }, { end_date: { $gte: now } }]
    }).sort({ sort_order: 1 }).lean();

    res.json(banners.map(b => ({ ...b, id: b._id })));
  } catch (error) {
    console.error('Get active banners error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get banners by position
export const getBannersByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const now = new Date();

    const banners = await Banner.find({
      position,
      is_active: true,
      $or: [{ start_date: null }, { start_date: { $lte: now } }],
      $or: [{ end_date: null }, { end_date: { $gte: now } }]
    }).sort({ sort_order: 1 }).lean();

    res.json(banners.map(b => ({ ...b, id: b._id })));
  } catch (error) {
    console.error('Get banners by position error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get all banners (admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ position: 1, sort_order: 1 })
      .lean();

    res.json(banners.map(b => ({ ...b, id: b._id })));
  } catch (error) {
    console.error('Get all banners error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create banner
export const createBanner = async (req, res) => {
  try {
    const {
      title, subtitle, image, link, button_text,
      position, sort_order, is_active, start_date, end_date
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: 'Titre et image requis' });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      image,
      link,
      button_text,
      position: position || 'home_hero',
      sort_order: sort_order || 0,
      is_active: is_active !== false,
      start_date: start_date || null,
      end_date: end_date || null
    });

    res.status(201).json({
      message: 'Bannière créée',
      banner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ error: 'Bannière non trouvée' });
    }

    const updated = await Banner.findByIdAndUpdate(id, {
      title: updates.title || banner.title,
      subtitle: updates.subtitle ?? banner.subtitle,
      image: updates.image || banner.image,
      link: updates.link ?? banner.link,
      button_text: updates.button_text ?? banner.button_text,
      position: updates.position || banner.position,
      sort_order: updates.sort_order ?? banner.sort_order,
      is_active: updates.is_active ?? banner.is_active,
      start_date: updates.start_date !== undefined ? updates.start_date : banner.start_date,
      end_date: updates.end_date !== undefined ? updates.end_date : banner.end_date
    }, { new: true });

    res.json({
      message: 'Bannière mise à jour',
      banner: updated
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    await Banner.findByIdAndDelete(id);

    res.json({ message: 'Bannière supprimée' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
