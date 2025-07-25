import { z } from 'zod';

const createDTO = z.object({
    name: z.string().min(1, "Document name is required"),
    tags: z.string().min(1, "At least one tag is required"),
});

const updateDTO = z.object({
    name: z.string().min(1, "Document name cannot be empty").optional(),
    tags: z.string().min(1, "Tags cannot be empty").optional(),
});

const searchDTO = z.object({
    tags: z.string().optional(), // Can be comma-separated: "tag1,tag2"
});


export type CreateDocumentInput = z.infer<typeof createDTO>;
export type UpdateDocumentInput = z.infer<typeof updateDTO>;
export type SearchDocumentInput = z.infer<typeof searchDTO>;

export {
    createDTO,
    updateDTO,
    searchDTO
}