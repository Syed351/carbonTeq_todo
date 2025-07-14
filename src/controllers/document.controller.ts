import { Request, Response } from "express";
import { Documents } from "../schema/document.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import ApiError from "../utils/ApiErrors";
import {v4 as uuidv4} from 'uuid';
import { docValidate } from "../validations/docValidate.validate";
import {User} from "../schema/user.schema"
import { eq, ilike , and} from "drizzle-orm";
import jwt from "jsonwebtoken";
import fs from "fs";
import {db} from '../db'
import path, { relative } from "path";


const uploadDocument = asyncHandler(async(req: Request,res:Response )=>{
    const file = req.file;
    const user = req.user;

    const parsed = docValidate.safeParse(req.body);
    if(!parsed.success){
        throw new ApiError(400,"Invalid document data")

    }
    const {name,tags} = parsed.data;

    if(!file ){
        throw new ApiError(400,"File is Required");

    }
const relativePath = path.join('uploads', file.filename);
    await db.insert(Documents).values({
        id: uuidv4(),
        name,
        tags,
        userId: user.id,
        path: relativePath,
        createdat: new Date(),
        updatedat: new Date()
    })
    res.status(201).json (
        new ApiResponse(201,"Document Uploaded Successfully")
    )
    console.log("Saved filename:", file.filename);
console.log("Saved relative path:", relativePath);

})

const getDocuments = asyncHandler(async(req:Request,res:Response)=>{
    const email = req.body.email as string;

    if(email){
        const [user]= 
        await db
        .select()
        .from(User)
        .where(eq(User.email,email));


        if(!user){
            throw new ApiError(404,"User not found");

        }
        const documents = await db 
        .select()
        .from(Documents)
        .where(eq(Documents.userId,user.id));

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        documents,
        "Document by user Email"
    )
  ) 

    }

    const allDocuments =
     await db 
     .select()
     .from(Documents);

 return res 
 .status(200)
 .json(new ApiResponse(
    200,
    allDocuments,
    "All documents"
 )
);
})

const deleteDocument = asyncHandler(async(req:Request ,res:Response)=>{
    const documentId = req.params.id;
    const user = req.user;
    
    if(!documentId){
        throw new ApiError(400,"select file or File deleted already ")
    }

    const [document] = await db
    .select()
    .from(Documents)
    .where(eq(Documents.id,documentId))

if(!document){
    throw new ApiError(404,"Document not Found")
}

if(document.userId === user.id || user.role === "Admin"){
try{
    fs.unlinkSync(document.path);

}catch(err){

    throw new ApiError (500,"File not Found")
}
await db
.delete(Documents)
.where(eq(Documents.id,documentId))

return res
.status(200)
.json(
    new ApiResponse(
    200,
    {},
    "Document deleted Successfully"
)
)
}
});

const updateDocument = asyncHandler(async (req:Request , res:Response ) =>{
    const documentId = req.params.id;
    const user = req.user;
    const file = req.file;
    const parsed = docValidate.safeParse(req.body);

    if(!parsed.success){
        throw new ApiError(400,"    Invalid document data");

    }

    const {name , tags} = parsed.data;

    const[document] = await db 
     .select()
     .from(Documents)
     .where(eq(Documents.id,documentId));

  if(!document){
    throw new ApiError (404 , "Document not found ");

  }
  
  let updatePath = file?.path;

  if(file?.path){
    try{
        fs.unlinkSync(document.path);
    }catch (err){
        console.warn("Old file Not Found ")
    }
}
   

  await db 
   .update(Documents)
   .set({
    name,
    tags,
    path:updatePath,
    updatedat: new Date()
   })
   .where(eq(Documents.id,documentId));

return res 
.status(200)
.json(new ApiResponse(
    200,
    {},
    "Document Updated Successfully "
)
)
});

const generateDownloadLink = asyncHandler(async (req:Request, res : Response)=>{
    const user = req.user;
    const documentId = req.params.id;

    const [document] = await db
    .select()
    .from(Documents)
    .where(eq(Documents.id,documentId));

  if(!document){
    throw new ApiError(403,"Document not found")
  }
  if(document.userId !== user.id){
    throw new ApiError(403,"Not Authorized to share this link")
  }
  const token = jwt.sign(
    {documentId , userId:user.id},
process.env.JWT_SECRET!,
{expiresIn:'5m'}
);
const downloadLink = `${req.protocol}://${req.get('host')}/api/v1/documents/download/${token}`;
res.json(
    new ApiResponse(
        200,
        {downloadLink},
        "Download Link generated"
    )
);

})


const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      documentId: string;
    };

    const [document] = await db
      .select()
      .from(Documents)
      .where(eq(Documents.id, decoded.documentId));

    if (!document) {
      throw new ApiError(403, "Document not found");
    }

    const absolutePath = path.join(process.cwd(),document.path);
const rawFileName = path.basename(document.path);
const safeFileName = rawFileName.replace(/[\r\n\"<>]/g, "_").replace(/\s+/g, "_");

    if (!fs.existsSync(absolutePath)) {
      throw new ApiError(404, "File does not exist on server");
    }

    res.setHeader("Content-Disposition",`attachment;filename="${safeFileName}"`);
    res.setHeader("Content-Type","application/octet-stream");

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
    throw new ApiError(401, "Download link expired");
  }
  if (err instanceof jwt.JsonWebTokenError) {
    throw new ApiError(401, "Invalid download link");
  }
  console.error("Unexpected download error:", err);
  throw new ApiError(500, "Something went wrong");

   
  }
});


const searchDocument = asyncHandler(async (req: Request, res: Response) => {
  const { tags } = req.query;
  const conditions: any[] = [];

  if (tags) {
    const tagsArray = typeof tags === "string"
      ? tags.split(",").map(tag => tag.trim().toLowerCase())
      : [];

    if (tagsArray.length > 0) {
      const likeConditions = tagsArray.map(tag =>
        ilike(Documents.tags, `%${tag}%`)
      );

      // ✅ Must match ALL tags (AND condition)
      conditions.push(...likeConditions);
    }
  }

  const documents = await db
    .select()
    .from(Documents)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res.status(200).json(
    new ApiResponse(200, documents, "Search Results")
  );
});


export {
    uploadDocument,
    getDocuments,
    deleteDocument,
    updateDocument,
    generateDownloadLink,
    downloadDocument,
    searchDocument

}