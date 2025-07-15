import {z} from 'zod';

export const docValidate = z.object({
    name: z.string().min(1),
    tags:z.string().min(1)
});






