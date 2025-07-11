import {Router } from 'express';
import {
    registerUser ,
    loginUser ,
    logoutUser,
    refreshAccessToken
    
} from '../controllers/user.controller';
import { verifyJWT } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserSchema } from '../validations/validate.schema';



const router = Router();

router.route('/register').post(registerUser);

router.route('/login').post(validate(UserSchema),loginUser);

router.route('/logout').post(verifyJWT, logoutUser);

router.route('/refresh-token').post(verifyJWT, refreshAccessToken);


export default router;