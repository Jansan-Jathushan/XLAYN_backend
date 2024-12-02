// // import multer from "multer";

// // const storage=multer.diskStorage({
// //     filename:(req,file,cb)=>{
// //         cb(null,file.originalname)
// //     }
// // });

// // const upload =multer({storage:storage});


// // export{upload};

// import multer from "multer";

// // Configure storage for Multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'create/');  // The 'uploads/' directory to store files
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);  // Save file with the original name
//     }
// });

// // Initialize Multer with storage configuration
// const upload = multer({ storage: storage });

// export { upload };


// import express from 'express';
// import multer from'multer';
// import path from 'path';

// const app = express();

// // Configure storage for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Ensure this directory exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
//   fileFilter: function (req, file, cb) {
//     const fileTypes = /jpeg|jpg|png|pdf/; // Acceptable file types
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimeType = fileTypes.test(file.mimetype);

//     if (extname && mimeType) {
//       cb(null, true); // Accept file
//     } else {
//       cb(new Error('Only images and PDFs are allowed')); // Reject file
//     }
//   }
// });

// app.post('${process.env.REACT_APP_SERVER_HOSTNAME}/api/product/admin/add-products', upload.array('imageUrls', 5), (req, res) => {
//   console.log('Files:', req.files); // Log files for debugging
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ msg: 'No files were uploaded.' });
//   }
//   res.status(200).json({ msg: 'Files uploaded successfully!', files: req.files });
// });

// app.post('${process.env.REACT_APP_SERVER_HOSTNAME}/api/product/supplier/add-products', upload.array('imageUrls', 5), (req, res) => {
//   console.log('Files:', req.files); // Log files for debugging
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ msg: 'No files were uploaded.' });
//   }
//   res.status(200).json({ msg: 'Files uploaded successfully!', files: req.files });
// });


// export {upload};

import multer from 'multer';
import path from 'path';

// Configure multer storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary storage path before Cloudinary upload
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
    }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, JPG, and PNG files are allowed'), false);
    }
};

// Set up multer with storage, file size limit, and filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 2MB file size limit
    fileFilter: fileFilter
});

export { upload };
