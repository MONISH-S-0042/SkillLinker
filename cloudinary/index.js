const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let fileFormat;
        let resourceType = 'image';
        if (file.mimetype === 'application/pdf') {
            resourceType = 'raw';
        }

        return {
            folder: 'Skill Linker',
            resource_type: resourceType,
            allowedFormats: ['jpeg', 'png', 'jpg', 'pdf'],
        };
    }
});

module.exports = {
    cloudinary,
    storage
}