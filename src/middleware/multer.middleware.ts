import multer from 'multer';
import fs from 'fs';
import path from 'path';

 const absoluteUploadDir = path.resolve('./uploads');

 if(!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
  }


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, absoluteUploadDir);
  },

  filename: function (req, file, cb) {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});



export const upload = multer({ storage });
