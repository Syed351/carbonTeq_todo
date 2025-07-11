import {Router} from 'express';
import { 
    uploadDocument,
    getDocuments,
    deleteDocument,
    updateDocument,
    generateDownloadLink,
    downloadDocument,
    searchDocument
} from '../controllers/document.controller';
import { upload } from '../middleware/multer.middleware';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.route('/upload').post(
    verifyJWT,
    upload.single('file'),
    uploadDocument
);

router.route("/read").get(verifyJWT,getDocuments)

router.route("/:id")
.delete(verifyJWT,deleteDocument)
.patch(verifyJWT,upload.single("file"),updateDocument);

router.route("/generate-download/:id").get(verifyJWT,generateDownloadLink);
router.route("/download/:token").get(downloadDocument);
router.route("/search").get(verifyJWT,searchDocument)
export default router;