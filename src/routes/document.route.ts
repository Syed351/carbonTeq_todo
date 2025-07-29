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
import { rbacWithPermissions } from '../middleware/rbac';
import { validate } from "../middleware/validate.middleware";
import { validateQuery } from '../middleware/validate.middleware';
import {
     createValidate,
     updateValidate,
     searchValidate
} from '../validations/document.validate';

const router = Router();

router.route('/upload').post(
    verifyJWT,
    rbacWithPermissions("create"),
    upload.single('file'),
    validate(createValidate),
    uploadDocument
);

router.route("/read").get(verifyJWT,getDocuments)

router.route("/:id")
.delete(verifyJWT,rbacWithPermissions("delete"),deleteDocument)
.patch(verifyJWT,
    rbacWithPermissions("update"),
    upload.single("file"),
    validate(updateValidate),
    updateDocument);

router.route("/generate-download/:id").get(verifyJWT,generateDownloadLink);

router.route("/download/:token").get(downloadDocument);

router.route("/search").get(verifyJWT,
    validateQuery(searchValidate),
    searchDocument);
export default router;
