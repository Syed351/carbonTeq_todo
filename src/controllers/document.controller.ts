// controllers/document.controller.ts
import { Request, Response } from "express";
import { container } from "tsyringe";
import { asyncHandler } from "../utils/asyncHandler";
import { DocumentService } from "../services/document.service";
import { matchRes } from "@carbonteq/fp";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiErrors";
import { paginationValidate } from "../validations/pagination.validate";

const documentService = container.resolve(DocumentService);

// Upload
const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file!;
  const user = req.user!;
  const data = req.body;

  const result = await documentService.uploadDocument(file, user.id, { ...data, path: "" });

  return matchRes(result, {
    Ok: () => res.status(201).json(new ApiResponse(201, {}, "Document uploaded successfully")),
    Err: (err) => res.status(400).json(new ApiResponse(400, null, err)),
  });
});

// Get paginated documents
const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = paginationValidate.safeParse(req.query);

  if (!parseResult.success) {
    return res.status(400).json(new ApiResponse(400, {}, "Invalid pagination input"));
  }

  const pagination = parseResult.data;

  const result = await documentService.getDocuments(pagination);

  return matchRes(result, {
    Ok: (paginated) => res.status(200).json(new ApiResponse(200, paginated, "Documents fetched")),
    Err: (err) => res.status(500).json(new ApiResponse(500, null, err)),
  });
});

// Delete
const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const documentId = req.params.id;

  const result = await documentService.deleteDocument(documentId, user.id, user.role);

  return matchRes(result, {
    Ok: () => res.status(200).json(new ApiResponse(200, null, "Document deleted successfully")),
    Err: (err) => {
      const code = err.includes("authorized") ? 403 : 404;
      return res.status(code).json(new ApiResponse(code, null, err));
    },
  });
});

// Update
const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const documentId = req.params.id;
  const file = req.file;

  const result = await documentService.updateDocument(documentId, req.body, file);

  return matchRes(result, {
    Ok: () => res.status(200).json(new ApiResponse(200, null, "Document updated successfully")),
    Err: (err) => res.status(400).json(new ApiResponse(400, null, err)),
  });
});

// Generate Download Link
const generateDownloadLink = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const documentId = req.params.id;

  const result = await documentService.generateDownloadLink(documentId, user.id, process.env.JWT_SECRET!, req);

  return matchRes(result, {
    Ok: (link) => res.status(200).json(new ApiResponse(200, { downloadLink: link }, "Link generated")),
    Err: (err) => res.status(403).json(new ApiResponse(403, null, err)),
  });
});

// Download
const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;

  const result = await documentService.downloadDocument(token, process.env.JWT_SECRET!);

  return matchRes(result, {
    Ok: ({ filePath, rawFileName }) => {
      const safeFileName = rawFileName.replace(/[\r\n\"<>]/g, "_").replace(/\s+/g, "_");
      res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      return res.sendFile(filePath);
    },
    Err: (err) => {
      if (err.includes("expired")) throw new ApiError(401, "Download link expired");
      if (err.includes("Invalid")) throw new ApiError(401, "Invalid download link");
      throw new ApiError(404, err);
    },
  });
});

// Search
const searchDocument = asyncHandler(async (req: Request, res: Response) => {
  const { tags } = req.query;

  const result = await documentService.searchDocuments(tags as string | undefined);

  return matchRes(result, {
    Ok: (docs) => res.status(200).json(new ApiResponse(200, docs, "Documents found")),
    Err: (err) => res.status(500).json(new ApiResponse(500, null, err)),
  });
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
