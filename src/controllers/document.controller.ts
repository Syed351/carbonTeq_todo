import { Request, Response } from "express";
import { Documents } from "../schema/document.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import ApiError from "../utils/ApiErrors";
import fs from "fs";
import path, { relative } from "path";
import { DocumentDTO, DocumentInput } from "../dtos/document.dto";
import {
  uploadDocumentService,
  getDocumentsService,
  deleteDocumentService,
  updateDocumentService,
  generateDownloadLinkService,
  downloadDocumentService,
  searchDocumentsService
} from "../services/document.service";



const uploadDocument = asyncHandler(async (req, res) => {
  const file = req.file;
  const user = req.user;
  const parsed = DocumentDTO.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid document data");

  if (!file) throw new ApiError(400, "File is required");

  const relativePath = path.join("uploads", file.filename);
  await uploadDocumentService(parsed.data, relativePath, user.id);
  res.status(201).json(new ApiResponse(201, "Document Uploaded Successfully"));
});

const getDocuments = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const documents = await getDocumentsService(email);
  res.status(200).json(new ApiResponse(200, documents, "Fetched documents"));
});

const deleteDocument = asyncHandler(async (req, res) => {
  await deleteDocumentService(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, {}, "Document deleted successfully"));
});

const updateDocument = asyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  const parsed = DocumentDTO.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid document data");

  await updateDocumentService(req.params.id, parsed.data, filePath);
  res.status(200).json(new ApiResponse(200, {}, "Document updated successfully"));
});

const generateDownloadLink = asyncHandler(async (req, res) => {
  const link = await generateDownloadLinkService(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, { downloadLink: link }, "Link generated"));
});

const downloadDocument = asyncHandler(async (req, res) => {
  const { path, filename } = await downloadDocumentService(req.params.token);

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/octet-stream");

  const stream = fs.createReadStream(path);
  stream.pipe(res);
});

const searchDocument = asyncHandler(async (req, res) => {
  const documents = await searchDocumentsService(req.query.tags as string);
  res.status(200).json(new ApiResponse(200, documents, "Search results"));
});


export {
  uploadDocument,
  getDocuments,
  deleteDocument,
  updateDocument,
  generateDownloadLink,
  downloadDocument,
  searchDocument
};