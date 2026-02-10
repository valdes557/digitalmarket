import { uploadToCloudinary, uploadRawFile, deleteFromCloudinary } from '../config/cloudinary.js';

// Upload single image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const folder = req.body.folder || 'images';
    
    // Convert buffer to base64
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const result = await uploadToCloudinary(base64, folder);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

// Upload multiple images
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const folder = req.body.folder || 'images';
    const results = [];

    for (const file of req.files) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const result = await uploadToCloudinary(base64, folder);
      
      if (result.success) {
        results.push({
          url: result.url,
          publicId: result.publicId,
          originalName: file.originalname
        });
      }
    }

    res.json({ files: results });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

// Upload product file
export const uploadProductFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Convert buffer to base64
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const result = await uploadRawFile(base64, 'products');

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      file_name: req.file.originalname,
      file_path: result.url,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      cloudinary_id: result.publicId
    });
  } catch (error) {
    console.error('Upload product file error:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

// Upload multiple product files
export const uploadProductFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const results = [];

    for (const file of req.files) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const result = await uploadRawFile(base64, 'products');
      
      if (result.success) {
        results.push({
          file_name: file.originalname,
          file_path: result.url,
          file_size: file.size,
          file_type: file.mimetype,
          cloudinary_id: result.publicId
        });
      }
    }

    res.json({ files: results });
  } catch (error) {
    console.error('Upload product files error:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    const result = await deleteFromCloudinary(publicId, resourceType || 'image');

    if (!result.success) {
      return res.status(500).json({ error: 'Erreur lors de la suppression' });
    }

    res.json({ message: 'Fichier supprimé' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
