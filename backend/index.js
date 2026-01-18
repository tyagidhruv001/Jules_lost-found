const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const Busboy = require('busboy');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * HTTP Callable Function
 */
exports.uploadImage = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to upload images'
        );
    }

    try {
        const { imageBase64, folder = 'lost-found' } = data;

        if (!imageBase64) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Image data is required'
            );
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(imageBase64, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to upload image: ' + error.message
        );
    }
});

/**
 * Delete image from Cloudinary
 * HTTP Callable Function
 */
exports.deleteImage = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to delete images'
        );
    }

    try {
        const { publicId } = data;

        if (!publicId) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Public ID is required'
            );
        }

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        return {
            success: true,
            result: result.result
        };
    } catch (error) {
        console.error('Delete error:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to delete image: ' + error.message
        );
    }
});

/**
 * Upload using multipart form data
 * HTTP Function (for direct file uploads from forms)
 */
exports.uploadImageMultipart = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const busboy = Busboy({ headers: req.headers });
        const uploads = [];

        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;

            console.log(`File [${fieldname}]: filename: ${filename}, encoding: ${encoding}, mimetype: ${mimeType}`);

            const chunks = [];
            file.on('data', (data) => {
                chunks.push(data);
            });

            file.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

                try {
                    const result = await cloudinary.uploader.upload(base64, {
                        folder: 'lost-found',
                        resource_type: 'auto',
                        transformation: [
                            { width: 1200, height: 1200, crop: 'limit' },
                            { quality: 'auto' }
                        ]
                    });

                    uploads.push({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                } catch (error) {
                    console.error('Upload error:', error);
                }
            });
        });

        busboy.on('finish', () => {
            res.json({
                success: true,
                uploads: uploads
            });
        });

        busboy.end(req.rawBody);
    });
});
