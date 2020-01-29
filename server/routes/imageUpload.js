const express = require('express');
const router = express.Router();
const cloudinary  = require('cloudinary').v2;

// Connecting to Cloudinary
cloudinary.config({ 
    cloud_name: 'ishusocialmedia', 
    api_key: '562252385571468', 
    api_secret: 'UqEp9oc-sVhj3p0tdiV65oKEhiY' 
});

router.post('/', (req, res, next) => {
    console.log(req.body)
    cloudinary.uploader.upload(req.body.file, function(error, result) {
        if (!error) {
            console.log(error);
        }
        else {
            console.log(result);
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
    });
})

module.exports = router;