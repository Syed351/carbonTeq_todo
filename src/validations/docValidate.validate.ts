import {z} from 'zod';

export const docValidate = z.object({
    name: z.string().min(1),
    tags:z.string().min(1)
});

export const createDocSchema = z.object({
    name: z.string().min(1, "Document name is required"),
    tags: z.string().min(1, "At least one tag is required"),
});

export const updateDocSchema = z.object({
    name: z.string().min(1, "Document name cannot be empty").optional(),
    tags: z.string().min(1, "Tags cannot be empty").optional(),
});

export const searchDocSchema = z.object({
    tags: z.string().optional(), // Can be comma-separated: "tag1,tag2"
});

