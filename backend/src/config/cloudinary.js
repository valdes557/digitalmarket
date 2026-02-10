import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = 'products', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `digitalmarket/${folder}`,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: error.message };
  }
};

// Upload raw file (for downloadable products)
export const uploadRawFile = async (file, folder = 'downloads') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `digitalmarket/${folder}`,
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
      type: 'private' // Private for secure downloads
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary raw upload error:', error);
    return { success: false, error: error.message };
  }
};

// Generate signed URL for secure download
export const getSecureDownloadUrl = (publicId, expiresInSeconds = 3600) => {
  try {
    const url = cloudinary.utils.private_download_url(publicId, '', {
      resource_type: 'raw',
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      attachment: true
    });
    return { success: true, url };
  } catch (error) {
    console.error('Secure URL generation error:', error);
    return { success: false, error: error.message };
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return { success: result.result === 'ok' };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

// Upload with watermark (for previews)
export const uploadWithWatermark = async (file, folder = 'previews') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `digitalmarket/${folder}`,
      resource_type: 'image',
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 40,
            font_weight: 'bold',
            text: 'PREVIEW'
          },
          color: '#ffffff',
          opacity: 40,
          gravity: 'center'
        }
      ]
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Watermark upload error:', error);
    return { success: false, error: error.message };
  }
};

export default cloudinary;
