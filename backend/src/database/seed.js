import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);

    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified)
      VALUES ('admin@digitalmarket.com', ?, 'Admin', 'System', 'admin', TRUE, TRUE)
      ON DUPLICATE KEY UPDATE email = email
    `, [adminPassword]);

    console.log('✅ Admin user created (admin@digitalmarket.com / admin123)');

    // Create categories
    const categories = [
      { name: 'Documents & Textes', slug: 'documents-textes', icon: 'FileText', description: 'PDF, Ebooks, Scripts, Templates Word' },
      { name: 'Audio', slug: 'audio', icon: 'Music', description: 'Musiques, Podcasts, Voix-off, Sound effects' },
      { name: 'Vidéos', slug: 'videos', icon: 'Video', description: 'Formations vidéo, Tutoriaux, Stock vidéos' },
      { name: 'Images & Graphisme', slug: 'images-graphisme', icon: 'Image', description: 'Templates Canva, PSD, Logos, Mockups' },
      { name: 'Logiciels & Code', slug: 'logiciels-code', icon: 'Code', description: 'Scripts, Plugins, Thèmes, UI kits' },
      { name: 'Assets Créatifs', slug: 'assets-creatifs', icon: 'Palette', description: 'Fonts, Brushes, Presets, LUTs' }
    ];

    for (const cat of categories) {
      await pool.query(`
        INSERT INTO categories (name, slug, icon, description, is_active)
        VALUES (?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE name = name
      `, [cat.name, cat.slug, cat.icon, cat.description]);
    }

    console.log('✅ Categories created');

    // Create subcategories
    const [parentCategories] = await pool.query('SELECT id, slug FROM categories WHERE parent_id IS NULL');

    const subcategories = {
      'documents-textes': ['PDF', 'Ebooks', 'Business Plans', 'CV & Lettres', 'Templates PowerPoint', 'Templates Excel'],
      'audio': ['Musiques', 'Beats', 'Podcasts', 'Voix-off', 'Sound Effects'],
      'videos': ['Formations', 'Tutoriaux', 'Stock Vidéos', 'Animations', 'Transitions'],
      'images-graphisme': ['Templates Canva', 'Templates PSD', 'Logos', 'Flyers', 'Mockups', 'Icônes'],
      'logiciels-code': ['Scripts Python', 'Scripts Node.js', 'Thèmes WordPress', 'Plugins', 'UI Kits'],
      'assets-creatifs': ['Fonts', 'Brushes', 'Presets Lightroom', 'LUTs Vidéo', 'Overlays']
    };

    for (const parent of parentCategories) {
      const subs = subcategories[parent.slug] || [];
      for (const subName of subs) {
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await pool.query(`
          INSERT INTO categories (name, slug, parent_id, is_active)
          VALUES (?, ?, ?, TRUE)
          ON DUPLICATE KEY UPDATE name = name
        `, [subName, subSlug, parent.id]);
      }
    }

    console.log('✅ Subcategories created');

    // Create blog categories
    const blogCategories = [
      { name: 'Tutoriels', slug: 'tutoriels', description: 'Guides et tutoriels' },
      { name: 'Actualités', slug: 'actualites', description: 'Actualités du marketplace' },
      { name: 'Conseils Vendeurs', slug: 'conseils-vendeurs', description: 'Conseils pour les vendeurs' },
      { name: 'Ressources', slug: 'ressources', description: 'Ressources gratuites' }
    ];

    for (const cat of blogCategories) {
      await pool.query(`
        INSERT INTO blog_categories (name, slug, description, is_active)
        VALUES (?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE name = name
      `, [cat.name, cat.slug, cat.description]);
    }

    console.log('✅ Blog categories created');

    // Create sample banners
    await pool.query(`
      INSERT INTO banners (title, subtitle, image, link, button_text, position, is_active)
      VALUES 
        ('Bienvenue sur DigitalMarket', 'La marketplace des produits digitaux', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', '/products', 'Découvrir', 'home_hero', TRUE),
        ('Devenez Vendeur', 'Vendez vos créations digitales', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200', '/become-vendor', 'Commencer', 'home_secondary', TRUE)
      ON DUPLICATE KEY UPDATE title = title
    `);

    console.log('✅ Sample banners created');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
