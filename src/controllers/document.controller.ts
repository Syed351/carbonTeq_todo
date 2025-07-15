// controllers/document.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiErrors";
import jwt from "jsonwebtoken";

// Injected service with repository
import { DocumentService } from "../services/document.service";
import { DrizzleDocumentRepository } from "../imppl/drizzleDocumentRepository";
import { DrizzleUserRepository } from "../imppl/userdrizzle.repository";
const documentService = new DocumentService(
  new DrizzleDocumentRepository(),
  new DrizzleUserRepository()
);

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const user = req.user;
  const data = req.body;

  const relativePath = await documentService.uploadDocument(file!, user.id, { ...data, path: "" });

  return res.status(201).json(new ApiResponse(201, { path: relativePath }, "Document uploaded successfully"));
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  const email = req.body.email as string | undefined;
  const documents = await documentService.getDocuments(email);
  return res.status(200).json(new ApiResponse(200, documents, email ? "Documents by user email" : "All documents"));
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const user = req.user;
  await documentService.deleteDocument(documentId, user.id, user.role);
  return res.status(200).json(new ApiResponse(200, {}, "Document deleted successfully"));
});

export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const user = req.user;
  const file = req.file;
  const data = req.body;

  await documentService.updateDocument(documentId, user.id, file, data);
  return res.status(200).json(new ApiResponse(200, {}, "Document updated successfully"));
});

export const generateDownloadLink = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const documentId = req.params.id;
  const downloadLink = await documentService.generateDownloadLink(documentId, user.id, process.env.JWT_SECRET!, req);
  return res.status(200).json(new ApiResponse(200, { downloadLink }, "Download link generated"));
});

export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;
  try {
    const { filePath, rawFileName } = await documentService.downloadDocument(token, process.env.JWT_SECRET!);

    const safeFileName = rawFileName.replace(/[\r\n\"<>]/g, "_").replace(/\s+/g, "_");
    res.setHeader("Content-Disposition", `attachment;filename=\"${safeFileName}\"`);
    res.setHeader("Content-Type", "application/octet-stream");
    return res.sendFile(filePath);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new ApiError(401, "Download link expired");
    if (err instanceof jwt.JsonWebTokenError) throw new ApiError(401, "Invalid download link");
    console.error("Unexpected download error:", err);
    throw new ApiError(500, "Something went wrong");
  }
});

export const searchDocument = asyncHandler(async (req: Request, res: Response) => {
  const { tags } = req.query;
  const documents = await documentService.searchDocuments(tags as string | undefined);
  return res.status(200).json(new ApiResponse(200, documents, "Search results"));
});
