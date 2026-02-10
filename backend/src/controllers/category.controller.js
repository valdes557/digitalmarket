import slugify from 'slugify';
import { Category, Product } from '../models/index.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const { parent } = req.query;

    let query = { is_active: true };

    if (parent === 'null' || parent === '') {
      query.parent_id = null;
    } else if (parent) {
      query.parent_id = parent;
    }

    const categories = await Category.find(query)
      .sort({ sort_order: 1, name: 1 })
      .lean();

    // Get product count and subcategories for each
    for (const cat of categories) {
      cat.id = cat._id;
      cat.product_count = await Product.countDocuments({ category_id: cat._id, status: 'published' });
      cat.subcategories = await Category.find({ parent_id: cat._id, is_active: true })
        .sort({ sort_order: 1 })
        .lean();
    }

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, is_active: true }).lean();

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    // Get subcategories
    category.id = category._id;
    category.subcategories = await Category.find({ parent_id: category._id, is_active: true })
      .sort({ sort_order: 1 })
      .lean();

    res.json(category);
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, image, parent_id, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    let slug = slugify(name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      image,
      parent_id: parent_id || null,
      sort_order: sort_order || 0
    });

    res.status(201).json({
      message: 'Catégorie créée avec succès',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, image, parent_id, sort_order, is_active } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    let slug = category.slug;
    if (name && name !== category.name) {
      slug = slugify(name, { lower: true, strict: true });
      const existing = await Category.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await Category.findByIdAndUpdate(id, {
      name: name || category.name,
      slug,
      description: description ?? category.description,
      icon: icon || category.icon,
      image: image || category.image,
      parent_id: parent_id !== undefined ? parent_id : category.parent_id,
      sort_order: sort_order ?? category.sort_order,
      is_active: is_active ?? category.is_active
    }, { new: true });

    res.json({
      message: 'Catégorie mise à jour',
      category: updated
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if has products
    const productCount = await Product.countDocuments({ category_id: id });
    if (productCount > 0) {
      return res.status(400).json({ error: 'Cette catégorie contient des produits' });
    }

    // Check if has subcategories
    const subcategoryCount = await Category.countDocuments({ parent_id: id });
    if (subcategoryCount > 0) {
      return res.status(400).json({ error: 'Cette catégorie contient des sous-catégories' });
    }

    await Category.findByIdAndDelete(id);

    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
