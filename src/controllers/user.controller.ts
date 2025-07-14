import {Request , Response, NextFunction} from "express";
import { User } from "../schema/user.schema";
import { Roles } from "../schema/roles.schema";
import {eq} from "drizzle-orm";
import bcrypt from 'bcrypt';
import { generateTokens ,
     generateAcessToken ,
     generateRefreshToken } from '../utils/jwt';
import ApiError from "../utils/ApiErrors";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from 'jsonwebtoken';
import {db} from '../db'

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password ,role} = req.body;
    console.log("Incoming body:", req.body);
  console.log("Content-Type:", req.headers['content-type']);

    if(!name || !email || !password || !role) {
        throw new ApiError(404, "Name, email, password and role are required fields")

    }

const result = await db
  .select()
  .from(User)
  .where(eq(User.email, email))
  .limit(1);
  

const existedUser = result[0] ;

if(existedUser) {
    throw new ApiError(404, "User already exists with this email")
}

try{
const hashedPassword = await bcrypt.hash(password, 10);


 const [userRole] = await db
    .select()
    .from(Roles)
    .where(eq(Roles.name, role));

await db
.insert(User)
.values({
    name,
    email,
    password: hashedPassword,
    roleId:userRole.id,
    refreshToken: " "

});
return res
.json(
new ApiResponse(
            200,   
            "Registered Successfully"
        ))
} catch (error) {
    console.error("Error registering user:", error);
     throw new ApiError(500, "Internal server error while registering");
}
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

   const [user] = await db
   .select({
    id: User.id,
    name: User.name,
    email: User.email,
    password: User.password,
    role: Roles.name,
   })
   .from(User)
   .innerJoin(Roles, eq(User.roleId, Roles.id))
   .where(eq(User.email, email))
   .limit(1);


    if (!user) {
        throw new ApiError(400, "User not found with this email");
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);


    if (!isPasswordValid) {

      throw new ApiError(400, "Invalid password");

    }

    const { accessToken, refreshToken } = generateTokens(user);
    
    await db
    .update(User)
    .set({ refreshToken })
    .where(eq(User.id, user.id));

    const options ={
        httpOnly:true,
        secure:true,

    }

return res
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options )
    .json(
        new ApiResponse(
            200, 
            {
                user:{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }, 
                accessToken,
                refreshToken
            },
            "User logged In Successfully"
        ));
});


const refreshAccessToken = asyncHandler (async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        throw new ApiError(401, "Refresh Token not found ");
    }
let decoded;
    try{
         decoded = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET!) as { id : string};

    } catch (error){
        throw new ApiError(401,"Invalid Refresh Token");
    }

    const [user] = await db
        .select()
        .from(User)
        .where(eq(User.id, decoded.id))
        .limit(1);

        if(!user ){
            throw new ApiError(401, "User not found");
        }

        if(user.refreshToken !== refreshToken){
            throw new ApiError(401, "Invalid Refresh Token");
        }

        const newAccessToken = generateAcessToken(user.id, user.name, user.email);
        const newRefreshToken = generateRefreshToken(user.id);

        await db 
        .update(User)
        .set({ refreshToken: newRefreshToken })
        .where(eq(User.id, user.id));

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .cookie('accessToken', newAccessToken, options)
        .cookie('refreshToken', newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                "Access Token refreshed successfully"
            )
        );
            
})



const logoutUser = asyncHandler (async (req: Request, res: Response) => { 
   const result = await db
        .update(User)
        .set({ refreshToken: "" })
        .where(eq(User.id, req.user.id));

        const options = {
             httpOnly : true,
             secure : true
        }
        
        return res
        .status(200)
        .clearCookie('refreshToken', options)
        .clearCookie('accessToken',options )
        .json (new ApiResponse (200,{},"User logged Out"))
})



export { registerUser , loginUser,logoutUser , refreshAccessToken };