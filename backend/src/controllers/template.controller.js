import slugify from 'slugify';
import { Template } from '../models/index.js';

// Get templates
export const getTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 12, type, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'published' };
    if (type) query.type = type;
    if (category) query.category = category;

    const total = await Template.countDocuments(query);

    const templates = await Template.find(query)
      .populate('vendor_id', 'store_name store_slug')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedTemplates = templates.map(t => ({
      ...t,
      id: t._id,
      store_name: t.vendor_id?.store_name,
      store_slug: t.vendor_id?.store_slug
    }));

    res.json({
      templates: transformedTemplates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get featured templates
export const getFeaturedTemplates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const templates = await Template.find({ status: 'published', is_featured: true })
      .populate('vendor_id', 'store_name store_slug')
      .sort({ sales_count: -1 })
      .limit(limit)
      .lean();

    res.json(templates.map(t => ({
      ...t,
      id: t._id,
      store_name: t.vendor_id?.store_name,
      store_slug: t.vendor_id?.store_slug
    })));
  } catch (error) {
    console.error('Get featured templates error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get template by slug
export const getTemplateBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const template = await Template.findOne({ slug, status: 'published' })
      .populate('vendor_id', 'store_name store_slug store_logo')
      .lean();

    if (!template) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    res.json({
      ...template,
      id: template._id,
      store_name: template.vendor_id?.store_name,
      store_slug: template.vendor_id?.store_slug,
      store_logo: template.vendor_id?.store_logo
    });
  } catch (error) {
    console.error('Get template by slug error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create template
export const createTemplate = async (req, res) => {
  try {
    const {
      name, description, thumbnail, preview_url, category, type,
      price, sale_price, file_url, cloudinary_id
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nom et prix requis' });
    }

    let slug = slugify(name, { lower: true, strict: true });
    const existing = await Template.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const template = await Template.create({
      name,
      slug,
      description,
      thumbnail,
      preview_url,
      category,
      type: type || 'other',
      price,
      sale_price: sale_price || null,
      vendor_id: req.vendor._id,
      file_url,
      cloudinary_id,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Template créé avec succès',
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    if (template.vendor_id.toString() !== req.vendor._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    let slug = template.slug;
    if (updates.name && updates.name !== template.name) {
      slug = slugify(updates.name, { lower: true, strict: true });
      const existing = await Template.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await Template.findByIdAndUpdate(id, {
      name: updates.name || template.name,
      slug,
      description: updates.description ?? template.description,
      thumbnail: updates.thumbnail || template.thumbnail,
      preview_url: updates.preview_url || template.preview_url,
      category: updates.category || template.category,
      type: updates.type || template.type,
      price: updates.price || template.price,
      sale_price: updates.sale_price,
      file_url: updates.file_url || template.file_url,
      cloudinary_id: updates.cloudinary_id || template.cloudinary_id,
      status: 'pending'
    }, { new: true });

    res.json({
      message: 'Template mis à jour',
      template: updated
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    if (template.vendor_id.toString() !== req.vendor._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await Template.findByIdAndDelete(id);

    res.json({ message: 'Template supprimé' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

// Update template status (admin)
export const updateTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    await Template.findByIdAndUpdate(id, { status });

    res.json({ message: 'Statut mis à jour' });
  } catch (error) {
    console.error('Update template status error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
