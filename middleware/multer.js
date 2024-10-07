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


import express from 'express';
import multer from'multer';
import path from 'path';

const app = express();

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|pdf/; // Acceptable file types
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Only images and PDFs are allowed')); // Reject file
    }
  }
});

app.post('/admin/add-products', upload.array('imageUrls', 5), (req, res) => {
  console.log('Files:', req.files); // Log files for debugging
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ msg: 'No files were uploaded.' });
  }
  res.status(200).json({ msg: 'Files uploaded successfully!', files: req.files });
});


export {upload};
