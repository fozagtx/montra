import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: "Enter valid Supabase URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, { message: "Enter valid Supabase key" }),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
