// Direct Cloudinary Upload Service (No Cloud Functions Required)
// This uses unsigned upload presets for quick setup

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dbjx1evqx';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'lost_found_unsigned';

/**
 * Upload image directly to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Cloudinary folder (default: 'lost-found')
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadImageDirect = async (file, folder = 'lost-found') => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Cloudinary upload failed:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload image: ' + error.message);
    }
};

/**
 * Upload multiple images
 * @param {FileList} files - Array of files
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImagesDirect = async (files, folder = 'lost-found') => {
    try {
        const uploadPromises = Array.from(files).map(file =>
            uploadImageDirect(file, folder)
        );

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Multiple upload error:', error);
        throw new Error('Failed to upload one or more images');
    }
};

export default {
    uploadImageDirect,
    uploadMultipleImagesDirect
};
