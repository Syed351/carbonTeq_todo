import {Router } from 'express';
import {
    registerUser ,
    loginUser ,
    logoutUser,
    refreshAccessToken
    
} from '../controllers/user.controller';
import { verifyJWT } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { RegisterDTO, LoginDTO } from '../dtos/user.dto';



const router = Router();

router.route('/register').post(validate(RegisterDTO),registerUser);

router.route('/login').post(validate(LoginDTO),loginUser);

router.route('/logout').post(verifyJWT, logoutUser);

router.route('/refresh-token').post(verifyJWT, refreshAccessToken);


export default router;