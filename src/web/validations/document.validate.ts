import { z } from 'zod';

const createValidate = z.object({
    name: z.string().min(1, "Document name is required"),
    tags: z.string().min(1, "At least one tag is required"),
});

const updateValidate = z.object({
    name: z.string().min(1, "Document name cannot be empty").optional(),
    tags: z.string().min(1, "Tags cannot be empty").optional(),
});

const searchValidate = z.object({
    tags: z.string().optional(),
});

export {
    createValidate,
    updateValidate,
    searchValidate
}