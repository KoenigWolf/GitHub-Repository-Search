import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

type EnvType = z.infer<typeof envSchema>;

let cachedEnv: EnvType | null = null;

function parseEnv(): EnvType {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  // Only cache in production to allow test overrides
  if (process.env.NODE_ENV === "production") {
    cachedEnv = result.data;
  }

  return result.data;
}

export const env: EnvType = {
  get GITHUB_TOKEN() {
    return parseEnv().GITHUB_TOKEN;
  },
  get NODE_ENV() {
    return parseEnv().NODE_ENV;
  },
};

export function hasGitHubToken(): boolean {
  return Boolean(env.GITHUB_TOKEN);
}

export function isProduction(): boolean {
  return env.NODE_ENV === "production";
}
