import slugify from 'slugify';
import { BlogPost, BlogCategory } from '../models/index.js';

// Get posts
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'published' };

    if (category) {
      const cat = await BlogCategory.findOne({ slug: category });
      if (cat) query.category_id = cat._id;
    }

    const total = await BlogPost.countDocuments(query);

    const posts = await BlogPost.find(query)
      .populate('category_id', 'name slug')
      .populate('author_id', 'first_name avatar')
      .sort({ published_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedPosts = posts.map(p => ({
      ...p,
      id: p._id,
      category_name: p.category_id?.name,
      category_slug: p.category_id?.slug,
      author_name: p.author_id?.first_name,
      author_avatar: p.author_id?.avatar
    }));

    res.json({
      posts: transformedPosts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get featured posts
export const getFeaturedPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const posts = await BlogPost.find({ status: 'published', is_featured: true })
      .populate('category_id', 'name slug')
      .sort({ published_at: -1 })
      .limit(limit)
      .lean();

    res.json(posts.map(p => ({
      ...p,
      id: p._id,
      category_name: p.category_id?.name,
      category_slug: p.category_id?.slug
    })));
  } catch (error) {
    console.error('Get featured posts error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get post by slug
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ slug, status: 'published' })
      .populate('category_id', 'name slug')
      .populate('author_id', 'first_name avatar')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Increment view count
    await BlogPost.findByIdAndUpdate(post._id, { $inc: { view_count: 1 } });

    // Get related posts
    const related = await BlogPost.find({
      category_id: post.category_id?._id,
      _id: { $ne: post._id },
      status: 'published'
    })
      .select('title slug excerpt featured_image published_at')
      .sort({ published_at: -1 })
      .limit(3)
      .lean();

    res.json({
      ...post,
      id: post._id,
      category_name: post.category_id?.name,
      category_slug: post.category_id?.slug,
      author_name: post.author_id?.first_name,
      author_avatar: post.author_id?.avatar,
      related: related.map(r => ({ ...r, id: r._id }))
    });
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find({ is_active: true })
      .sort({ name: 1 })
      .lean();

    for (const cat of categories) {
      cat.id = cat._id;
      cat.post_count = await BlogPost.countDocuments({ category_id: cat._id, status: 'published' });
    }

    res.json(categories);
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create post
export const createPost = async (req, res) => {
  try {
    const {
      title, excerpt, content, featured_image, category_id,
      status, is_featured, tags, meta_title, meta_description
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    let slug = slugify(title, { lower: true, strict: true });
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const post = await BlogPost.create({
      author_id: req.user.id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      category_id: category_id || null,
      status: status || 'draft',
      is_featured: is_featured || false,
      tags: tags || [],
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt,
      published_at: publishedAt
    });

    res.status(201).json({
      message: 'Article créé avec succès',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Update slug if title changed
    let slug = post.slug;
    if (updates.title && updates.title !== post.title) {
      slug = slugify(updates.title, { lower: true, strict: true });
      const existing = await BlogPost.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Set published_at if publishing for first time
    let publishedAt = post.published_at;
    if (updates.status === 'published' && !post.published_at) {
      publishedAt = new Date();
    }

    const updated = await BlogPost.findByIdAndUpdate(id, {
      title: updates.title || post.title,
      slug,
      excerpt: updates.excerpt ?? post.excerpt,
      content: updates.content ?? post.content,
      featured_image: updates.featured_image || post.featured_image,
      category_id: updates.category_id !== undefined ? updates.category_id : post.category_id,
      status: updates.status || post.status,
      is_featured: updates.is_featured ?? post.is_featured,
      tags: updates.tags || post.tags,
      meta_title: updates.meta_title || post.meta_title,
      meta_description: updates.meta_description || post.meta_description,
      published_at: publishedAt
    }, { new: true });

    res.json({
      message: 'Article mis à jour',
      post: updated
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    await BlogPost.findByIdAndDelete(id);

    res.json({ message: 'Article supprimé' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

// Create blog category
export const createBlogCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    let slug = slugify(name, { lower: true, strict: true });
    const existing = await BlogCategory.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await BlogCategory.create({ name, slug, description });

    res.status(201).json({
      message: 'Catégorie créée',
      category
    });
  } catch (error) {
    console.error('Create blog category error:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// Update blog category
export const updateBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await BlogCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    let slug = category.slug;
    if (name && name !== category.name) {
      slug = slugify(name, { lower: true, strict: true });
    }

    const updated = await BlogCategory.findByIdAndUpdate(id, {
      name: name || category.name,
      slug,
      description: description ?? category.description,
      is_active: is_active ?? category.is_active
    }, { new: true });

    res.json({
      message: 'Catégorie mise à jour',
      category: updated
    });
  } catch (error) {
    console.error('Update blog category error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Delete blog category
export const deleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Set posts to null category
    await BlogPost.updateMany({ category_id: id }, { category_id: null });

    await BlogCategory.findByIdAndDelete(id);

    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    console.error('Delete blog category error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
